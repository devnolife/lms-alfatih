import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import TeacherNav from "@/components/teaching/TeacherNav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  return (
    <div className="min-h-screen bg-[var(--color-snow)]">
      <TeacherNav displayName={user.displayName} />
      {children}
    </div>
  );
}
