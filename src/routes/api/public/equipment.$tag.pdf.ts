import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { generateEquipmentPDF } from '@/utils/equipment-pdf'

export const Route = createFileRoute('/api/public/equipment/$tag/pdf')({
  server: {
    handlers: {
      GET: async ({ params }) => {
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
          const pdfBuffer = doc.output('arraybuffer');
          
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="N2-1_${tag}_Equipment_Card.pdf"`,
              'Cache-Control': 'public, max-age=3600'
            }
          });
          
        } catch (err: any) {
          console.error("PDF generation failed:", err);
          return new Response("Failed to generate official equipment PDF.", { status: 500 });
        }
      }
    }
  }
})
