import React, { useState, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentMobileCard } from "@/components/equipment/EquipmentMobileCard";
import { LoadingState } from "@/components/ui/app-states";

export const Route = createFileRoute("/equipment/$tag")({
  component: EquipmentMobilePage,
});

function EquipmentMobilePage() {
  const { tag } = useParams({ from: "/equipment/$tag" });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: assetData } = await supabase
        .from("equipment_identity_cards")
        .select(`*, asset:equipment_assets(*)`)
        .eq("equipment_tag", tag)
        .maybeSingle();

      setData(assetData);
      setLoading(false);
    }
    fetchData();
  }, [tag]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingState message="Loading Digital Card..." /></div>;
  if (!data) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6"><h1 className="text-2xl font-bold mb-4">Equipment Not Found</h1><Link to="/" className="text-primary hover:underline">Return Home</Link></div>;

  return <EquipmentMobileCard data={data} />;
}

