"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/inputs/input";
import { categoryService } from "@/lib/services";
import { Card, CardContent } from "@/components/ui/layout/card";
import { Label } from "@/components/ui/label";


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
  const [nextIdentifier, setNextIdentifier] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNextIdentifier() {
      try {
        setIsLoading(true);
        const categories = await categoryService.getCategories();
        
        let newIdentifier;
        if (categories.length > 0) {
          const lastCategory = categories.sort((a, b) => {
            if (!a.identifier || !b.identifier) return 0;
            return a.identifier > b.identifier ? -1 : 1;
          })[0];
          
          if (lastCategory.identifier) {
            const lastLetter = lastCategory.identifier.toString().charAt(0);
            const nextLetterCode = lastLetter.charCodeAt(0) + 1;
            newIdentifier = String.fromCharCode(nextLetterCode);
          } else {
            newIdentifier = 'A';
          }
        } else {
          newIdentifier = 'A';
        }
        
        setNextIdentifier(newIdentifier);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'identifiant:", error);
        setNextIdentifier('?');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNextIdentifier();
  }, []);

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

        <Card className="border-dashed bg-muted/40">
          <CardContent className="p-4">
            <Label className="text-sm font-medium">Identifiant de catégorie</Label>
            <div className="flex items-center mt-2">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-md flex items-center justify-center text-2xl font-bold shadow-sm">
                {isLoading ? '...' : nextIdentifier}
              </div>
              <span className="ml-3 text-sm text-muted-foreground">
                Identifiant automatique pour cette catégorie
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création en cours..." : "Créer la catégorie"}
        </Button>
      </form>
    </Form>
  );
} 