import { ArrowLeft } from "react-feather";

interface ErrorStateProps {
  error: string | null;
  onBack: () => void;
}

export default function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#212121] text-[#ECECEC] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
          {error || "Erreur inconnue"}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[#ECECEC] hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>
    </div>
  );
}
