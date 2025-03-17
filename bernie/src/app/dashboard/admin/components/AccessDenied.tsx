// src/app/dashboard/admin/components/AccessDenied.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

const AccessDenied: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-8">
      <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#424242] max-w-md w-full text-center shadow-lg">
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse"></div>
          <Lock size={40} className="mx-auto text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-white">Accès restreint</h1>
        
        <div className="bg-[#252525] p-4 rounded-lg mb-5 flex items-start">
          <AlertCircle size={20} className="text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-left text-gray-300">
            Vous devez être administrateur pour accéder à cette page. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre superviseur.
          </p>
        </div>
        
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 px-4 py-3 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#525252] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525252] focus:ring-offset-[#1a1a1a]"
        >
          Retour au tableau de bord
        </button>
        
        <p className="mt-4 text-sm text-gray-400">
          ID de session: {Math.random().toString(36).substring(2, 12).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;