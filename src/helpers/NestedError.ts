export function NestedError(message: string, cause: unknown): Error {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Error(message, { cause });
}
