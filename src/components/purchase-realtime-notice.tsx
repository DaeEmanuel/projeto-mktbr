"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function PurchaseRealtimeNotice({ userId }: { userId: string }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`orders-confirmed-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `buyer_id=eq.${userId}`,
          },
          (payload) => {
            const record = payload.new as { payment_status?: string; product_name?: string };
            if (record.payment_status === "Pagamento Confirmado") {
              setMessage(`Compra confirmada com sucesso! Seu acesso a ${record.product_name || "seu produto"} ja foi liberado.`);
            }
          },
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    } catch {
      return undefined;
    }
  }, [userId]);

  if (!message) return null;

  return (
    <div className="rounded-[1.25rem] border border-[#00c853]/40 bg-[#00c853]/10 p-4 text-sm font-black text-[#05281f] shadow-sm">
      {message}
    </div>
  );
}
