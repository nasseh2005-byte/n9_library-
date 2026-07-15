import { filterDocs } from "@/lib/data";
import DocCard from "@/components/DocCard";
import Pagination from "@/components/Pagination";
import BackButton from "@/components/BackButton";

export default function TagPage({ params, searchParams }) {
  const tag = decodeURIComponent(params.tag);
  const page = searchParams?.page || "1";
  const res = filterDocs({ tag, page });
  return (
    <div className="grid gap-6">
      <BackButton fallback="/library" label="العودة إلى المكتبة" />
      <h1 className="text-2xl font-bold text-white">
        تاغ: <span className="text-saudi-light">{tag}</span>
        <span className="mr-3 text-base font-normal text-slate-400">({res.total} وثيقة)</span>
      </h1>
      <div className="grid gap-3 md:grid-cols-2">
        {res.items.map((d) => <DocCard key={d.id} d={d} />)}
      </div>
      <Pagination page={res.page} pages={res.pages} basePath={`/tags/${encodeURIComponent(tag)}`} />
    </div>
  );
}
