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

export function tabClick(event: PointerEvent): void {
  const clickedTab = event.target as HTMLButtonElement | null;
  if (!clickedTab) {
    throw new Error("invalid click");
  }
  const tabId = clickedTab.getAttribute("data-tab");
  if (!tabId) {
    throw new Error("tab missing data-tab attribute");
  }
  const newActiveTabContentDiv = document.getElementById(tabId) as HTMLDivElement | null;
  if (!newActiveTabContentDiv) {
    throw new Error(`could not find tab ${tabId}`);
  }

  // move active tab
  const tabChildren = clickedTab.parentElement?.children;
  if (tabChildren) {
    for (let i = 0; i < tabChildren.length; i++) {
      const child = tabChildren.item(i);
      child?.classList.remove("active");
    }
  }
  clickedTab.classList.add("active");

  // move active content
  const contentChildren = newActiveTabContentDiv.parentElement?.children;
  if (contentChildren) {
    for (let i = 0; i < contentChildren.length; i++) {
      const child = contentChildren.item(i);
      child?.classList.remove("active");
    }
  }
  newActiveTabContentDiv.classList.add("active");
}
