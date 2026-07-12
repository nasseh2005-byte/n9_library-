import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const font = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "N9 LIBRARY — المكتبة القانونية السعودية",
  description:
    "أرشيف الأنظمة واللوائح والتشريعات السعودية — بحث ذكي وتصنيفات وتاغات. المصدر: المركز الوطني للوثائق والمحفوظات.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={font.className}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
