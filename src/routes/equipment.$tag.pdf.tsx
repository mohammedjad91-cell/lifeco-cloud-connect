import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from 'react'
import { generateEquipmentPDF } from '@/utils/equipment-pdf'

export const Route = createFileRoute('/equipment/$tag/pdf')({
  loader: async ({ params }) => {
    return { tag: params.tag }
  },
  component: EquipmentPdfRedirect
})

function EquipmentPdfRedirect() {
  const { tag } = Route.useLoaderData()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function init() {
      try {
        const { data: assetData, error: dbError } = await supabase
          .from("equipment_identity_cards")
          .select(`*, asset:equipment_assets(*)`)
          .eq("equipment_tag", tag)
          .maybeSingle();

        if (dbError) throw dbError;
        if (!assetData) {
          setError("Equipment technical data not found.");
          return;
        }

        const doc = await generateEquipmentPDF(assetData, tag);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Use a timeout to ensure the user sees the "Generating" state briefly
        // and to avoid browser blocking immediate location changes on some devices
        setTimeout(() => {
          window.location.replace(pdfUrl);
        }, 800);
      } catch (err: any) {
        console.error("PDF generation failed:", err);
        setError(err.message || "Failed to generate official equipment PDF.");
      }
    }
    init();
  }, [tag]);
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-sans">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center max-w-md">
          <h2 className="text-red-500 font-black uppercase tracking-tighter text-xl mb-2">ACCESS ERROR</h2>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-mono">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="mt-10 text-center">
        <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">OFFICIAL PDF ACCESS</h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded border border-primary/30 uppercase tracking-widest">
            {tag}
          </span>
          <span className="text-white/20 text-[10px]">|</span>
          <span className="text-white/40 text-[10px] uppercase tracking-widest">N2-1 NITROGEN</span>
        </div>
        <p className="text-primary/60 font-bold tracking-[0.3em] text-[9px] uppercase animate-pulse">
          Retrieving Technical Documentation...
        </p>
      </div>

      <div className="fixed bottom-10 left-0 right-0 text-center">
        <p className="text-white/10 text-[8px] uppercase tracking-[0.5em]">LIFECO PMS ENGINEERING SERVICES</p>
      </div>
    </div>
  )
}
