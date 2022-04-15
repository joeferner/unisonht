/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetGraphResponse } from '../models/GetGraphResponse';
import type { GetModeResponse } from '../models/GetModeResponse';
import type { SetModeRequest } from '../models/SetModeRequest';
import type { SetModeResponse } from '../models/SetModeResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @returns GetModeResponse Ok
     * @throws ApiError
     */
    public static getMode(): CancelablePromise<GetModeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mode',
        });
    }

    /**
     * @param requestBody
     * @returns SetModeResponse
     * @throws ApiError
     */
    public static setMode(
        requestBody: SetModeRequest,
    ): CancelablePromise<SetModeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mode',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid mode`,
            },
        });
    }

    /**
     * @returns GetGraphResponse Ok
     * @throws ApiError
     */
    public static getGraph(): CancelablePromise<GetGraphResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/graph',
        });
    }

}