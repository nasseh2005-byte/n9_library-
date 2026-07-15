"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function FavoriteButton({ id }) {
  const [state, setState] = useState({ ready: false, authenticated: false, active: false });
  useEffect(() => {
    fetch("/api/favorites").then((res) => res.json()).then((data) => setState({ ready: true, authenticated: data.authenticated, active: data.favorites?.includes(id) })).catch(() => setState((s) => ({ ...s, ready: true })));
  }, [id]);
  if (!state.ready) return <button className="btn-ghost" disabled>☆ المفضلة</button>;
  if (!state.authenticated) return <Link className="btn-ghost" href={`/account?next=${encodeURIComponent(`/doc/${id}`)}`}>☆ سجّل للحفظ</Link>;
  async function toggle() {
    const active = !state.active;
    setState((s) => ({ ...s, active }));
    const response = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    if (!response.ok) setState((s) => ({ ...s, active: !active }));
  }
  return <button onClick={toggle} className="btn-ghost" aria-pressed={state.active}>{state.active ? "★ محفوظة" : "☆ أضف للمفضلة"}</button>;
}
