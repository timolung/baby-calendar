export function getSampleEvents(today = new Date()) {
  const y = today.getFullYear();
  const y2 = y + 1;
  return [
    { id: "sample1", title: "Baby born", start: `${y}-09-11`, end: `${y}-09-12`, category: "baby", notes: "" },
    { id: "sample2", title: "Family visit", start: `${y}-09-14`, end: `${y}-10-11`, category: "family", notes: "" },
    { id: "sample3", title: "Shay FMLA and research", start: `${y}-10-11`, end: `${y}-12-04`, category: "shay", notes: "" },
    { id: "sample4", title: "Family support block", start: `${y}-12-07`, end: `${y}-12-18`, category: "tbd", notes: "Add details in Google Sheets later" },
    { id: "sample5", title: "Research and holidays", start: `${y}-12-21`, end: `${y2}-01-03`, category: "shay", notes: "" },
    { id: "sample6", title: "Timo second month", start: `${y2}-01-04`, end: `${y2}-01-30`, category: "baby", notes: "" },
    { id: "sample7", title: "Timo third month", start: `${y2}-02-01`, end: `${y2}-02-28`, category: "baby", notes: "" },
    { id: "sample8", title: "Family visit", start: `${y2}-03-01`, end: `${y2}-03-14`, category: "family", notes: "" },
    { id: "sample9", title: "Vacation block", start: `${y2}-03-15`, end: `${y2}-03-31`, category: "vacation", notes: "" },
    { id: "sample10", title: "Family visit", start: `${y2}-04-01`, end: `${y2}-05-02`, category: "family", notes: "" },
    { id: "sample11", title: "Schedule block", start: `${y2}-05-03`, end: `${y2}-05-14`, category: "shay", notes: "" }
  ];
}
