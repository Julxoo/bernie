"use client"

import { FunnelIcon } from "@heroicons/react/24/outline"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { VideoCategory } from "@/types/api"

// Define a local type for categories with videos
interface CategoryWithVideos extends VideoCategory {
  videos_count?: number;
  category_videos?: any[]; // Added to match usage in the component
}

interface SortOption {
  id: string
  label: string
}

interface MobileFilterDrawerProps {
  // Ces propriétés sont utilisées dans le composant
  categories: CategoryWithVideos[]
  selectedCategories: number[]
  sortOptions: SortOption[]
  dateSort: string
  handleCategoryToggle: (categoryId: number) => void
  setSelectedCategories: (categories: number[]) => void
  setDateSort: (sort: string) => void
  // Propriétés passées dans d'autres fichiers mais non utilisées ici
  categoryId?: string
  sort?: string
}

export function MobileFilterDrawer({
  categories,
  selectedCategories,
  sortOptions,
  dateSort,
  handleCategoryToggle,
  setSelectedCategories,
  setDateSort
}: MobileFilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 p-0 relative md:hidden"
          aria-label="Filtres"
        >
          <FunnelIcon className="h-4 w-4" />
          {selectedCategories.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] px-0 pt-0 pb-6">
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <h3 className="text-base font-medium">Filtres</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedCategories([])}
            disabled={selectedCategories.length === 0}
            className="h-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Tout effacer
          </Button>
        </div>
        
        <div className="px-4 py-4 space-y-6 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="space-y-3">
            <h4 className="font-medium">Tri</h4>
            <Select
              value={dateSort}
              onValueChange={setDateSort}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Catégories</h4>
              <span className="text-xs text-muted-foreground">
                {selectedCategories.length} sélectionnée{selectedCategories.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="max-h-64 space-y-2 overflow-auto rounded-md border p-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`mobile-category-${category.id}`} 
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleCategoryToggle(category.id);
                      } else {
                        handleCategoryToggle(category.id);
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`mobile-category-${category.id}`}
                    className="flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{category.title}</span>
                    <span className="text-xs text-muted-foreground">{category.category_videos?.length || 0}</span>
                  </Label>
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  Aucune catégorie disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 