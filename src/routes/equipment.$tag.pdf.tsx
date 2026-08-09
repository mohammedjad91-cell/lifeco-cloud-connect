import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/equipment/$tag/pdf')({
  loader: async ({ params }) => {
    // This runs on the server during SSR or as a server-side route
    // However, TanStack Router routes by default render a component.
    // For a direct PDF response, we use a server route or a component that triggers download.
    // The user wants DIRECT opening.
    return { tag: params.tag }
  },
  component: EquipmentPdfRedirect
})

function EquipmentPdfRedirect() {
  const { tag } = Route.useLoaderData()
  
  // We need to generate the PDF and display it.
  // Since jsPDF is client-side, we'll use a "Loading PDF..." screen
  // and then use window.open or replace the current location.
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-mono">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">GENERATING EQUIPMENT PDF</h1>
      <p className="text-primary/60 font-bold tracking-widest text-xs">{tag}</p>
      <p className="mt-8 text-white/40 text-[10px] animate-pulse">DIRECT PDF VIEWING INITIALIZING...</p>
      
      <PdfGenerator tag={tag} />
    </div>
  )
}

import { useEffect } from 'react'
import { generateEquipmentPDF } from '@/utils/equipment-pdf'

function PdfGenerator({ tag }: { tag: string }) {
  useEffect(() => {
    async function init() {
      try {
        const { data: assetData } = await supabase
          .from("equipment_identity_cards")
          .select(`*, asset:equipment_assets(*)`)
          .eq("equipment_tag", tag)
          .maybeSingle();

        if (assetData) {
          const doc = await generateEquipmentPDF(assetData, tag);
          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Open in current window to simulate "Direct PDF" behavior
          window.location.replace(pdfUrl);
        } else {
          console.error("Asset not found");
        }
      } catch (err) {
        console.error("PDF generation failed:", err);
      }
    }
    init();
  }, [tag]);
  
  return null;
}
