import "./globals.css";
import { IBM_Plex_Sans_Arabic, Amiri } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const font = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// خط العناوين الرسمي - الطابع القانوني الفخم
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://n9library.vercel.app"),
  title: {
    default: "N9 LIBRARY — المكتبة القانونية السعودية",
    template: "%s — N9 LIBRARY",
  },
  description:
    "أرشيف الأنظمة واللوائح والتشريعات السعودية — بحث ذكي وتصنيفات وتاغات ومساعد قانوني مدموج. المصدر: المركز الوطني للوثائق والمحفوظات.",
  manifest: "/manifest.json",
  applicationName: "N9 LIBRARY",
  openGraph: { title: "N9 LIBRARY", description: "المكتبة القانونية السعودية الرقمية", type: "website" },
};

export const viewport = { themeColor: "#0B1220" };

// يضبط الثيم قبل رسم الصفحة لمنع الوميض
const themeScript = `(function(){try{var t=localStorage.getItem('n9-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${font.className} ${amiri.variable}`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
