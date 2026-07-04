export const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function pad(n){ return String(n).padStart(2,"0"); }

export function toISO(y,m,d){
  const dt = new Date(y,m,d);
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
}

export function getWeeks(year, monthIndex0){
  const first = new Date(year, monthIndex0, 1);
  const startDow = first.getDay();
  const gridStart = new Date(year, monthIndex0, 1 - startDow);
  const weeks = [];
  for(let w=0; w<6; w++){
    const week = [];
    for(let d=0; d<7; d++){
      const dt = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w*7 + d);
      week.push({
        iso: toISO(dt.getFullYear(), dt.getMonth(), dt.getDate()),
        day: dt.getDate(),
        inMonth: dt.getMonth() === monthIndex0 && dt.getFullYear() === year,
        isToday: toISO(dt.getFullYear(), dt.getMonth(), dt.getDate()) === toISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
      });
    }
    weeks.push(week);
  }
  return weeks;
}

export function formatRange(start,end){
  const [sy,sm,sd] = start.split("-").map(Number);
  const [ey,em,ed] = end.split("-").map(Number);
  if(sy===ey && sm===em){
    return sd===ed ? `${MONTH_SHORT[sm-1]} ${sd}, ${sy}` : `${MONTH_SHORT[sm-1]} ${sd}–${ed}, ${sy}`;
  }
  if(sy===ey) return `${MONTH_SHORT[sm-1]} ${sd} – ${MONTH_SHORT[em-1]} ${ed}, ${sy}`;
  return `${MONTH_SHORT[sm-1]} ${sd}, ${sy} – ${MONTH_SHORT[em-1]} ${ed}, ${ey}`;
}
