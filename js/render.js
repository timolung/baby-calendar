import { CATEGORIES, getCategory } from "./categories.js";
import { DOW, MONTH_NAMES, getWeeks, formatRange } from "./dateUtils.js";
import { escapeHtml } from "./dom.js";
import { openEventDetails } from "./modal.js";

function assignLanes(events, monthStartISO, monthEndISO){
  const relevant = events
    .filter(e => e.end >= monthStartISO && e.start <= monthEndISO)
    .sort((a,b) => a.start.localeCompare(b.start));
  const laneEnds=[];
  const laneOf={};
  relevant.forEach(e => {
    const clipStart = e.start < monthStartISO ? monthStartISO : e.start;
    const clipEnd = e.end > monthEndISO ? monthEndISO : e.end;
    let placed=false;
    for(let i=0;i<laneEnds.length;i++){
      if(laneEnds[i] < clipStart){ laneEnds[i]=clipEnd; laneOf[e.id]=i; placed=true; break; }
    }
    if(!placed){ laneEnds.push(clipEnd); laneOf[e.id]=laneEnds.length-1; }
  });
  return laneOf;
}

export function renderLegend(categoryKeys = Object.keys(CATEGORIES)){
  const seen = new Set();
  const items = categoryKeys.flatMap(key => {
    const c = getCategory(key);
    const signature = `${c.label}|${c.color}`.toLowerCase();
    if(seen.has(signature)) return [];
    seen.add(signature);
    return [`<span class="item"><span class="dot" style="background:${c.color}"></span>${escapeHtml(c.label)}</span>`];
  });
  document.getElementById("legend").innerHTML = items.join("");
}

export function renderMonths({events, anchorYear, anchorMonth, monthsToShow}){
  document.getElementById("currentMonthLabel").textContent = `${MONTH_NAMES[anchorMonth]} ${anchorYear}`;
  document.getElementById("monthsInput").value = monthsToShow;
  const container=document.getElementById("monthsContainer");
  container.innerHTML="";
  for(let i=0;i<monthsToShow;i++){
    let y=anchorYear, m=anchorMonth+i;
    y += Math.floor(m/12);
    m = ((m % 12) + 12) % 12;
    container.appendChild(buildMonthCard(y,m,events));
  }
}

function buildMonthCard(year, monthIndex0, events){
  const weeks = getWeeks(year, monthIndex0);
  const monthStartISO = weeks[0][0].iso;
  const monthEndISO = weeks[weeks.length - 1][6].iso;
  const laneOf = assignLanes(events, monthStartISO, monthEndISO);

  const card=document.createElement("div");
  card.className="month-card";

  const head=document.createElement("div");
  head.className="month-head";
  head.innerHTML=`<span class="m">${MONTH_NAMES[monthIndex0]}</span><span class="y">${year}</span>`;
  card.appendChild(head);

  const dowRow=document.createElement("div");
  dowRow.className="dow-row";
  dowRow.innerHTML=DOW.map(d=>`<span>${d}</span>`).join("");
  card.appendChild(dowRow);

  weeks.forEach(week => {
    const weekEl=document.createElement("div");
    weekEl.className="week";

    const dayRow=document.createElement("div");
    dayRow.className="day-row";
    week.forEach(cell => {
      const c=document.createElement("div");
      c.className="day-cell" + (cell.inMonth ? "" : " out") + (cell.isToday ? " today" : "");
      c.innerHTML=`<span class="num">${cell.day}</span>`;
      dayRow.appendChild(c);
    });
    weekEl.appendChild(dayRow);

    const weekStartISO=week[0].iso, weekEndISO=week[6].iso;
    const relevant=events.filter(e => e.end >= weekStartISO && e.start <= weekEndISO && (e.id in laneOf));
    const maxLane=relevant.reduce((mx,e)=>Math.max(mx,laneOf[e.id]),-1);

    const barsLayer=document.createElement("div");
    barsLayer.className="bars-layer";
    barsLayer.style.height=maxLane>=0 ? `${(maxLane+1)*19+4}px` : "4px";

    relevant.forEach(e => {
      const segStart = e.start < weekStartISO ? weekStartISO : e.start;
      const segEnd = e.end > weekEndISO ? weekEndISO : e.end;
      const colStart = week.findIndex(c => c.iso === segStart);
      const colEnd = week.findIndex(c => c.iso === segEnd);
      if(colStart < 0 || colEnd < 0) return;
      const isTrueStart = segStart === e.start;
      const isTrueEnd = segEnd === e.end;
      const bar=document.createElement("div");
      const classes=["bar"];
      classes.push(isTrueStart ? "cap-l" : "cont-l");
      classes.push(isTrueEnd ? "cap-r" : "cont-r");
      bar.className=classes.join(" ");
      bar.style.left=`${(colStart/7)*100}%`;
      bar.style.width=`${((colEnd-colStart+1)/7)*100}%`;
      bar.style.top=`${laneOf[e.id]*19+2}px`;
      bar.style.background=getCategory(e.category).color;
      bar.textContent=isTrueStart ? e.title : "";
      bar.title=`${e.title} (${formatRange(e.start,e.end)})`;
      bar.addEventListener("click", ev => { ev.stopPropagation(); openEventDetails(e); });
      barsLayer.appendChild(bar);
    });

    weekEl.appendChild(barsLayer);
    card.appendChild(weekEl);
  });

  return card;
}

export function renderEventList(events){
  const el=document.getElementById("eventList");
  if(events.length===0){ el.innerHTML=`<div class="empty-note">No events yet.</div>`; return; }
  el.innerHTML="";
  [...events].sort((a,b)=>a.start.localeCompare(b.start)).forEach(e => {
    const cat=getCategory(e.category);
    const row=document.createElement("div");
    row.className="event-row";
    row.innerHTML=`<span class="bar-color" style="background:${cat.color}"></span><span class="meta"><div class="t">${escapeHtml(e.title)}</div><div class="d">${formatRange(e.start,e.end)}</div></span>`;
    row.addEventListener("click",()=>openEventDetails(e));
    el.appendChild(row);
  });
}
