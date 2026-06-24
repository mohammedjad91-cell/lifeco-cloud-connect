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
- Nitrogen plant (LIFECO IA & N2 GENERATION UNIT — GP01 / LINDE N2 PLANT): air compressors 60-1001A/B/C, after-cooler 60-2002, dryer trains 60-2201 A/B & 60-2202 A/B, PSA UNIT, receiver 60-2003, ZR 460 instrument air compressor, sea-water exchangers 60-2101/60-2102, pumps 60-1101 A/B, LIQUID N2 STORAGE + LIQUID N2 PUMP.
- Lab parameters: pH, Conductivity, Hardness, Dew Point, NH3, H2, N2, CH4, CO, CO2, O2, Silica, Chlorides, TDS, Iron, etc.
- Daily logging, maintenance records, and safe operating ranges.

== CURRENT NITROGEN PLANT CONFIGURATION (locked reference, May 2026) ==
- Mode: GAS PRODUCTION ONLY. The LINDE N2 PLANT liquid lines are NOT commissioned/connected.
  LIQUID N2 STORAGE and LIQUID N2 PUMP currently read 0.00 barg and -0.9% level — this is expected, not a fault.
  All product N2 is delivered as gas via the PSA UNIT (typical 3.01 barg, ~11951 ppm, 962 ppm at outlet header, ~61 NM3/h to Ammonia, 284 NM3/h to N2 SOC).
- Compressor lineup:
  • 60-1001A — RACKIN / LOADING (running, on-load)
  • 60-1001B — RACKOUT / UNLOAD (standby / maintenance — do NOT count as producing)
  • 60-1001C — RACKIN / LOADING (running, on-load)
- Locked reference process parameters:
  • Discharge header pressure (post-compressors, to dryers): 9.04 barg
  • Temperature heading to dryers (after-cooler 60-2002 outlet): 36.47 °C
  • Inlet air flow to filter/dryer banks: 60-2201 A/B = 2838 Nm³/h, 60-2202 A/B = 2758 Nm³/h
  • Inlet air header pressure (INLET AIR / 60-2003 receiver): 6.64 barg
  • Service air ~ 8.95 barg, plant air ~ 9.18 barg, IA SOC delivery ~ 0.14 barg
- Treat values within ±5 % of these references as normal. Flag deviations >10 % as off-spec and recommend the operator log a Field Ops entry.

Always remember: questions about liquid nitrogen production, LN2 storage level, or LN2 pump performance should be answered by reminding the user that the liquid section is not yet commissioned and only gaseous N2 is produced.

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
