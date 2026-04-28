import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { ConversationList } from "@/components/conversation-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mensajes | LoteX",
  description: "Tus conversaciones con compradores y vendedores",
};

export default function MensajesPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold text-ink">Mensajes</h1>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand border-t-coral" />
            </div>
          }
        >
          <ConversationList />
        </Suspense>
      </div>
    </main>
  );
}
