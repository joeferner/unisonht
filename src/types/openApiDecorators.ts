import Debug from 'debug';
import NestedError from 'nested-error-stacks';
import { Method, Property, Type } from 'tst-reflect';
import { OpenApi } from './openApi/v3/OpenApi';
import { OpenApiOperation } from './openApi/v3/OpenApiOperation';
import { OpenApiParameter } from './openApi/v3/OpenApiParameter';
import { OpenApiPath } from './openApi/v3/OpenApiPath';
import { OpenApiResponses } from './openApi/v3/OpenApiResponses';
import { OpenApiSchema } from './openApi/v3/OpenApiSchema';
import { OpenApiProvider } from './OpenApiProvider';

const debug = Debug('unisonht:openApiDecorators');

const openApiDecoratorData: OpenApiDecoratorData = {};

export function Get(path: string) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    debug('Found GET %s.%s', target.constructor.name, methodName);
    addRequestMethod(target.constructor.name, methodName, 'get', path);
  };
}

export function Post(path: string) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    debug('Found POST %s.%s', target.constructor.name, methodName);
    addRequestMethod(target.constructor.name, methodName, 'post', path);
  };
}

export function QueryParam(options?: QueryParamOptions) {
  return function (target: any, methodName: string | symbol, parameterIndex: number) {
    methodName = methodName.toString();
    const m = addMethod(target.constructor.name, methodName);
    m.queryParams.push({
      parameterIndex,
      options,
    });
  };
}

export function OpenApiResponse(code: number, description: string) {
  return function (target: any, methodName: string | symbol, descriptor: PropertyDescriptor) {
    methodName = methodName.toString();
    const m = addMethod(target.constructor.name, methodName);
    m.responses[code] = { description };
  };
}

export function openApiDecoratorsUpdateOpenApi(openApi: OpenApi, provider: OpenApiProvider, type: Type): void {
  const className = provider.constructor.name;
  const c = openApiDecoratorData[className];
  if (!c) {
    throw new Error(`Could not find decorators in class: ${className}`);
  }
  for (const method of Object.entries(c)) {
    const mType = type.getMethods().find((m) => m.name === method[0]);
    if (!mType) {
      throw new Error(`could not find method ${method[0]} in type ${className}`);
    }
    try {
      openApiDecoratorsUpdateOpenApiMethod(openApi, provider, method[1], mType);
    } catch (err) {
      throw new NestedError(`failed on method ${method[0]} in type ${className}`, err as Error);
    }
  }
}

function openApiDecoratorsUpdateOpenApiMethod(
  openApi: OpenApi,
  provider: OpenApiProvider,
  decoratorMethod: OpenApiDecoratorDataMethod,
  method: Method,
) {
  let path = decoratorMethod.path;
  if (path === undefined) {
    throw new Error('path not set');
  }
  const httpVerb = decoratorMethod.httpVerb;
  if (!httpVerb) {
    throw new Error('httpVerb not set');
  }

  path = evaluateString(provider, path) as string;
  const p: OpenApiPath = openApi.paths[path] ?? (openApi.paths[path] = {});
  if ((p as any)[httpVerb]) {
    throw new Error(`path ${path} with verb ${httpVerb} already set`);
  }

  let parameters: OpenApiParameter[] | undefined;
  for (const queryParam of decoratorMethod.queryParams) {
    const methodParameter = method.getParameters()[queryParam.parameterIndex];
    if (!methodParameter) {
      throw new Error(`could not get parameter index ${queryParam}`);
    }

    const schema = typeToOpenApiSchema(methodParameter.type, provider, queryParam.options);
    if (!schema) {
      throw new Error(`invalid type for parameter index ${queryParam}`);
    }

    parameters = parameters || [];
    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.entries(schema.properties)) {
        parameters.push({
          in: 'query',
          name: prop[0],
          schema: prop[1] as OpenApiSchema,
        });
      }
    } else {
      parameters.push({
        in: 'query',
        name: methodParameter.name,
        required: !methodParameter.optional,
        schema,
      });
    }
  }

  const responses: OpenApiResponses = {};

  const returnSchema = typeToOpenApiSchema(method.returnType, provider);
  if (returnSchema === null) {
    responses[204] = { description: 'Success' };
  } else {
    responses[200] = {
      description: 'Success',
      content: {
        'application/json': {
          schema: typeToOpenApiSchema(method.returnType, provider),
        },
      },
    };
  }

  for (const entry of Object.entries(decoratorMethod.responses)) {
    responses[entry[0]] = {
      description: entry[1].description,
    };
  }

  const op: OpenApiOperation = {
    operationId: method.name,
    tags: provider.openApiTags,
    parameters,
    responses,
  };
  (p as any)[httpVerb] = op;
}

