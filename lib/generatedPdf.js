import PDFDocument from "pdfkit";
import path from "node:path";

const FONT = path.join(process.cwd(), "node_modules", "@embedpdf", "fonts-arabic", "fonts", "NotoNaskhArabic-Regular.ttf");
function visualArabic(value) {
  return String(value || "")
    .replace(/N9 Library/gi, "مكتبة إن ناين")
    .replace(/PDF/gi, "بي دي إف")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\//g, " ـ ")
    .replace(/[:;"'_\-]/g, " ")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\ue000-\uf8ff]/gi, "")
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "");
}

export function createOfficialTextPdf(docData) {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", font: FONT, margins: { top: 54, right: 54, bottom: 58, left: 54 }, info: { Title: docData.title_ar, Author: "N9 Library" } });
    const chunks = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);
    pdf.registerFont("Naskh", FONT).font("Naskh");

    pdf.fillColor("#071A38").fontSize(20).text(visualArabic(docData.title_ar), { align: "right" });
    pdf.moveDown(0.4).strokeColor("#B58A2B").lineWidth(1).moveTo(54, pdf.y).lineTo(541, pdf.y).stroke();
    pdf.moveDown(0.7).fillColor("#526071").fontSize(10)
      .text(visualArabic(`المصدر الرسمي: ${docData.source_name || "جهة حكومية سعودية"}`), { align: "right" });
    pdf.text(visualArabic("نسخة PDF مولّدة من النص المنشور في المصدر الرسمي لتيسير القراءة والحفظ. يرجع إلى رابط الأصل عند الاستشهاد."), { align: "right" });
    pdf.moveDown(0.8).fillColor("#17243A").fontSize(12);

    const boilerplate = /(?:موقع حكومي|روابط المواقع الإلكترونية الرسمية|كيف تتحقق|تجربتك تخص|هيئة الحكومة الرقمية|ملفات تعريف الارتباط|جميع الحقوق محفوظة)/;
    const paragraphs = String(docData.content_text || "").replace(/\r/g, "").split(/\n+/).map((p) => p.trim()).filter((p) => p && !boilerplate.test(p));
    for (const paragraph of paragraphs) {
      pdf.text(visualArabic(paragraph), { align: "right", lineGap: 5 });
      pdf.moveDown(0.45);
    }
    pdf.end();
  });
}
