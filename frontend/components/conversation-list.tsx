"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { fetchMyConversations } from "@/lib/api";
import type { ContactRequest } from "@/lib/types";

export function ConversationList() {
  const { auth } = useAuth();
  const [conversations, setConversations] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    setIsLoading(true);
    fetchMyConversations(auth)
      .then((data) => {
        setConversations(data);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar las conversaciones."))
      .finally(() => setIsLoading(false));
  }, [auth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand border-t-coral" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-line/60 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sand">
          <svg className="h-8 w-8 text-stone/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ink">No tienes mensajes</h3>
        <p className="mt-1 text-sm text-stone">
          Cuando contactes a un vendedor o te contacten, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((contact) => {
        const isUnread = contact.status === "pending" || contact.status === "replied";
        const isSeller = contact.terreno?.title !== undefined;
        const contactName = isSeller ? contact.buyerName : "Tú";
        const lastMessageText = contact.lastMessage?.body ?? contact.message;
        const lastMessageTime = contact.lastMessage
          ? new Date(contact.lastMessage.createdAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })
          : new Date(contact.createdAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            });

        return (
          <Link
            key={contact.id}
            href={`/mensajes/${contact.id}`}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 transition hover:bg-sand ${
              isUnread
                ? "border-coral/20 bg-coral/[0.02]"
                : "border-line/60 bg-white"
            }`}
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sand text-lg font-semibold text-ink/60">
              {contact.buyerName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {contact.buyerName}
                </h3>
                <span className="flex-shrink-0 text-[11px] text-stone/60">
                  {lastMessageTime}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm text-stone/80">
                {contact.terreno?.title ?? "Terreno"}
              </p>
              <p className="mt-1 truncate text-xs text-stone/60">
                {lastMessageText}
              </p>
            </div>
            {isUnread && (
              <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-coral" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
