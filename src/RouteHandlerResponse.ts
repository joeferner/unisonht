export interface SendResponse {
    statusCode: number;
    contentType: string;
    content: string;
}

export type RouteHandlerResponseSendResult = string | SendResponse | any;

export interface RouteHandlerResponse {
    send: (result?: RouteHandlerResponseSendResult) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}
