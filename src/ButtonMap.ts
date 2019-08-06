import {NextFunction} from "./UnisonHT";
import {RouteHandlerResponse} from "./RouteHandlerResponse";
import {RouteHandlerRequest} from "./RouteHandlerRequest";

export interface ButtonMap {
    [key: string]: (
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ) => Promise<void>;
}
