import { Message } from '@/types/common';

export function FormMessage({ message }: { message?: Message }) {
  if (!message) return null;
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm mb-6">
      {"success" in message && (
        <div className="text-emerald-500 border-l-2 border-emerald-500 px-4 py-2 bg-emerald-500/10 rounded">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-destructive border-l-2 border-destructive px-4 py-2 bg-destructive/10 rounded">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4 py-2 bg-foreground/5 rounded">
          {message.message}
        </div>
      )}
    </div>
  );
}
