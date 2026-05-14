import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are LIFECO PMS Assistant — a technical helper for the LIFECO Plant Management System (LIFECO PMS 2026).

You help plant operators, lab technicians and engineers with:
- Ammonia plants (AMM1, AMM2): equipment like 101-J Air Compressor, 102-J Feed Gas, 103-J Syn Gas, 105-J Ref. Comp, 104-J Circulator, H-101 Primary Reformer, R-101 Secondary Reformer, HTS/LTS Converters, Methanator, R-501 Ammonia Converter.
- Desalination units (DEMIN1, DEMIN2): Sea Water Intake Pumps, Brine Recirculation Pumps, Distillers D-1 / D-2, Vacuum Ejectors.
- Nitrogen plant: ZR 460 Air Compressor, Air Dryer Units, Cold Box, Expansion Turbine.
- Lab parameters: pH, Conductivity, Hardness, Dew Point, NH3, H2, N2, CH4, CO, CO2, O2, Silica, Chlorides, TDS, Iron, etc.
- Daily logging, maintenance records, and safe operating ranges.

Keep answers concise, accurate and operator-friendly. Use bullet points for lists. If a request is unsafe or unclear, ask a clarifying question.`;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "AI Assistant is not configured. LOVABLE_API_KEY is missing.", error: true };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...data.messages,
          ],
        }),
      });

      if (res.status === 429) {
        return { reply: "Rate limit reached. Please try again in a moment.", error: true };
      }
      if (res.status === 402) {
        return { reply: "AI credits exhausted. Please add credits in Lovable Cloud > Workspace > Usage.", error: true };
      }
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error:", res.status, txt);
        return { reply: `AI service error (${res.status}).`, error: true };
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "(no response)";
      return { reply, error: false };
    } catch (e) {
      console.error("askAssistant failed:", e);
      return { reply: "Failed to reach the AI service.", error: true };
    }
  });
