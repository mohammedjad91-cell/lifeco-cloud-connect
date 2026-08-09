import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { generateEquipmentPDF } from '@/utils/equipment-pdf'

export const Route = createFileRoute('/api/public/equipment/$tag/pdf')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get('mode');
        const { tag } = params
        
        try {
          const { data: assetData, error: dbError } = await supabase
            .from("equipment_identity_cards")
            .select(`*, asset:equipment_assets(*)`)
            .eq("equipment_tag", tag)
            .maybeSingle();

          if (dbError) throw dbError;
          if (!assetData) {
            return new Response(`Equipment technical data for ${tag} not found.`, { status: 404 });
          }

          const doc = await generateEquipmentPDF(assetData, tag);
          // jsPDF .output('arraybuffer') works in most environments
          const pdfData = doc.output('arraybuffer');
          
          return new Response(pdfData, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `${mode === 'view' ? 'inline' : 'attachment'}; filename="N2-1_${tag}_Equipment_Card.pdf"`,
              'Cache-Control': 'no-cache'
            }
          });
          
        } catch (err: any) {
          // Provide more detail in the response for debugging if needed
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("PDF generation failed:", err);
          return new Response(`PDF generation failed: ${errorMsg}`, { status: 500 });
        }
      }
    }
  }
})

