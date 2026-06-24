"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function hasRecoverySignal() {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    url.searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery" ||
    Boolean(url.searchParams.get("code") && url.searchParams.get("type") === "recovery") ||
    Boolean(hashParams.get("access_token") && hashParams.get("refresh_token"))
  );
}

export function AuthRecoveryRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sendToRecoveryPage = () => {
      if (pathname === "/redefinir-senha") return;

      const nextUrl = `/redefinir-senha${window.location.search}${window.location.hash}`;
      window.location.replace(nextUrl);
    };

    if (hasRecoverySignal()) {
      sendToRecoveryPage();
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
