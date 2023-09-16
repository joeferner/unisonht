export async function lircButtonPress(moduleName: string, remoteName: string, key: string): Promise<Response> {
  return await fetch(`/module/${moduleName}/${remoteName}?key=${encodeURIComponent(key)}`, {
    method: "POST",
  });
}
