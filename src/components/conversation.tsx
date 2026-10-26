"use client";

import { ArrowUp, MessageCircle, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export function Conversation({ initialMessages, sessionId }: { initialMessages: ChatMessage[]; sessionId: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setText("");
    setError("");
    setBusy(true);
    setMessages((current) => [...current, { id: `draft-${Date.now()}`, role: "user", content: message }]);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      const result = (await response.json()) as { error?: string; message?: ChatMessage };
      if (!response.ok || !result.message) {
        setMessages((current) => current.slice(0, -1));
        setText(message);
        throw new Error(result.error ?? "Balasan belum berhasil dibuat.");
      }
      setMessages((current) => [...current, result.message!]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="soft-card flex min-h-[min(68vh,680px)] flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-[#edf0f5] px-5 py-4 sm:px-6">
        <span className="grid size-10 place-items-center rounded-xl bg-[#f1f0ff] text-[#5956d6]"><MessageCircle size={19} /></span>
        <div><p className="text-sm font-semibold">Lingo English tutor</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8a94a6]"><span className="size-1.5 rounded-full bg-[#55ae7b]" /> Ready to practice</p></div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {!messages.length && (
          <div className="mx-auto max-w-md py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f1f0ff] text-[#5956d6]"><Sparkles size={21} /></span>
            <h2 className="mt-4 font-semibold">Let&apos;s start a conversation!</h2>
            <p className="mt-2 text-sm leading-6 text-[#7c879a]">Ceritakan harimu dalam bahasa Inggris, atau coba: <span className="text-[#5956d6]">“What do you like to do on weekends?”</span></p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${message.role === "user" ? "rounded-br-md bg-[#5956d6] text-white" : "rounded-bl-md bg-[#f5f6fa] text-[#39455a]"}`}>
              {message.content}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-[#f5f6fa] px-4 py-3 text-sm text-[#818ba0]"><span className="loading loading-dots loading-sm" /> Thinking...</div></div>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#edf0f5] p-4 sm:p-5">
        {error && <div role="alert" className="alert alert-error mb-3 py-2 text-sm">{error}</div>}
        <form onSubmit={submit} className="flex items-end gap-2 rounded-xl border border-[#e6e9f0] bg-white p-2 pl-4 focus-within:border-[#aaa7ef] focus-within:ring-2 focus-within:ring-[#5956d6]/10">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
            maxLength={1000}
            rows={1}
            aria-label="Tulis pesan dalam bahasa Inggris"
            placeholder="Write your message in English..."
            className="max-h-32 min-h-10 flex-1 resize-y border-0 bg-transparent py-2 text-sm outline-none placeholder:text-[#a0a8b6]"
          />
          <button type="submit" disabled={busy || !text.trim()} aria-label="Kirim pesan" className="btn btn-square btn-sm border-0 bg-[#5956d6] text-white hover:bg-[#4744bf] disabled:bg-[#e8e7f8]">
            {busy ? <span className="loading loading-spinner loading-xs" /> : <ArrowUp size={17} />}
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-[#98a1b0]">AI tutor can make mistakes. Keep practicing and have fun!</p>
      </div>
    </section>
  );
}
