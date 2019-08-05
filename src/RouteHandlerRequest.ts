import {IncomingMessage, ServerResponse} from "http";
import {UnisonHT} from "./UnisonHT";
import {Method} from "./Method";

export interface RouteHandlerRequest {
    unisonht: UnisonHT;
    method: Method;
    url: string;
    parameters: { [id: string]: any };
    httpRequest?: IncomingMessage;
}
