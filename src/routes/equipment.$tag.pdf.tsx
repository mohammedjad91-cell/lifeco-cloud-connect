import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from 'react'

export const Route = createFileRoute('/equipment/$tag/pdf')({
  loader: async ({ params }) => {
    return { tag: params.tag }
  },
  component: EquipmentPdfRedirect
})

function EquipmentPdfRedirect() {
  const { tag } = Route.useLoaderData()
  
  useEffect(() => {
    // The physical QR points to this route. 
    // We must redirect to the REAL binary PDF endpoint immediately.
    const baseUrl = window.location.origin;
    window.location.replace(`${baseUrl}/api/public/equipment/${tag}/pdf`);
  }, [tag]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-mono text-center">
      <div className="relative mb-10">
        <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h1 className="text-xl font-black tracking-tighter uppercase mb-4">REDIRECTING TO OFFICIAL PDF...</h1>
      <p className="text-white/40 text-[10px] uppercase tracking-widest">N2-1 Engineering Services</p>
    </div>
  )
}
