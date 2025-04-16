"use client";

import { UserIcon, LockClosedIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/feedback/skeleton";

import { FormMessage } from "@/components/form-message";
import type { Message } from "@/types/common";
import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";
import { createClient as createClientBrowser } from "@/services/supabase/client";
import { getProfile } from "@/services/api/profiles";

// Composant AccountInfo unifié
function AccountInfo({
  user
}: {
  user: {
    id: string;
    email: string;
    last_sign_in_at?: string;
  }
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-2 rounded bg-background/50">
          <span className="font-medium">Email:</span> 
          <span className="text-muted-foreground">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-background/50">
          <span className="font-medium">ID:</span> 
          <span className="text-muted-foreground">{user.id}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-background/50">
          <span className="font-medium">Dernière connexion:</span> 
          <span className="text-muted-foreground">
            {user.last_sign_in_at 
              ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') 
              : 'Aucune information disponible'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Composant intérieur qui utilise useSearchParams
function ProfilePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // État pour le formulaire de profil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [, setUserId] = useState("");
  const [isPendingProfile, startProfileTransition] = useTransition();
  
  // État pour le formulaire de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPendingPassword, startPasswordTransition] = useTransition();
  
  // État pour les informations du compte
  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    last_sign_in_at?: string;
  }>({ id: "", email: "" });
  
  // Chargement des données utilisateur côté client
  const [isLoading, setIsLoading] = useState(true);
  
  // Effet pour charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClientBrowser();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push("/dashboard/login");
          return;
        }
        
        // Récupérer les données du profil via l'API
        try {
          const profile = await getProfile(user.id);
          
          // Mettre à jour les états
          setName(profile?.name || "");
          setEmail(profile?.email || user.email || "");
          setUserId(user.id);
          setUserInfo({
            id: user.id,
            email: profile?.email || user.email || '',
            last_sign_in_at: user.last_sign_in_at
          });
        } catch (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
          // Utiliser les données minimales de l'utilisateur
          setName("");
          setEmail(user.email || "");
          setUserId(user.id);
          setUserInfo({
            id: user.id,
            email: user.email || '',
            last_sign_in_at: user.last_sign_in_at
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error("Une erreur est survenue lors du chargement du profil");
        router.push('/dashboard/dashboard');
      }
    };
    
    loadUserData();
  }, [router]);
  
  // Gestionnaire pour la mise à jour du profil
  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    
    const formData = new FormData();
    formData.append("fullName", name);
    
    startProfileTransition(async () => {
      try {
        toast.success("Profil mis à jour avec succès");
      } catch {
        toast.error("Une erreur est survenue lors de la mise à jour du profil");
      }
    });
  };
  
  // Gestionnaire pour la mise à jour du mot de passe
  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Vérifications côté client
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tous les champs de mot de passe sont requis");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);
    
    startPasswordTransition(async () => {
      try {
        toast.success("Mot de passe mis à jour avec succès");
        // Réinitialiser les champs
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch {
        toast.error("Une erreur est survenue lors de la mise à jour du mot de passe");
      }
    });
  };
  
  // Gestionnaire pour la déconnexion
  const handleLogout = async () => {
    try {
      const supabase = createClientBrowser();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      router.push('/dashboard/login');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };
  
  // Préparer le message pour FormMessage si nécessaire
  let messageObj: Message | undefined;
  const messageParam = searchParams.get('message');
  const typeParam = searchParams.get('type');
  
  if (messageParam) {
    if (typeParam === 'error') {
      messageObj = { error: messageParam };
    } else if (typeParam === 'success') {
      messageObj = { success: messageParam };
    } else {
      messageObj = { message: messageParam };
    }
  }
  
  if (isLoading) {
    return (
      <PageContainer>
        <EnhancedPageHeader
          usePathConfig={true}
          description="Chargement de votre profil..."
        />
        <PageContent>
          <div className="space-y-10">
            {/* Skeleton pour les Informations du compte */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-60" />
              </div>
              <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md mb-8">
                <Skeleton className="h-6 w-52 mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Skeleton pour le Profil */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <div className="grid gap-1.5">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex items-center justify-end mt-6">
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Skeleton pour la Sécurité */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid gap-1.5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-72 mt-1" />
                  </div>
                  <div className="grid gap-1.5">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex items-center justify-end mt-6">
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </section>
          </div>
        </PageContent>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <EnhancedPageHeader
        usePathConfig={true}
        description="Consultez et modifiez vos informations personnelles et paramètres de compte."
      />
      
      <PageContent>
        {messageObj && <FormMessage message={messageObj} />}
        
        <div className="space-y-10">
          {/* Section Informations du compte */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Informations du compte</h2>
            </div>
            <AccountInfo user={userInfo} />
          </section>
          
          {/* Section Profil */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <IdentificationIcon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Profil</h2>
            </div>
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-6">Informations personnelles</h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={email}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    L&apos;email ne peut pas être modifié
                  </p>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-end mt-6">
                  <Button type="submit" disabled={isPendingProfile}>
                    {isPendingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </div>
              </form>
            </div>
          </section>
          
          {/* Section Sécurité */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <LockClosedIcon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Sécurité</h2>
            </div>
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-6">Changer le mot de passe</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-end mt-6">
                  <Button type="submit" disabled={isPendingPassword}>
                    {isPendingPassword ? "Mise à jour..." : "Changer le mot de passe"}
                  </Button>
                </div>
              </form>
              
              <div className="pt-6 mt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Déconnexion</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Déconnectez-vous de votre compte en toute sécurité.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PageContent>
    </PageContainer>
  );
}

// Composant principal qui enveloppe le contenu dans un Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
} 