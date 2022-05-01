export const decoratedMethods: DecoratedMethods = {};

export function MyPost(path: string): (target: Object, propertyKey: string) => void {
  return function (target: Object, functionName: string): void {
    const f = (decoratedMethods[target.constructor.name] = decoratedMethods[target.constructor.name] ?? {});
    f[functionName] = { queryParameters: [], ...f[functionName], method: 'post', path };
  };
}

export function MyGet(path: string): (target: Object, propertyKey: string) => void {
  return function (target: Object, functionName: string): void {
    const f = (decoratedMethods[target.constructor.name] = decoratedMethods[target.constructor.name] ?? {});
    f[functionName] = { queryParameters: [], ...f[functionName], method: 'get', path };
  };
}

export function MyQueryParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void {
  return function (target: Object, functionName: string, parameterIndex: number): void {
    const c = (decoratedMethods[target.constructor.name] = decoratedMethods[target.constructor.name] ?? {});
    const f = (c[functionName] = {
      method: 'get',
      path: '/',
      queryParameters: [],
      ...c[functionName],
    });
    f.queryParameters[parameterIndex] = { name };
  };
}

export interface DecoratedMethods {
  [targetName: string]: {
    [functionName: string]: DecoratedMethod;
  };
}

export interface DecoratedMethod {
  method: 'get' | 'post';
  path: string;
  queryParameters: { name: string }[];
}
