"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SalesRealtimeNotice({ userId }: { userId: string }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`sales-confirmed-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `author_id=eq.${userId}`,
        },
        (payload) => {
          const record = payload.new as { payment_status?: string; product_name?: string; buyer_name?: string };
          if (record.payment_status === "Pagamento Confirmado") {
            setMessage(`Nova venda realizada: ${record.product_name || "produto MKTBR"} para ${record.buyer_name || "cliente"}.`);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!message) return null;

  return (
    <div className="rounded-[1.25rem] border border-[#00c853]/40 bg-[#00c853]/10 p-4 text-sm font-black text-[#05281f] shadow-sm">
      {message}
    </div>
  );
}
