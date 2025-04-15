"use client";

import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { NewCategoryForm } from "@/components/video/NewCategoryForm";

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

interface NewCategoryDialogProps {
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
  buttonSize?: "default" | "sm" | "lg" | "icon" | "xs";
  buttonClassName?: string;
  buttonIcon?: React.ReactNode;
}

export function NewCategoryDialog({ 
  buttonVariant = "default",
  buttonSize,
  buttonClassName,
  buttonIcon
}: NewCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={cn("ml-auto", buttonClassName)}
        >
          {buttonIcon || <FolderPlus className="mr-2 h-4 w-4" />}
          {buttonSize !== "icon" && "Nouvelle catégorie"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
          <DialogDescription>
            Créer une nouvelle catégorie pour organiser vos vidéos
          </DialogDescription>
        </DialogHeader>
        <NewCategoryForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
} 