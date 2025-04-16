import Link from "next/link";

import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/types/common";
import Logo from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";

export default async function Login({
  searchParams
}: {
  searchParams: Promise<{ message?: string; type?: string; redirectUrl?: string }>
}) {
  const params = await searchParams;
  
  let messageObj: Message | undefined;
  if (params?.message) {
    if (params.type === 'error') {
      messageObj = { error: params.message };
    } else if (params.type === 'success') {
      messageObj = { success: params.message };
    } else {
      messageObj = { message: params.message };
    }
  }
  
  // Récupérer l'URL de redirection des paramètres de recherche
  const redirectUrl = params?.redirectUrl || "/dashboard";
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-6">
        <Logo />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Connexion</h1>
          <p className="text-muted-foreground text-sm">
            Accédez à votre espace personnel
          </p>
        </div>
        
        <div className="w-full p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm shadow-md">
          <form className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input 
                id="email"
                name="email" 
                type="email"
                placeholder="nom@exemple.fr" 
                autoComplete="email"
                required 
                className="bg-background/70"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  className="text-xs text-primary/80 hover:text-primary underline"
                  href="/auth/forgot-password"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
                className="bg-background/70"
              />
            </div>
            
            {/* Champ caché pour stocker l'URL de redirection */}
            <input type="hidden" name="redirectUrl" value={redirectUrl} />
            
            <SubmitButton 
              pendingText="Connexion en cours..." 
              formAction={signInAction}
              className="w-full mt-2"
            >
              Se connecter
            </SubmitButton>
            
            {messageObj && <FormMessage message={messageObj} />}
          </form>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Plateforme réservée aux utilisateurs autorisés</p>
        </div>
      </div>
    </div>
  );
}
