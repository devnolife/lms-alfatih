import { notFound } from "next/navigation";
import { verifyCertificate } from "@/lib/badges";

export const dynamic = "force-dynamic";

const PROJECT_TITLE: Record<string, string> = {
  "informatika-kelas-7": "Informatika Kelas 7 (Fase D)",
};

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cert = await verifyCertificate(token);
  if (!cert) notFound();

  const title = PROJECT_TITLE[cert.projectKey] ?? cert.projectKey;
  const issued = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(cert.issuedAt);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
      <div className="w-full rounded-[2rem] border-[5px] border-[var(--color-almost-black)] bg-white p-8 text-center shadow-[0_10px_0_var(--color-almost-black)]">
        <div className="text-6xl">🏆</div>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-[var(--color-silver)]">
          Sertifikat Penyelesaian
        </p>
        <h1
          className="mt-3 text-2xl text-[var(--color-almost-black)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          {title}
        </h1>
        <p className="mt-6 text-sm text-[var(--color-charcoal)]">
          Diberikan kepada
        </p>
        <p
          className="mt-1 text-3xl text-[var(--color-duo-green-dark)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          {cert.holderName}
        </p>
        <p className="mt-6 text-sm text-[var(--color-charcoal)]">
          karena telah menyelesaikan seluruh 6 Level kurikulum Informatika
          dengan gemilang. 🎉
        </p>
        <div className="mt-8 border-t-2 border-dashed border-[var(--color-cloud)] pt-4 text-xs text-[var(--color-silver)]">
          <p>Diterbitkan: {issued}</p>
          <p className="mt-1 break-all font-mono">Token: {cert.verifyToken}</p>
          <p className="mt-2 font-bold text-[var(--color-duo-green)]">
            ✓ Terverifikasi
          </p>
        </div>
      </div>
    </div>
  );
}
