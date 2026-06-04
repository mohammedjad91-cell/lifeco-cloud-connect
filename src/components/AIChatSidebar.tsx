import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X, MessageSquare, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant } from "@/lib/assistant.functions";

interface Msg { role: "user" | "assistant"; content: string; }

const GREETING: Msg = {
  role: "assistant",
  content:
    "LIFECO Technical AI online. Ask me about plant procedures, maintenance tips, equipment limits or troubleshooting steps for the Nitrogen, Ammonia or Demin units.",
};

export default function AIChatSidebar() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "⚠ Unable to reach AI service. Check connectivity and retry." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass-card neon-border flex items-center justify-center text-primary shadow-[0_0_25px_hsl(var(--primary)/0.5)]"
        title="LIFECO Technical AI"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] glass-card neon-border flex flex-col overflow-hidden"
          >
            <header className="px-4 py-3 border-b border-border flex items-center gap-2 bg-secondary/30">
              <Bot className="w-5 h-5 text-primary" />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-sm font-bold neon-text tracking-wider">LIFECO TECHNICAL AI</h2>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Process Expert · Online</p>
              </div>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <Bot className="w-4 h-4 text-primary mt-1 shrink-0" />}
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-foreground border border-border"
                  }`}>
                    {m.content}
                  </div>
                  {m.role === "user" && <UserIcon className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-border flex gap-2 bg-secondary/20">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask procedure, tip, limit…"
                disabled={busy}
                className="bg-background/60"
              />
              <Button onClick={send} disabled={busy || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
