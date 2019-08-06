import {NextFunction} from "./UnisonHT";
import {RouteHandlerResponse} from "./RouteHandlerResponse";
import {RouteHandlerRequest} from "./RouteHandlerRequest";
import {ButtonMap} from "./ButtonMap";

export * from './UnisonHT';
export * from './UnisonHTPlugin';
export * from './UnisonHTDevice';
export * from './UnisonHTMode';
export * from './DeviceStatus';
export * from './RouteHandlerRequest';
export * from './RouteHandlerResponse';
export * from './StandardKey';
export * from './ButtonMap';

export async function handleButtonMap(
    buttonMap: ButtonMap,
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction
): Promise<void> {
    const k = buttonMap[key];
    if (!k) {
        next();
        return;
    }
    await k(request, response, next);
}
