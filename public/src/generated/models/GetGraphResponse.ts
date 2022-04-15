/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UnisonHTNodeConfig } from './UnisonHTNodeConfig';

export type GetGraphResponse = {
    nodes: Array<{
        config: UnisonHTNodeConfig;
    }>;
};
