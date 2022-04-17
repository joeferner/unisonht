export function nameToUrl(name: string): string {
  return name.replace(" ", "_").toLocaleLowerCase();
}
