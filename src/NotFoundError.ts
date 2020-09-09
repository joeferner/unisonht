export class NotFoundError extends Error {
    private readonly _url: string;

    constructor(url: string) {
        super(`"${url}" not found`);
        this._url = url;
    }

    get url(): string {
        return this._url;
    }
}
