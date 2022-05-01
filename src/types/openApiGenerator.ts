import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { OpenApi } from './openApi/v3/OpenApi';
import { OpenApiParameter } from './openApi/v3/OpenApiParameter';
import { decoratedMethods } from './openApiDecorators';

const debug = Debug('unisonht:openApiGenerator');

export async function generateOpenApi(tsFiles: string[]): Promise<OpenApi> {
  const result: OpenApi = {
    openapi: '3.0.0',
    info: {
      title: 'UnisonHT',
      version: '1.0.0',
    },
    paths: {},
  };

  const tsconfigJsonPath = path.join(__dirname, '../../tsconfig.json');
  const configJson = await fs.promises.readFile(tsconfigJsonPath, 'utf8');
  const config = ts.parseConfigFileTextToJson('tsconfig.json', configJson);
  if (!config.config) {
    throw new Error(`invalid config: ${tsconfigJsonPath}`);
  }

  debug('generating open api using: %o', tsFiles);
  await Promise.all(
    tsFiles.map(async (tsFile) => {
      const s = await fs.promises.stat(tsFile);
      if (!s.isFile()) {
        throw new Error(`could not find file: ${tsFile}`);
      }
    }),
  );
  const program = ts.createProgram({
    rootNames: tsFiles,
    options: config.config,
  });
  const typeChecker = program.getTypeChecker();
  for (const sourceFile of program.getSourceFiles()) {
    const ctx = { sourceFile };

    for (const node of findChildOfKind(sourceFile, ts.SyntaxKind.MethodDeclaration)) {
      const methodDeclaration = node as ts.MethodDeclaration;
      const classDeclaration = findFirstParentOfKind(
        methodDeclaration,
        ts.SyntaxKind.ClassDeclaration,
      ) as ts.ClassDeclaration;
      if (!classDeclaration) {
        continue;
      }
      const decorator = getDecorator(ctx, methodDeclaration, ['MyPost', 'MyGet']);
      if (decorator) {
        const className = classDeclaration.name?.getText(sourceFile);
        const methodName = methodDeclaration.name.getText(sourceFile);
        if (className && methodName) {
          debug(`found decorator on %s.%s`, className, methodName);
          const decoratedMethod = decoratedMethods[className]?.[methodName];
          if (!decoratedMethod) {
            throw new Error('could not find decorator data');
          }
          let parameters: OpenApiParameter[] | undefined;
          if (decoratedMethod.queryParameters?.length > 0) {
            parameters = decoratedMethod.queryParameters.map((p): OpenApiParameter => {
              return {
                in: 'query',
                name: p.name,
              };
            });
          }

          const path = (result.paths[decoratedMethod.path] = result.paths[decoratedMethod.path] ?? {});
          path[decoratedMethod.method] = {
            parameters,
            responses: {
              200: {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          };
        }
      }
    }
  }

  return result;
}

function getDecorator(
  ctx: Context,
  methodDeclaration: ts.MethodDeclaration,
  decorators: string[],
): ts.Decorator | undefined {
  if (!methodDeclaration.decorators) {
    return undefined;
  }
  for (const decorator of methodDeclaration.decorators) {
    const identifier = findFirstChildOfKind(decorator.expression, ts.SyntaxKind.Identifier);
    if (!identifier) {
      continue;
    }
    const decoratorName = identifier.getText(ctx.sourceFile);
    if (decorators.includes(decoratorName)) {
      return decorator;
    }
  }
  return undefined;
}

function findFirstParentOfKind(node: ts.Node, kind: ts.SyntaxKind): ts.Node | undefined {
  while (node.parent) {
    if (node.parent.kind === kind) {
      return node.parent;
    }
    node = node.parent;
  }
  return undefined;
}

function findFirstChildOfKind(node: ts.Node, kind: ts.SyntaxKind): ts.Node | undefined {
  for (const child of findChildOfKind(node, kind)) {
    return child;
  }
  return undefined;
}

function findChildOfKind(node: ts.Node, kind: ts.SyntaxKind): Generator<ts.Node> {
  return findChild(node, (m) => m.kind === kind);
}

function* findChild(node: ts.Node, matcher: (node: ts.Node) => boolean): Generator<ts.Node> {
  if (matcher(node)) {
    yield node;
  }
  for (const child of node.getChildren()) {
    yield* findChild(child, matcher);
  }
}

function walkNodes(
  typeChecker: ts.TypeChecker,
  node: ts.Node,
  sourceFile: ts.SourceFile,
  fn: (node: ts.Node, depth: number) => boolean,
  depth?: number,
): void {
  depth = depth ?? 0;
  if (!fn(node, depth)) {
    return;
  }
  node.forEachChild((child) => walkNodes(typeChecker, child, sourceFile, fn, (depth ?? 0) + 1));
}

interface Context {
  sourceFile: ts.SourceFile;
}
