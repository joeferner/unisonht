/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GetGraphResponseEdge } from './GetGraphResponseEdge';
import type { GetGraphResponseNode } from './GetGraphResponseNode';

export type GetGraphResponse = {
    nodes: Array<GetGraphResponseNode>;
    edges: Array<GetGraphResponseEdge>;
};
