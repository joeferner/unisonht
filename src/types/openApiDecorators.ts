import Debug from 'debug';
import { JSONSchema7Definition } from 'json-schema';
import { Decorator, Method, Property, Type } from 'tst-reflect';
import { createJsonSchema } from 'tst-reflect-json-schema-generator';
import { OpenApi } from './openApi/v3/OpenApi';
import { OpenApiOperation } from './openApi/v3/OpenApiOperation';
import { OpenApiParameter } from './openApi/v3/OpenApiParameter';
import { OpenApiPath } from './openApi/v3/OpenApiPath';
import { OpenApiPaths } from './openApi/v3/OpenApiPaths';
import { OpenApiResponses } from './openApi/v3/OpenApiResponses';
import { OpenApiSchema } from './openApi/v3/OpenApiSchema';
import { OpenApiProvider } from './OpenApiProvider';

const debug = Debug('unisonht:openApiDecorators');

export function Get(_path: string) {
  return function (_target: any, _methodName: string, _descriptor: PropertyDescriptor) {};
}

export function Post(_path: string) {
  return function (_target: any, _methodName: string, _descriptor: PropertyDescriptor) {};
}

export function QueryParam(_options?: QueryParamOptions) {
  return function (_target: any, _methodName: string | symbol, _parameterIndex: number) {};
}

export function OpenApiResponse(_code: number, _description: string) {
  return function (_target: any, _methodName: string | symbol, _descriptor: PropertyDescriptor) {};
}

interface OpenApiProviderWithTypeAndMethods {
  openApiProvider: OpenApiProvider;
  openApiType: Type;
  methods: Method[];
}

export function createOpenApiFromOpenApiProviders(openApiProviders: OpenApiProvider[]): OpenApi {
  // const openApiTypes: Type[] = openApiProviders.map((p) => p.getOpenApiType()).filter((p): p is Type => !!p);

  const typeAndMethods = openApiProviders
    .flatMap((openApiProvider) => {
      const openApiType = openApiProvider.getOpenApiType();
      if (!openApiType) {
        return undefined;
      }
      return { openApiProvider, openApiType, methods: getOpenApiMethods(openApiType) };
    })
    .filter((tm): tm is OpenApiProviderWithTypeAndMethods => (tm?.methods?.length ?? 0) > 0);
  const jsonSchemaTypes: Type[] = typeAndMethods
    .flatMap((tm) => {
      return tm.methods.flatMap((m) => {
        return [...m.getParameters().map((p) => p.type), m.returnType];
      });
    })
    .map(getUnwrappedType)
    .filter((t) => {
      return t.fullName !== 'void' && t.fullName !== 'String';
    });
  const jsonSchema = createJsonSchema(jsonSchemaTypes);

  return {
    openapi: '3.0.0',
    info: {
      title: 'UnisonHT',
      version: '1.0.0',
    },
    paths: createPathsFromTypesAndMethods(typeAndMethods),
    components: {
      schemas: {
        ...updateJsonSchemaRefsToOpenApiRefs(jsonSchema.definitions ?? {}),
      },
    },
  };
}

function createPathsFromTypesAndMethods(typesAndMethods: OpenApiProviderWithTypeAndMethods[]): OpenApiPaths {
  const paths: OpenApiPaths = {};
  for (const typeAndMethods of typesAndMethods) {
    const type = typeAndMethods.openApiType;
    for (const method of typeAndMethods.methods) {
      const methodDecorator = method.getDecorators().find(isMethodDecorator);
      if (!methodDecorator) {
        throw new Error('could not find method decorator');
      }
      const httpMethod = getHttpMethodFromMethodDecorator(methodDecorator);
      const pathArg = methodDecorator.getArguments()[0];
      const path = evaluateString(typeAndMethods.openApiProvider, pathArg);
      const p = (paths[path] = paths[path] ?? {});
      if (p[httpMethod]) {
        throw new Error(`Method ${httpMethod} already exists on path ${path}`);
      }
      p[httpMethod] = {
        operationId: method.name,
        tags: typeAndMethods.openApiProvider.openApiTags,
        parameters: [],
        responses: getResponses(method),
      };
    }
  }
  return paths;
}

function getResponses(method: Method): OpenApiResponses {
  const responses: OpenApiResponses = {};
  method
    .getDecorators()
    .filter((d) => d.name === 'OpenApiResponse')
    .forEach((d) => {
      const args = d.getArguments();
      const code = args[0];
      const description = args[1];
      responses[code] = {
        description,
      };
    });

  const returnType = getUnwrappedType(method.returnType);
  if (returnType.name === 'void') {
    responses[204] = {
      description: 'OK',
    };
  } else {
    responses[200] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            $ref: `#/components/schemas/${returnType.name}`,
          },
        },
      },
    };
  }
  return responses;
}

function updateJsonSchemaRefsToOpenApiRefs(
  definitions: Record<string, JSONSchema7Definition>,
): Record<string, OpenApiSchema> {
  const seen: Set<any> = new Set<any>();
  const update = (obj: any): void => {
    if (seen.has(obj)) {
      return;
    }
    seen.add(obj);
    if (Array.isArray(obj)) {
      for (const i of obj) {
        update(i);
      }
    } else {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (key === '$ref') {
          obj[key] = value.replace('#/definitions/', '#/components/schemas/');
        } else {
          update(value);
        }
      }
    }
  };
  update(definitions);
  return definitions as Record<string, OpenApiSchema>;
}

function getOpenApiMethods(type: Type): readonly Method[] {
  return type.getMethods().filter((m) => {
    return m.getDecorators().some(isMethodDecorator);
  });
}

function isMethodDecorator(d: Decorator): boolean {
  return d.name === 'Post' || d.name === 'Get';
}

function evaluateString(objThis: any, str: string): any {
  const fn = Function(`return ${str};`);
  return fn.bind(objThis)();
}

export interface QueryParamOptions {
  enum: string;
}

function getHttpMethodFromMethodDecorator(methodDecorator: Decorator) {
  switch (methodDecorator.name) {
    case 'Post':
      return 'post';
    case 'Get':
      return 'get';
    default:
      throw new Error(`invalid method: ${methodDecorator.name}`);
  }
}

function getUnwrappedType(type: Type): Type {
  if (type.fullName === 'Promise') {
    const typeArgs = type.getTypeArguments();
    if (typeArgs.length !== 1) {
      throw new Error('promise missing type arguments');
    }
    type = typeArgs[0]!;
  }
  return type;
}
