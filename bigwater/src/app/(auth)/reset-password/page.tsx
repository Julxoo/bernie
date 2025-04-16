import { redirect } from "next/navigation";

import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Logo from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/services/supabase/server";

export default async function ResetPassword({
  searchParams
}: {
  searchParams: Promise<{ message?: string; type?: string }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  
  // Accéder aux valeurs de searchParams de manière asynchrone
  const params = await searchParams;
  
  // Préparer le message pour FormMessage si nécessaire
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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <Logo />
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Réinitialisation du mot de passe</h1>
            <p className="text-muted-foreground text-sm">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>
          
          <div className="w-full p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm shadow-md">
            <form className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Votre nouveau mot de passe"
                  autoComplete="new-password"
                  required
                  className="bg-background/70"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmez votre mot de passe"
                  autoComplete="new-password"
                  required
                  className="bg-background/70"
                />
              </div>
              
              <SubmitButton 
                pendingText="Mise à jour..." 
                formAction={resetPasswordAction}
                className="w-full mt-2"
              >
                Mettre à jour le mot de passe
              </SubmitButton>
              
              {messageObj && <FormMessage message={messageObj} />}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
