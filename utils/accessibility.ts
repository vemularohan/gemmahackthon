/**
 * Announces a message to screen readers using an ARIA live region.
 */
export function announceToScreenReader(message: string) {
  if (typeof document === "undefined") return;

  let announceDiv = document.getElementById("sr-announcer");
  
  if (!announceDiv) {
    announceDiv = document.createElement("div");
    announceDiv.id = "sr-announcer";
    announceDiv.setAttribute("aria-live", "assertive");
    announceDiv.setAttribute("aria-atomic", "true");
    announceDiv.style.position = "absolute";
    announceDiv.style.width = "1px";
    announceDiv.style.height = "1px";
    announceDiv.style.padding = "0";
    announceDiv.style.margin = "-1px";
    announceDiv.style.overflow = "hidden";
    announceDiv.style.clip = "rect(0, 0, 0, 0)";
    announceDiv.style.whiteSpace = "nowrap";
    announceDiv.style.border = "0";
    document.body.appendChild(announceDiv);
  }

  // Brief timeout to ensure the change triggers screen reader speech
  announceDiv.textContent = "";
  setTimeout(() => {
    if (announceDiv) {
      announceDiv.textContent = message;
    }
  }, 100);
}

/**
 * Toggles class names on elements based on accessibility selections.
 */
export function checkKeyboardAccessibility(e: React.KeyboardEvent, callback: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    callback();
  }
}
