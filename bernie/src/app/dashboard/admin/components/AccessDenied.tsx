// src/app/dashboard/admin/components/AccessDenied.tsx
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();
  
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
      <p>Vous devez être administrateur pour accéder à cette page.</p>
      <button
        onClick={() => router.push("/dashboard")}
        className="mt-4 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg"
      >
        Retour au dashboard
      </button>
    </div>
  );
}