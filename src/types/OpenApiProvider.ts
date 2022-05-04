import { Type } from 'tst-reflect';
import { OpenApi } from './openApi/v3/OpenApi';

export interface OpenApiProvider {
  get openApiTags(): string[];
  get apiUrlPrefix(): string;
  getOpenApiType(): Type | undefined;
  updateOpenApi(openApi: OpenApi): void;
}