function typeToOpenApiSchema(type: Type, provider: OpenApiProvider, options?: QueryParamOptions): OpenApiSchema | null {
  if (type.fullName === 'undefined' || type.fullName === 'null') {
    return null;
  } else if (type.fullName === 'true' || type.fullName === 'false') {
    return {
      type: 'boolean',
    };
  } else if (type.literalValue) {
    return {
      type: 'string',
      enum: [type.literalValue],
    };
  } else if (type.types.length > 1) {
    let types = type.types.map((t) => typeToOpenApiSchema(t, provider, options)).filter((t) => t) as OpenApiSchema[];
    if (types.length === 0) {
      return null;
    }
    const stringEnumTypes = types.filter((t) => t.type === 'string' && t.enum);
    if (stringEnumTypes.length > 1) {
      const stringEnumType: OpenApiSchema = {
        type: 'string',
        enum: stringEnumTypes.flatMap((t) => t.enum || []),
      };
      const nonStringEnumTypes = types.filter((t) => !(t.type === 'string' && t.enum));
      types = [stringEnumType, ...nonStringEnumTypes];
    }
    if (types[0]) {
      return types[0];
    }
    return {
      oneOf: types,
    };
  } else if (type.isNumber()) {
    return {
      type: 'number',
    };
  } else if (type.isEnum()) {
    return {
      type: 'string',
      enum: type.getEnum()?.getValues(),
    };
  } else if (type.isArray()) {
    const elemType = type.getTypeArguments()[0];
    if (!elemType) {
      throw new Error('could not get element type of array');
    }
    const items = typeToOpenApiSchema(elemType, provider, options);
    if (!items) {
      throw new Error('could not get element items from array');
    }
    const schema: OpenApiSchema = {
      type: 'array',
      items,
    };
    return schema;
  } else if (type.fullName === 'String') {
    const schema: OpenApiSchema = {
      type: 'string',
    };
    if (options?.enum) {
      schema.enum = evaluateString(provider, options.enum);
    }
    return schema;
  } else if (type.fullName === 'Boolean') {
    const schema: OpenApiSchema = {
      type: 'boolean',
    };
    return schema;
  } else if (type.fullName === 'void') {
    return null;
  } else if (type.fullName === 'Promise') {
    const arg = type.getTypeArguments()[0];
    if (!arg) {
      throw new Error('missing type argument for promise');
    }
    return typeToOpenApiSchema(arg, provider, options);
  } else {
    const required: string[] = [];
    const properties: { [propertyName: string]: OpenApiSchema } = {};
    for (const prop of getProperties(type)) {
      const propSchema = typeToOpenApiSchema(prop.type, provider, options);
      if (propSchema === null) {
        throw new Error(`could not convert property ${prop.name} or type ${type.name}`);
      }
      properties[prop.name] = propSchema;
      if (!prop.optional) {
        required.push(prop.name);
      }
    }
    const schema: OpenApiSchema = {
      type: 'object',
      properties,
      required,
    };
    return schema;
  }
}

function getProperties(type: Type): Property[] {
  const properties = [...type.getProperties()];
  if (type.baseType) {
    properties.push(...getProperties(type.baseType));
  }
  return properties;
}

function evaluateString(objThis: any, str: string): any {
  const fn = Function(`return ${str};`);
  return fn.bind(objThis)();
}

function addRequestMethod(className: string, methodName: string, httpVerb: string, path: string) {
  const m = addMethod(className, methodName);
  m.httpVerb = httpVerb;
  m.path = path;
}

function addMethod(className: string, methodName: string) {
  const c = (openApiDecoratorData[className] = openApiDecoratorData[className] ?? {});
  return (c[methodName] = c[methodName] ?? { queryParams: [], responses: {} });
}

interface OpenApiDecoratorData {
  [className: string]: OpenApiDecoratorDataClass;
}

interface OpenApiDecoratorDataClass {
  [methodName: string]: OpenApiDecoratorDataMethod;
}

interface OpenApiDecoratorDataMethod {
  httpVerb?: string;
  path?: string;
  queryParams: OpenApiDecoratorDataQueryParam[];
  responses: { [code: number]: OpenApiDecoratorDataResponse };
}

interface OpenApiDecoratorDataQueryParam {
  parameterIndex: number;
  options?: QueryParamOptions;
}

interface OpenApiDecoratorDataResponse {
  description: string;
}

export interface QueryParamOptions {
  enum: string;
}
