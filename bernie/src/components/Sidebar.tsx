"use client";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Sidebar() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <aside className="w-64 bg-[#171717] min-h-screen flex flex-col border-r border-[#424242]">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-[#ECECEC]">Dashboard</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="/dashboard"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
            >
              Catégories
            </a>
          </li>
          {/* Ajoutez ici d'autres liens de navigation si nécessaire */}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#424242]">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-sm bg-[#424242] hover:bg-[#171717] rounded-lg transition-colors duration-200 border border-[#424242] text-[#ECECEC]"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
