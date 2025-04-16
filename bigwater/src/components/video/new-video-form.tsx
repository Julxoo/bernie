"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/layout/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/inputs/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/inputs/select";
import { videoService } from "@/lib/services";
import { VideoStatus } from "@/types/api";
import { createClient } from "@/services/supabase/client";

const videoFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  category_id: z.string().min(1, "La catégorie est requise"),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface NewVideoFormProps {
  categoryId?: number;
  onSuccess?: () => void;
}

interface Category {
  id: number;
  title: string;
  identifier: number;
}

export function NewVideoForm({ categoryId, onSuccess }: NewVideoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nextIdentifier, setNextIdentifier] = useState<number | null>(null);
  const [previewIdentifier, setPreviewIdentifier] = useState<string>("--");
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      category_id: categoryId ? String(categoryId) : "",
    },
  });

  // Charger les catégories au montage du composant
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    async function loadCategories() {
      const supabase = createClient();
      
      try {
        console.log("Chargement des catégories...");
        
        // Récupérer toutes les informations des catégories
        const { data, error } = await supabase
          .from('video_categories')
          .select('*')
          .order('title', { ascending: true });

        if (error) throw error;
        
        if (data && isMounted) {
          console.log("Catégories chargées (données complètes):", data);
          
          // Vérifier la structure des données et les identifiants
          data.forEach((cat: Category, index: number) => {
            console.log(`Catégorie ${index + 1}:`, {
              id: cat.id,
              titre: cat.title,
              identifiant: cat.identifier,
              typeIdentifiant: typeof cat.identifier
            });
          });
          
          setCategories(data);
          
          // Si une catégorie est déjà sélectionnée, charger le prochain identifiant
          if (categoryId) {
            console.log("Catégorie pré-sélectionnée:", categoryId);
            const selectedCat = data.find((cat: {id: number}) => cat.id === categoryId);
            if (selectedCat && isMounted) {
              console.log("Catégorie trouvée:", selectedCat);
              await loadNextIdentifier(categoryId, isMounted);
            } else {
              console.warn("Catégorie pré-sélectionnée non trouvée dans les données:", categoryId);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
        if (isMounted) {
          toast.error("Impossible de charger les catégories");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  // Charger le prochain identifiant pour une catégorie
  async function loadNextIdentifier(catId: number, isMounted = true) {
    if (!isMounted) return;
    
    const supabase = createClient();
    
    try {
      console.log("Récupération d'identifiant pour catégorie:", catId);
      
      const { data, error } = await supabase
        .from("category_videos")
        .select("identifier")
        .eq("category_id", catId)
        .order("identifier", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erreur lors de la récupération des identifiants vidéos:", error);
        throw error;
      }
      if (!isMounted) return;

      console.log("Données vidéos pour cette catégorie:", data);

      const nextId = data.length > 0 && data[0].identifier
        ? (data[0].identifier + 1)
        : 1;
      
      setNextIdentifier(nextId);
      
      // Récupérer la catégorie pour obtenir son identifiant
      console.log("Récupération des données de la catégorie:", catId);
      
      const { data: catData, error: catError } = await supabase
        .from("video_categories")
        .select("*")
        .eq("id", catId)
        .single();
        
      if (catError) {
        console.error("Erreur lors de la récupération de la catégorie:", catError);
        throw catError;
      }
      if (!isMounted) return;
      
      console.log("Catégorie récupérée (données complètes):", catData);
      
      // Mettre à jour la prévisualisation avec l'identifiant correct de la catégorie
      if (catData && catData.identifier !== undefined) {
        // Convertir l'identifiant de catégorie en lettre (1 => A, 2 => B, etc.)
        const catIdentifier = catData.identifier;
        let categoryPrefix;
        
        try {
          // S'assurer que l'identifiant est un nombre valide pour la conversion
          if (typeof catIdentifier === 'number' && catIdentifier > 0 && catIdentifier < 27) {
            categoryPrefix = String.fromCharCode(64 + catIdentifier);
          } else {
            // Si l'identifiant est hors plage, utiliser l'identifiant tel quel
            categoryPrefix = catIdentifier.toString();
          }
          
          console.log("Conversion identifiant: ", {
            original: catIdentifier,
            converted: categoryPrefix,
            type: typeof catIdentifier
          });
          
          setPreviewIdentifier(`#${categoryPrefix}-${nextId}`);
        } catch (error) {
          console.error("Erreur lors de la conversion de l'identifiant:", error);
          setPreviewIdentifier(`#${catIdentifier}-${nextId}`);
        }
      } else {
        setPreviewIdentifier(`#?-${nextId}`);
        console.error("Identifiant de catégorie manquant:", catData);
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'identifiant:", err);
      if (isMounted) {
        setNextIdentifier(null);
        setPreviewIdentifier("--");
      }
    }
  }

  // Mettre à jour la prévisualisation de l'identifiant
  function updatePreviewIdentifier(catId: number, videoId: number) {
    // Cette fonction n'est plus utilisée car nous récupérons directement
    // l'identifiant de la catégorie depuis la base de données dans loadNextIdentifier
    const category = categories.find(c => c.id === catId);
    if (!category) {
      setPreviewIdentifier("--");
      return;
    }
    
    // Vérifier que nous avons bien un identifiant de catégorie
    if (!category.identifier) {
      console.error("Erreur: L'identifiant de catégorie est manquant", category);
      setPreviewIdentifier(`#?-${videoId}`);
      return;
    }
    
    // Convertir l'identifiant de catégorie en lettre (1 => A, 2 => B, etc.)
    const categoryPrefix = String.fromCharCode(64 + category.identifier);
    setPreviewIdentifier(`#${categoryPrefix}-${videoId}`);
  }

  // Gérer le changement de catégorie
  const handleCategoryChange = async (value: string) => {
    console.log("Changement de catégorie:", value);
    
    try {
      // Parse en nombre avec vérification
      const catId = parseInt(value, 10);
      
      if (isNaN(catId)) {
        console.error("ID de catégorie invalide:", value);
        return;
      }
      
      // Mettre à jour le formulaire
      form.setValue("category_id", value);
      
      // Vider temporairement l'identifiant pour montrer le chargement
      setPreviewIdentifier("Chargement...");
      
      // Charger le nouvel identifiant
      await loadNextIdentifier(catId);
      
    } catch (error) {
      console.error("Erreur lors du changement de catégorie:", error);
      setPreviewIdentifier("Erreur");
    }
  };

  async function onSubmit(data: VideoFormValues) {
    setIsSubmitting(true);
    try {
      const catId = parseInt(data.category_id);
      
      // Logging pour déboguer
      console.log("Soumission du formulaire avec les données:", {
        categoryId: catId,
        title: data.title
      });
      
      await videoService.createNewVideo(catId, {
        title: data.title,
        production_status: "À monter" as VideoStatus,
      });

      toast.success("Vidéo créée avec succès");
      
      // Rafraîchir la page
      router.refresh();
      
      // Fermer le dialogue si une fonction de succès est fournie
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création de la vidéo:", error);
      toast.error("Erreur lors de la création de la vidéo");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Sélection de la catégorie - uniquement affiché si categoryId n'est pas fourni */}
        {!categoryId && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select 
                  onValueChange={handleCategoryChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Champ titre */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la vidéo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prévisualisation de l'identifiant */}
        <Card className="p-4 bg-muted/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Identifiant de la vidéo</p>
            <p className="text-xl font-mono font-bold">{previewIdentifier}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Les autres informations pourront être complétées ultérieurement.
            </p>
          </div>
        </Card>

        <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
          {isSubmitting ? "Création en cours..." : "Créer la vidéo"}
        </Button>
      </form>
    </Form>
  );
} 