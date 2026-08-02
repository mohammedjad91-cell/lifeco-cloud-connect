import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  section: z.enum(["OPS", "LAB"]),
  plantName: z.string().max(120),
  periodLabel: z.string().max(120),
  from: z.string().max(40),
  to: z.string().max(40),
  rows: z
    .array(
      z.object({
        report_date: z.string(),
        shift: z.string(),
        work_category: z.string(),
        severity: z.string(),
        status: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        equipment_tag: z.string().nullable().optional(),
        supervisor_name: z.string().nullable().optional(),
      })
    )
    .max(300),
});

export const explainReports = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return { text: "خدمة الذكاء الاصطناعي غير مهيأة.", error: true };

    const lines = data.rows
      .map(
        (r) =>
          `- ${r.report_date} | ${r.shift} | ${r.work_category} | ${r.severity} | ${r.status} | ${r.title}${
            r.equipment_tag ? ` (${r.equipment_tag})` : ""
          }${r.description ? ` — ${r.description}` : ""}`
      )
      .join("\n");

    const prompt = `أنت مهندس عمليات/كيميائي أول في مجمع أمونيا ويوريا. اكتب شرحًا تحليليًا احترافيًا بالعربية لتقارير ${
      data.section === "LAB" ? "المعمل" : "التشغيل"
    } التالية.

الجهة: ${data.plantName}
الفترة: ${data.periodLabel} (${data.from} → ${data.to})
عدد السجلات: ${data.rows.length}

السجلات:
${lines || "لا يوجد"}

اكتب بالتنسيق التالي وبنقاط موجزة:
1. ملخص تنفيذي (٢-٣ أسطر)
2. الأعمال الروتينية — أبرز ما تم
3. الأعمال غير الروتينية والانحرافات
4. الحالات الحرجة/العالية والمعدات المتكررة
5. التوصيات والمتابعة المطلوبة

كن واقعيًا ولا تخترع بيانات غير موجودة.

بعد إنهاء النسخة العربية، اكتب سطرًا يحتوي فقط على العلامة:
===EN===
ثم أعد نفس الشرح بالإنجليزية بنفس الأقسام (لأنه يُستخدم في ملف PDF).`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: "أنت مهندس عمليات أول تكتب تقارير تحليلية احترافية بالعربية والإنجليزية." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (res.status === 429) return { text: "تم تجاوز حد الطلبات، حاول بعد قليل.", textEn: "", error: true };
      if (res.status === 402) return { text: "انتهى رصيد الذكاء الاصطناعي.", textEn: "", error: true };
      if (!res.ok) {
        console.error("explainReports error", res.status, await res.text());
        return { text: `فشل توليد الشرح (${res.status}).`, textEn: "", error: true };
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json?.choices?.[0]?.message?.content ?? "(لا يوجد رد)";
      const [ar, en] = raw.split(/^\s*=+\s*EN\s*=+\s*$/mi);
      return { text: (ar ?? raw).trim(), textEn: (en ?? "").trim(), error: false };
    } catch (e) {
      console.error("explainReports failed", e);
      return { text: "تعذر الوصول لخدمة الذكاء الاصطناعي.", textEn: "", error: true };
    }
  });

