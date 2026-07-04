import { GOOGLE_SHEET_URL, GOOGLE_SHEET_CATEGORIES_URL, DEFAULT_MONTH, DEFAULT_MONTH_COUNT } from "./config.js";
import { getSampleEvents } from "./sampleEvents.js";
import { normalizeCategory, setCategories } from "./categories.js";
import { toISO } from "./dateUtils.js";
import { loadSheetCategories, loadSheetEvents } from "./sheets.js";
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
  const visibleEvents = getVisibleEvents();
  const visibleCategoryKeys = getVisibleCategoryKeys(visibleEvents);
  renderLegend(visibleCategoryKeys);
  renderMonths({ events, anchorYear, anchorMonth, monthsToShow });
  renderEventList(visibleEvents);
}

function getVisibleRange(){
  let endYear = anchorYear, endMonth = anchorMonth + monthsToShow - 1;
  endYear += Math.floor(endMonth / 12);
  endMonth = ((endMonth % 12) + 12) % 12;
  const endDate = new Date(endYear, endMonth + 1, 0);
  return {
    start: toISO(anchorYear, anchorMonth, 1),
    end: toISO(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  };
}

function getVisibleEvents(){
  const range = getVisibleRange();
  return events.filter(event => event.end >= range.start && event.start <= range.end);
}

function getVisibleCategoryKeys(visibleEvents){
  return [...new Set(visibleEvents.map(event => normalizeCategory(event.category)))];
}

async function loadCategories(){
  const categorySources = [GOOGLE_SHEET_CATEGORIES_URL, GOOGLE_SHEET_URL].filter(Boolean);
  for(const source of categorySources){
    try{
      const categories = await loadSheetCategories(source);
      setCategories(categories);
      return true;
    } catch(e){
      console.warn("Could not load Google Sheet categories from source; trying fallback", e);
    }
  }
  return false;
}

async function loadEvents(){
  setStatus("Loading events…");
  if(GOOGLE_SHEET_URL){
    try{
      await loadCategories();
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
    render();
  });
  byId("todayBtn").addEventListener("click", () => {
    anchorYear = today.getFullYear();
    anchorMonth = today.getMonth();
    render();
  });
  byId("nextBtn").addEventListener("click", () => {
    anchorMonth += 1;
    if(anchorMonth > 11){ anchorMonth = 0; anchorYear += 1; }
    render();
  });
  byId("stepUp").addEventListener("click", () => {
    monthsToShow = Math.min(12, monthsToShow + 1);
    render();
  });
  byId("stepDown").addEventListener("click", () => {
    monthsToShow = Math.max(1, monthsToShow - 1);
    render();
  });
}

bindControls();
loadEvents();
