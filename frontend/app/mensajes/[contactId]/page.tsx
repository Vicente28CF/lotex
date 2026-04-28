import { SiteHeader } from "@/components/site-header";
import { ConversationThread } from "@/components/conversation-thread";
import { Suspense } from "react";

export default async function MensajesPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;

  return (
    <main className="flex flex-col min-h-screen pb-20 md:pb-0">
      <SiteHeader />
      <div className="flex-1 mx-auto w-full max-w-2xl px-0 sm:px-4 sm:py-6">
        <div className="flex flex-col h-[calc(100vh-120px)] sm:rounded-3xl sm:border border-line/60 bg-white overflow-hidden shadow-sm">
          <Suspense fallback={
            <div className="flex items-center justify-center flex-1">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand border-t-coral"/>
            </div>
          }>
            <ConversationThread contactId={contactId} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
