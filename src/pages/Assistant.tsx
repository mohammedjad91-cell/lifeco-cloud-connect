import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { askAssistant } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, ArrowLeft, Loader2, Bot, User as UserIcon } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string; }

export default function Assistant() {
  const ask = useServerFn(askAssistant);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm the LIFECO PMS Assistant. Ask me about plant equipment, lab parameters, or how to use the system." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

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
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't reach the AI service." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold neon-text tracking-wider">AI Assistant</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">LIFECO PMS Helper</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Main
        </Button>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 gap-4">
        <div className="flex-1 glass-card p-4 overflow-y-auto space-y-3 min-h-[400px]">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && <Bot className="w-5 h-5 text-primary mt-1 shrink-0" />}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-foreground border border-border"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && <UserIcon className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />}
            </motion.div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about equipment, parameters, procedures…"
            disabled={busy}
            autoFocus
          />
          <Button onClick={send} disabled={busy || !input.trim()} className="gap-1.5">
            <Send className="w-4 h-4" /> Send
          </Button>
        </div>
      </main>
    </div>
  );
}
