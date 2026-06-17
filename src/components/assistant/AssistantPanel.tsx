"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, Mic, Sparkles } from "lucide-react";
import { streamAnswer, QUICK_PROMPTS } from "@/lib/llm";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  tool?: string;
  thinking?: string;
  streaming?: boolean;
}

const intro: ChatMessage = {
  role: "assistant",
  text: "Hi — I'm the MaterialOps copilot. I can pull live batches, route material through the agent graph, forecast an event, draft a dispatch, or report sponsor impact.",
};

// Minimal typing for the Web Speech API.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([intro]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const ask = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query || busy) return;
      setInput("");
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: query },
        { role: "assistant", text: "", streaming: true },
      ]);

      for await (const chunk of streamAnswer(query)) {
        setMessages((prev) => {
          const next = [...prev];
          const idx = next.length - 1;
          const last = next[idx];
          if (last.role !== "assistant") return prev;
          // Build a NEW message object — updaters must stay pure so React
          // StrictMode's double-invocation doesn't duplicate streamed tokens.
          const updated: ChatMessage = { ...last };
          if (chunk.type === "thought") updated.thinking = chunk.text;
          else if (chunk.type === "tool") updated.tool = chunk.toolName;
          else if (chunk.type === "token") updated.text = last.text + (chunk.text ?? "");
          else if (chunk.type === "done") updated.streaming = false;
          next[idx] = updated;
          return next;
        });
      }
      setBusy(false);
    },
    [busy],
  );

  const startVoice = useCallback(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      void ask(transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [ask]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ops-purple text-white shadow-lg transition hover:opacity-90"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-ops-border bg-ops-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-ops-border bg-ops-navy px-4 py-3">
            <Bot className="h-5 w-5 text-ops-green" />
            <div>
              <div className="font-display text-sm font-semibold text-white">
                MaterialOps Copilot
              </div>
              <div className="text-[10px] text-white/45">
                tool-calling · grounded in live ops data
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                {m.role === "assistant" && m.thinking && (
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] italic text-ops-muted">{m.thinking}</span>
                  </div>
                )}
                {m.role === "assistant" ? (
                  <div
                    className="inline-block max-w-[88%] whitespace-pre-wrap rounded-lg bg-ops-bg px-3 py-2 text-[13px] leading-relaxed text-ops-ink"
                    dangerouslySetInnerHTML={{ __html: renderMd(m.text) }}
                  />
                ) : (
                  <div className="inline-block max-w-[88%] whitespace-pre-wrap rounded-lg bg-ops-purple px-3 py-2 text-[13px] leading-relaxed text-white">
                    {m.text}
                  </div>
                )}
                {m.streaming && !m.text && (
                  <span className="ml-1 inline-block animate-pulse text-ops-muted">▋</span>
                )}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((r) => (
                  <button
                    key={r}
                    onClick={() => ask(r)}
                    className="rounded-full border border-ops-border bg-ops-surface px-2.5 py-1 text-[11px] text-ops-muted transition hover:border-ops-purple hover:text-ops-ink"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-ops-border px-3 py-3"
          >
            <button
              type="button"
              onClick={startVoice}
              aria-label="Voice input"
              className={`flex h-9 w-9 items-center justify-center rounded-md border border-ops-border transition ${
                listening ? "bg-ops-red text-white" : "text-ops-muted hover:text-ops-ink"
              }`}
            >
              <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask, forecast, or dispatch…"
              className="flex-1 rounded-md border border-ops-border bg-ops-bg px-3 py-2 text-[13px] text-ops-ink outline-none focus:border-ops-purple"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-ops-purple text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/** Tiny, safe markdown renderer for **bold** and `code` only. */
function renderMd(text: string): string {
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/10 px-1 text-[12px]">$1</code>');
}
