"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { NewVideoForm } from "./NewVideoForm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NewVideoDialogProps {
  categoryId: number;
  categoryTitle: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
  buttonSize?: "default" | "sm" | "lg" | "icon" | "xs";
  buttonClassName?: string;
  buttonIcon?: React.ReactNode;
}

export function NewVideoDialog({ 
  categoryId, 
  categoryTitle,
  buttonVariant = "default",
  buttonSize,
  buttonClassName,
  buttonIcon
}: NewVideoDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={cn("ml-auto", buttonClassName)}
        >
          {buttonIcon || <PlusCircle className="mr-2 h-4 w-4" />}
          {buttonSize !== "icon" && "Nouvelle vidéo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
          <DialogDescription>
            Créer une nouvelle vidéo dans la catégorie &quot;{categoryTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        <NewVideoForm 
          categoryId={categoryId} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
} 