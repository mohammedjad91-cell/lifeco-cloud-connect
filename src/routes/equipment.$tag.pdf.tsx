import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from 'react'
import { generateEquipmentPDF } from '@/utils/equipment-pdf'

const PDF_CACHE_PREFIX = 'pdf_cache_'
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

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
        const cacheKey = `${PDF_CACHE_PREFIX}${tag}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Only use cache if it's less than 24h old
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`Using cached PDF for ${tag}`);
            
            // Re-generate from cached metadata to ensure UI-linked elements (like QR) are fresh
            const doc = await generateEquipmentPDF(data, tag);
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.location.replace(pdfUrl);
            return;
          }
        }

        const { data: assetData, error: dbError } = await supabase
          .from("equipment_identity_cards")
          .select(`*, asset:equipment_assets(*)`)
          .eq("equipment_tag", tag)
          .maybeSingle();

        if (dbError) throw dbError;
        if (!assetData) {
          setError(`Equipment technical data for ${tag} not found.`);
          return;
        }

        // Cache the metadata for faster subsequent generations
        localStorage.setItem(cacheKey, JSON.stringify({
          data: assetData,
          timestamp: Date.now()
        }));

        // Generate the PDF
        const doc = await generateEquipmentPDF(assetData, tag);
        
        // Output as blob
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        window.location.replace(pdfUrl);
        
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-mono text-center">
      <div className="relative mb-10">
        <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">ENGINEERING PDF GENERATOR</h1>
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded border border-primary/30 uppercase tracking-widest">
          UNIT: {tag}
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white/40 text-xs uppercase tracking-widest">N2-1 NITROGEN PLANT</span>
      </div>
      
      <div className="space-y-2">
        <p className="text-primary/60 font-bold tracking-[0.2em] text-[10px] uppercase animate-pulse">
          Accessing Technical Metadata...
        </p>
        <p className="text-white/20 text-[9px] uppercase tracking-widest">
          System will direct to PDF viewer automatically
        </p>
      </div>

      <div className="fixed bottom-10 left-0 right-0">
        <p className="text-white/10 text-[8px] uppercase tracking-[0.4em]">OFFICIAL ENGINEERING SERVICES PORTAL</p>
      </div>
    </div>
  )
}
