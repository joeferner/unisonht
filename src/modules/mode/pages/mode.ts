export async function modeSwitch(moduleName: string, mode: string): Promise<void> {
  const disableButtons = (disable: boolean): void => {
    document.querySelectorAll(".btn-switch-mode").forEach((e) => {
      (e as HTMLButtonElement).disabled = disable;
    });
  };

  try {
    disableButtons(true);
    const resp = await fetch(`/module/${moduleName}/switch?mode=${encodeURIComponent(mode)}`, {
      method: "POST",
    });
    if (!resp.ok) {
      throw new Error(`invalid response: ${resp.status} ${resp.statusText}`);
    }
    document.location.reload();
  } catch (err) {
    console.error(`failed to switch mode ${mode}`, err);
    disableButtons(false);
    const errorMode = document.getElementById("error-mode") as HTMLDivElement;
    errorMode.classList.remove("display-none");
  }
}
