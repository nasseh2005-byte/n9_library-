import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const raw = process.env.MEMBERS_JSON;
if (!raw) {
  throw new Error("MEMBERS_JSON is required. Keep it in the environment; never commit it.");
}

const members = JSON.parse(raw);
if (!Array.isArray(members) || members.length === 0) {
  throw new Error("MEMBERS_JSON must be a non-empty JSON array.");
}

const outputUrl = new URL("../private-data/n9-members.xlsx", import.meta.url);
const outputPath = fileURLToPath(outputUrl);
const headers = ["user", "pin_salt", "pin_hash", "name", "office", "role", "active", "added_at"];
const rows = members.map((member) => headers.map((key) => member[key] ?? ""));

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("members");
const lastRow = rows.length + 1;

sheet.getRange(`A1:H${lastRow}`).values = [headers, ...rows];
sheet.getRange("A1:H1").format = {
  fill: "#E5E7EB",
  font: { bold: true, color: "#111827" },
  borders: { preset: "outside", style: "thin", color: "#CBD5E1" },
};
sheet.getRange(`H2:H${lastRow}`).format.numberFormat = "yyyy-mm-dd";
sheet.getRange(`A1:H${lastRow}`).format.autofitColumns();
sheet.getRange("A:A").format.columnWidthPx = 110;
sheet.getRange("B:B").format.columnWidthPx = 235;
sheet.getRange("C:C").format.columnWidthPx = 440;
sheet.getRange("D:D").format.columnWidthPx = 220;
sheet.getRange("E:E").format.columnWidthPx = 160;
sheet.freezePanes.freezeRows(1);
const table = sheet.tables.add(`A1:H${lastRow}`, true, "MembersTable");
table.showFilterButton = true;
table.showBandedRows = false;

await fs.mkdir(new URL("../private-data/", import.meta.url), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Created ${outputPath} with ${members.length} member(s).`);
