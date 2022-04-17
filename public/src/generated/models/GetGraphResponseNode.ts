/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GetGraphResponseNodeInput } from './GetGraphResponseNodeInput';
import type { GetGraphResponseNodeOutput } from './GetGraphResponseNodeOutput';
import type { UnisonHTNodeConfig } from './UnisonHTNodeConfig';

export type GetGraphResponseNode = {
    id: string;
    name: string;
    config: UnisonHTNodeConfig;
    inputs: Array<GetGraphResponseNodeInput>;
    outputs: Array<GetGraphResponseNodeOutput>;
};
