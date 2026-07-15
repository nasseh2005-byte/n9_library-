import { Suspense } from "react";
import { currentPublicUser, publicUserView } from "@/lib/publicUsers";
import AccountPanel from "./AccountPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "حسابي — N9 LIBRARY" };
export default async function AccountPage() {
  const user = await currentPublicUser();
  return <Suspense><AccountPanel user={publicUserView(user)} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} /></Suspense>;
}
