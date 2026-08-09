import React from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, Download } from "lucide-react";

export default function EquipmentMobileRoute() {
  const { tag } = useParams({ from: "/equipment/$tag" });
  const navigate = useNavigate();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://id-preview--d95cfcfe-15c7-4b07-81e2-c2b14271a532.lovable.app';
  const qrUrl = `${baseUrl}/equipment/${tag}`;

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="w-4 h-4 ml-2" /> Back
        </Button>
        
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white uppercase">{tag}</h1>
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={qrUrl} size={200} />
          </div>
          <p className="text-sm text-muted-foreground">Scan for Equipment Digital Card</p>
          
          <div className="flex gap-2 pt-4">
            <Button className="flex-1"><Printer className="w-4 h-4 ml-2" /> Print</Button>
            <Button className="flex-1" variant="outline"><Download className="w-4 h-4 ml-2" /> Download</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
