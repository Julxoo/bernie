import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Mon Projet</h1>
      <p className="text-lg">Ceci est la page d'accueil.</p>
      <div className="mt-8">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Se connecter
        </a>
      </div>
      <div className="mt-8">
        <a href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          S'inscrire
        </a>
      </div>
    </div>
  );
}
