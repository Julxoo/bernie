"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/auth";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

// Composant local pour afficher les erreurs de formulaire
function FieldError({ message }: { message: string }) {
  return (
    <div className="text-destructive text-sm mt-1">
      {message}
    </div>
  );
}

interface EditUserDialogProps {
  open: boolean;
  user: UserProfile;
  onClose: () => void;
  onSubmit: (data: Partial<UserProfile>) => void;
}

export function EditUserDialog({ open, user, onClose, onSubmit }: EditUserDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>(user.role || "user");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les champs lorsque l'utilisateur change
  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setPassword("");
    setRole(user.role || "user");
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email n'est pas valide";
    }
    
    // Validation du mot de passe uniquement s'il est modifié
    if (password && password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedData: Partial<UserProfile> = {};
      
      // Ne soumettre que les champs modifiés
      if (name !== user.name) updatedData.name = name;
      if (email !== user.email) updatedData.email = email;
      if (password) updatedData.password = password;
      if (role !== user.role) updatedData.role = role;
      
      await onSubmit(updatedData);
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Nom de l'utilisateur"
            />
            {errors.name && <FieldError message={errors.name} />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="email@exemple.com"
            />
            {errors.email && <FieldError message={errors.email} />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              Mot de passe
              <span className="text-muted-foreground text-xs ml-1 font-normal">(laisser vide pour ne pas modifier)</span>
            </Label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <FieldError message={errors.password} />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <div className="rounded-md border border-input bg-background overflow-hidden">
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`text-sm px-3 py-2 text-center transition-colors ${
                    role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  Utilisateur
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`text-sm px-3 py-2 text-center transition-colors ${
                    role === "admin" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Modification..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 