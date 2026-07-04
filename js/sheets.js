import { normalizeCategory } from "./categories.js";

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
  const idx=name => headers.indexOf(name);
  const titleIdx=idx("title"), startIdx=idx("start"), endIdx=idx("end"), catIdx=idx("category"), notesIdx=idx("notes");
  return rows.slice(1).map((r,i)=>{
    const title=(r[titleIdx]||"").trim();
    const start=(r[startIdx]||"").trim();
    const end=(r[endIdx]||start).trim();
    if(!title || start.length !== 10) return null;
    return {
      id:`sheet_${i}_${start}`,
      title,
      start,
      end:end.length===10 ? end : start,
      category:normalizeCategory(catIdx>=0 ? r[catIdx] : "tbd"),
      notes:notesIdx>=0 ? (r[notesIdx]||"").trim() : ""
    };
  }).filter(Boolean);
}

export async function loadSheetEvents(url){
  const response = await fetch(url, { cache:"no-store" });
  if(!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
  return rowsToEvents(parseCsv(await response.text()));
}
