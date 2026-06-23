"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  notification_type: string;
  read_at: string | null;
  created_at: string;
};

const fallbackNotifications = [
  "Nova venda realizada",
  "Compra aprovada",
  "Novo aluno matriculado",
  "Novo comentário",
  "Assinatura renovada",
];

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function loadNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, notification_type, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications((data || []) as NotificationItem[]);
    }

    void loadNotifications();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setNotifications((current) => [payload.new as NotificationItem, ...current].slice(0, 10)),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid size-11 place-items-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Abrir notificacoes"
      >
        <Bell size={19} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[0.7rem] font-black text-white">
            {unreadCount > 10 ? "10" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-13 z-50 w-[min(90vw,360px)] rounded-2xl border border-slate-200 bg-white p-3 text-[#061421] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <p className="font-black">Central de notificações</p>
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-black text-red-600">{unreadCount}</span>
          </div>
          <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto">
            {notifications.length > 0 ? notifications.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-black">{item.title}</p>
                {item.body ? <p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p> : null}
                <p className="mt-2 text-[0.7rem] font-bold text-slate-400">{new Date(item.created_at).toLocaleString("pt-BR")}</p>
              </div>
            )) : fallbackNotifications.map((title) => (
              <div key={title} className="rounded-xl bg-slate-50 p-3 text-sm font-black">{title}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
