import { getCategory } from "./categories.js";
import { formatRange } from "./dateUtils.js";
import { escapeHtml } from "./dom.js";

export function openEventDetails(selectedEvent) {
  const category = getCategory(selectedEvent.category);
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${escapeHtml(selectedEvent.title)}</h3>
      <div class="event-row event-row-static">
        <span class="bar-color modal-color" style="background:${category.color}"></span>
        <span class="meta">
          <div class="d">${formatRange(selectedEvent.start, selectedEvent.end)}</div>
          <div class="d">${escapeHtml(category.label)}</div>
        </span>
      </div>
      ${selectedEvent.notes ? `<div class="notes">${escapeHtml(selectedEvent.notes)}</div>` : ""}
      <div class="modal-actions">
        <button class="btn-primary" id="modalClose" type="button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) backdrop.remove();
  });
  backdrop.querySelector("#modalClose").addEventListener("click", () => backdrop.remove());
}
