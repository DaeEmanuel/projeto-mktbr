"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function getRecoveryRedirectPath(pathname: string) {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = url.searchParams.get("code");
  const queryType = url.searchParams.get("type");
  const hashType = hashParams.get("type");
  const hasHashSession = Boolean(hashParams.get("access_token") && hashParams.get("refresh_token"));
  const isRecovery = queryType === "recovery" || hashType === "recovery" || hasHashSession;

  if (code && pathname !== "/auth/callback") {
    return `/auth/callback?code=${encodeURIComponent(code)}&type=recovery&next=/redefinir-senha`;
  }

  if (isRecovery && pathname !== "/redefinir-senha") {
    return `/redefinir-senha${window.location.search}${window.location.hash}`;
  }

  return null;
}

export function AuthRecoveryRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const recoveryPath = getRecoveryRedirectPath(pathname);
    if (recoveryPath) {
      window.location.replace(recoveryPath);
      return;
    }

    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = createClient();
      const listener = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/redefinir-senha");
        }
      });
      subscription = listener.data.subscription;
    } catch {
      subscription = undefined;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
