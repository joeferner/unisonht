export interface ErrorWithStatusCode {
  statusCode: number;
}

export function setStatusCodeOnError(err: Error, statusCode: number): Error {
  (err as any as ErrorWithStatusCode).statusCode = statusCode;
  return err;
}

export function getStatusCodeFromError(err: Error): number | undefined {
  return (err as any as ErrorWithStatusCode).statusCode;
}
