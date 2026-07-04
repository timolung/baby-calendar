import { normalizeCategory } from "./categories.js";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

function isValidISODate(value) {
  if (!ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function getHeaderIndex(headers, names) {
  return names.map(name => headers.indexOf(name)).find(index => index >= 0) ?? -1;
}

function withCacheBuster(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_=${Date.now()}`;
}

function getSheetGid(url) {
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  return url.searchParams.get("gid") || hashParams.get("gid") || "0";
}

export function resolveGoogleSheetCsvUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  let url;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const isGoogleSheet = url.hostname === "docs.google.com" && url.pathname.includes("/spreadsheets/");
  if (!isGoogleSheet) return raw;

  if (url.searchParams.get("output") === "csv" || url.searchParams.get("tqx") === "out:csv") {
    return raw;
  }

  const publishedMatch = url.pathname.match(/\/spreadsheets\/d\/e\/([^/]+)/);
  if (publishedMatch) {
    const gid = getSheetGid(url);
    return `https://docs.google.com/spreadsheets/d/e/${publishedMatch[1]}/pub?gid=${encodeURIComponent(gid)}&single=true&output=csv`;
  }

  const sheetMatch = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (sheetMatch) {
    const gid = getSheetGid(url);
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  }

  return raw;
}

export function parseCsv(text){
  const rows=[]; let row=[]; let field=""; let inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i]; const next=text[i+1];
    if(ch==='"'){
      if(inQuotes && next==='"'){ field+='"'; i++; }
      else inQuotes=!inQuotes;
    } else if(ch===',' && !inQuotes){ row.push(field); field=""; }
    else if((ch==='\n' || ch==='\r') && !inQuotes){
      if(ch==='\r' && next==='\n') i++;
      row.push(field);
      if(row.some(cell => cell.trim() !== "")) rows.push(row);
      row=[]; field="";
    } else field+=ch;
  }
  row.push(field);
  if(row.some(cell => cell.trim() !== "")) rows.push(row);
  return rows;
}

export function rowsToEvents(rows){
  if(!rows.length) return [];
  const headers=rows[0].map(h => h.trim().toLowerCase());
  const titleIdx=getHeaderIndex(headers, ["title", "event", "name"]);
  const startIdx=getHeaderIndex(headers, ["start", "start date", "date"]);
  const endIdx=getHeaderIndex(headers, ["end", "end date"]);
  const catIdx=getHeaderIndex(headers, ["category", "type"]);
  const notesIdx=getHeaderIndex(headers, ["notes", "note", "description"]);

  if(titleIdx < 0 || startIdx < 0){
    throw new Error("CSV must include title and start columns");
  }

  return rows.slice(1).map((r,i)=>{
    const title=(r[titleIdx]||"").trim();
    const start=(r[startIdx]||"").trim();
    const end=(r[endIdx]||start).trim();
    if(!title || !isValidISODate(start)) return null;
    const normalizedEnd = isValidISODate(end) ? end : start;
    if(normalizedEnd < start) return null;
    return {
      id:`sheet_${i}_${start}`,
      title,
      start,
      end:normalizedEnd,
      category:normalizeCategory(catIdx>=0 ? r[catIdx] : "tbd"),
      notes:notesIdx>=0 ? (r[notesIdx]||"").trim() : ""
    };
  }).filter(Boolean);
}

export function rowsToCategories(rows){
  if(!rows.length) return {};
  const headers=rows[0].map(h => h.trim().toLowerCase());
  const keyIdx=getHeaderIndex(headers, ["key", "id"]);
  const labelIdx=getHeaderIndex(headers, ["label", "name", "category label", "category_label"]);
  const colorIdx=getHeaderIndex(headers, ["color", "hex", "colour", "category color", "category_color"]);

  if(keyIdx < 0 || colorIdx < 0){
    throw new Error("CSV must include key and color columns");
  }

  return rows.slice(1).reduce((categories, row) => {
    const key = normalizeCategory(row[keyIdx]);
    const label = key;
    const color = String(row[colorIdx] || "").trim();
    if(!key || !HEX_COLOR_RE.test(color)) return categories;
    categories[key] = { label: label.trim(), color };
    return categories;
  }, {});
}

export async function loadSheetEvents(sourceUrl){
  const csvUrl = resolveGoogleSheetCsvUrl(sourceUrl);
  const response = await fetch(withCacheBuster(csvUrl), {
    cache: "no-store"
  });
  if(!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
  return rowsToEvents(parseCsv(await response.text()));
}

export async function loadSheetCategories(sourceUrl){
  const csvUrl = resolveGoogleSheetCsvUrl(sourceUrl);
  const response = await fetch(withCacheBuster(csvUrl), {
    cache: "no-store"
  });
  if(!response.ok) throw new Error(`Category CSV fetch failed: ${response.status}`);
  return rowsToCategories(parseCsv(await response.text()));
}
