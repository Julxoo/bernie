import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/30 px-5 py-3 border border-border/50 rounded-md flex gap-4 mt-6">
      <InfoIcon size={16} className="mt-0.5 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-secondary-foreground">
          <strong>Remarque :</strong> Les emails sont limités en nombre. Configurez un SMTP personnalisé pour augmenter cette limite.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="text-primary/70 hover:text-primary flex items-center text-sm gap-1"
          >
            En savoir plus <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
