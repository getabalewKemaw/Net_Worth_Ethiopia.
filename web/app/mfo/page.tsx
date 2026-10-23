"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MfoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-medium">
      Redirecting to portal...
    </div>
  );
}
