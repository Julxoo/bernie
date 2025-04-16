"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { ConstructionIcon } from "lucide-react";

export function CasinoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ConstructionIcon className="h-5 w-5 text-yellow-500" />
          <span>Module Casino</span>
        </CardTitle>
        <div className="text-muted-foreground text-sm">
          Cette fonctionnalité est actuellement en cours de développement.
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-yellow-100 p-6 mb-4">
            <ConstructionIcon className="h-12 w-12 text-yellow-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">En cours de développement</h3>
          <p className="text-muted-foreground max-w-md">
            Le module Casino est actuellement en phase de développement et sera disponible prochainement.
            Merci de votre patience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 