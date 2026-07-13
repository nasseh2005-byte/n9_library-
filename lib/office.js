import { getUploads } from "./members";
import { getCases } from "./cases";
import { readAudit } from "./audit";

// إحصاءات مكتب واحد + سجل تدقيقه
export function officeStats(office) {
  const uploads = getUploads().filter((u) => u.office === office);
  const cases = getCases().filter((c) => c.office === office);
  const byVis = { public: 0, office: 0, private: 0 };
  uploads.forEach((u) => { byVis[u.visibility] = (byVis[u.visibility] || 0) + 1; });
  const byType = {};
  uploads.forEach((u) => { byType[u.type] = (byType[u.type] || 0) + 1; });
  const byMember = {};
  [...uploads, ...cases].forEach((x) => { byMember[x.owner] = (byMember[x.owner] || 0) + 1; });
  const openCases = cases.filter((c) => c.status === "مفتوحة").length;
  // مهل قريبة الانقضاء (خلال 7 أيام)
  const soon = cases.filter((c) => {
    if (!c.deadline) return false;
    const d = Math.ceil((new Date(c.deadline) - Date.now()) / 86400000);
    return d >= 0 && d <= 7;
  }).map((c) => ({ id: c.id, title: c.title, deadline: c.deadline,
    days: Math.ceil((new Date(c.deadline) - Date.now()) / 86400000) }));

  return {
    uploads: uploads.length, cases: cases.length, openCases,
    byVis, byType, byMember, soon,
    audit: readAudit(office, 60),
  };
}
