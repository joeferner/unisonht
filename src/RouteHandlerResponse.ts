import {ServerResponse} from "http";

export interface RouteHandlerResponse {
    httpResponse?: ServerResponse;
    send: (result?: any) => void;
}
