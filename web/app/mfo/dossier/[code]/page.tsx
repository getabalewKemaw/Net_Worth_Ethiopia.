"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function LegacyDossierRedirect({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams.code) {
      router.replace(`/dossier/${resolvedParams.code}`);
    }
  }, [resolvedParams.code, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-medium">
      Redirecting to verified dossier...
    </div>
  );
}
