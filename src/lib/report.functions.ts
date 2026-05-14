import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  department: z.string().min(1).max(50),
  date: z.string().min(1).max(50),
  operator: z.string().min(1).max(200),
  opsLogs: z
    .array(
      z.object({
        unit_tag: z.string(),
        value: z.number(),
        timestamp: z.string(),
        employee_id: z.string().nullable().optional(),
      })
    )
    .max(500),
  labResults: z
    .array(
      z.object({
        parameter_name: z.string(),
        value: z.number(),
        sample_type: z.string(),
        technician_name: z.string().optional(),
        timestamp: z.string(),
      })
    )
    .max(500),
  maintenance: z
    .array(
      z.object({
        asset: z.string(),
        notes: z.string(),
        recorded_by: z.string().optional(),
        recorded_at: z.string(),
      })
    )
    .max(200)
    .optional(),
});

export const generateDailyReport = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { draft: "AI is not configured.", error: true };
    }

    const summary = `Generate a professional Daily Operations Report for the LIFECO PMS 2026 system.

Department: ${data.department}
Date: ${data.date}
Operator: ${data.operator}

Operations log entries (${data.opsLogs.length}):
${data.opsLogs
  .slice(0, 200)
  .map((l) => `- ${l.unit_tag}: ${l.value} @ ${l.timestamp} (EID ${l.employee_id ?? "-"})`)
  .join("\n") || "None"}

Lab readings (${data.labResults.length}):
${data.labResults
  .slice(0, 200)
  .map((l) => `- ${l.parameter_name} = ${l.value} (${l.sample_type}) by ${l.technician_name ?? "-"}`)
  .join("\n") || "None"}

Maintenance records (${data.maintenance?.length ?? 0}):
${(data.maintenance ?? [])
  .map((m) => `- ${m.asset}: ${m.notes} — ${m.recorded_by ?? "-"} @ ${m.recorded_at}`)
  .join("\n") || "None"}

Write a structured shift report with these sections:
1. Executive Summary (2-3 lines)
2. Key Process Readings & Trends
3. Lab Quality Highlights
4. Maintenance & Anomalies
5. Recommendations / Follow-ups

Use clear headings and bullet points. Be factual and concise.`;

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
            { role: "system", content: "You are a senior plant operations engineer writing professional shift reports." },
            { role: "user", content: summary },
          ],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Report AI error:", res.status, txt);
        return { draft: `Failed to generate report (${res.status}).`, error: true };
      }
      const json = await res.json();
      const draft = json?.choices?.[0]?.message?.content ?? "(no response)";
      return { draft, error: false };
    } catch (e) {
      console.error("generateDailyReport failed:", e);
      return { draft: "Failed to reach AI service.", error: true };
    }
  });
