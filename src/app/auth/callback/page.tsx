"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: handle OIDC/SAML callback, exchange code for JWT, store firm_id scoped token.
    const timer = setTimeout(() => {
      router.replace("/app/dashboard");
    }, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-slate-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Completing authentication...
      </div>
    </div>
  );
}
