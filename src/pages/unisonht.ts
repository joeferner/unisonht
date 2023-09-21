export function toggleSidebar(): void {
  document.querySelectorAll(".sidebar-wrapper").forEach((elem): void => {
    const div = elem as HTMLDivElement;
    let newWidth;
    if (div.style.width === undefined || div.style.width === "" || div.style.width.startsWith("0")) {
      newWidth = "var(--sidebar-width)";
    } else {
      newWidth = "0";
    }
    div.style.width = newWidth;
    div.style.minWidth = newWidth;
    div.style.maxWidth = newWidth;
  });
}
