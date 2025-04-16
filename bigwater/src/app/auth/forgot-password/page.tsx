import Link from "next/link";

import { SmtpMessage } from "../smtp-message";

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/types/common";
import Logo from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";

export default async function ForgotPassword({
  searchParams
}: {
  searchParams: Promise<{ message?: string; type?: string }>
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
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-6">
        <Logo />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
          <p className="text-muted-foreground text-sm">
            Nous vous enverrons un lien de réinitialisation
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
            
            <SubmitButton 
              pendingText="Envoi en cours..." 
              formAction={forgotPasswordAction}
              className="w-full mt-2"
            >
              Réinitialiser le mot de passe
            </SubmitButton>
            
            <div className="text-center pt-2">
              <Link 
                className="text-sm text-primary/80 hover:text-primary underline" 
                href="/login"
              >
                Retour à la connexion
              </Link>
            </div>
            
            {messageObj && <FormMessage message={messageObj} />}
          </form>
        </div>
      </div>
      <SmtpMessage />
    </div>
  );
}
