import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionAccess } from "@/lib/sessions";
import BackButton from "@/components/ui/BackButton";
import SessionRoom from "@/components/session/SessionRoom";

export const metadata = {
  title: "Sesi Live — FunPython",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const access = await getSessionAccess(id, user.id, user.role);
  if (!access) redirect("/app/classes");

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
      <div className="mb-5">
        <BackButton
          href={access.isTeacher ? "/dashboard" : "/app/classes"}
          label="Kelas"
        />
      </div>
      <SessionRoom sessionId={id} currentUserId={user.id} />
    </div>
  );
}
