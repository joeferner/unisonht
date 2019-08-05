import {UnisonHT} from "./UnisonHT";
import {RouteHandlerRequest} from "./RouteHandlerRequest";

export interface UnisonHTPlugin {
    initialize?(unisonht: UnisonHT): Promise<void>;

    handleKeyPress(key: string, request: RouteHandlerRequest): Promise<void>;
}
