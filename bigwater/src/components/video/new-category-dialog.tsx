"use client";

import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { NewCategoryForm } from "@/components/video/new-category-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlays/dialog";
import { cn } from "@/lib/utils";

interface NewCategoryDialogProps {
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon" | "xl";
  buttonClassName?: string;
  buttonIcon?: React.ReactNode;
  onSuccess?: () => void;
}

export function NewCategoryDialog({ 
  buttonVariant = "default",
  buttonSize,
  buttonClassName,
  buttonIcon,
  onSuccess
}: NewCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) onSuccess();
  };

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
        <NewCategoryForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 