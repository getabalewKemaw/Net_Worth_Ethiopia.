"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMfoPartnersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500 font-medium">
      Redirecting to Business Owner Management...
    </div>
  );
}
