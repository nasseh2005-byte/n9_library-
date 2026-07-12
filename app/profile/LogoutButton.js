"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button className="btn-ghost text-xs"
      onClick={async () => { await fetch("/api/member-auth", { method: "DELETE" }); router.push("/"); router.refresh(); }}>
      تسجيل الخروج
    </button>
  );
}
