"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categoryService } from "@/lib/services";


const categoryFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface NewCategoryFormProps {
  onSuccess?: () => void;
}

export function NewCategoryForm({ onSuccess }: NewCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      await categoryService.createCategory(data.title);
      toast.success("Catégorie créée avec succès");
      
      // Rafraîchir la page
      router.refresh();
      
      // Fermer le dialogue si une fonction de succès est fournie
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error);
      toast.error("Erreur lors de la création de la catégorie");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la catégorie" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création en cours..." : "Créer la catégorie"}
        </Button>
      </form>
    </Form>
  );
} 