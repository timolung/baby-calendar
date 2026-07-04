export function byId(id) {
  return document.getElementById(id);
}

export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
