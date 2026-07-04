import { GOOGLE_SHEET_URL, DEFAULT_MONTH, DEFAULT_MONTH_COUNT } from "./config.js";
import { getSampleEvents } from "./sampleEvents.js";
import { loadSheetEvents } from "./sheets.js";
import { renderLegend, renderMonths, renderEventList } from "./render.js";
import { byId } from "./dom.js";

const today = new Date();
let events = [];
let anchorYear = today.getFullYear();
let anchorMonth = DEFAULT_MONTH;
let monthsToShow = DEFAULT_MONTH_COUNT;

function setStatus(msg){
  const el = byId("saveStatus");
  if(el) el.textContent = msg;
}

function render(){
  renderLegend();
  renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  renderEventList(events);
}

async function loadEvents(){
  setStatus("Loading events…");
  if(GOOGLE_SHEET_URL){
    try{
      events = await loadSheetEvents(GOOGLE_SHEET_URL);
      setStatus(`Loaded ${events.length} events from Google Sheets`);
    } catch(e){
      console.error(e);
      events = getSampleEvents(today);
      setStatus("Could not load Google Sheet — showing built-in sample events");
    }
  } else {
    events = getSampleEvents(today);
    setStatus("Showing sample events. Add a Google Sheet URL in js/config.js.");
  }
  render();
}

function bindControls(){
  byId("prevBtn").addEventListener("click", () => {
    anchorMonth -= 1;
    if(anchorMonth < 0){ anchorMonth = 11; anchorYear -= 1; }
    renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  });
  byId("todayBtn").addEventListener("click", () => {
    anchorYear = today.getFullYear();
    anchorMonth = today.getMonth();
    renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  });
  byId("nextBtn").addEventListener("click", () => {
    anchorMonth += 1;
    if(anchorMonth > 11){ anchorMonth = 0; anchorYear += 1; }
    renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  });
  byId("stepUp").addEventListener("click", () => {
    monthsToShow = Math.min(12, monthsToShow + 1);
    renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  });
  byId("stepDown").addEventListener("click", () => {
    monthsToShow = Math.max(1, monthsToShow - 1);
    renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  });
}

bindControls();
loadEvents();
