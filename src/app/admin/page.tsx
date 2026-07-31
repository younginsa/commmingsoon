import { redirect } from "next/navigation";
import { AdminBoard } from "@/components/admin/AdminBoard";
import { TopNav } from "@/components/TopNav";
import { isAuthed } from "@/lib/auth";
import { getProjects } from "@/lib/store";
import { CHALLENGE_TOTAL } from "@/data/projects";

export const dynamic = "force-dynamic";

export const metadata = { title: "Project · John Burn Archive" };

export default async function AdminPage() {
  if (!(await isAuthed())) redirect("/");

  const projects = await getProjects();
  const released = projects.filter((p) => p.status === "released").length;

  return (
    <div className="min-h-screen bg-paper">
      <TopNav released={released} total={CHALLENGE_TOTAL} forceLight />
      <main className="pt-14 md:pt-16">
        <AdminBoard initial={projects} total={CHALLENGE_TOTAL} />
      </main>
    </div>
  );
}
