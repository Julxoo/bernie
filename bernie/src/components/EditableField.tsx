"use client";
import { useState, useEffect, useRef } from "react";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  inputType?: "text" | "textarea";
  placeholder?: string;
  className?: string;
}

/**
 * Composant qui permet d'éditer un champ en place.
 * - Se met en mode édition au clic.
 * - Sauvegarde automatiquement après 500ms d'inactivité dans le champ.
 * - Sauvegarde finale également au blur.
 * - Affiche un lien cliquable si la valeur est une URL.
 */
export function EditableField({
  value,
  onSave,
  inputType = "text",
  placeholder = "",
  className = ""
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Si on sort du mode édition sans sauvegarder, on réinitialise le newValue
    if (!editing) {
      setNewValue(value);
    }
  }, [value, editing]);

  // Déclenche la sauvegarde après un petit délai
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewValue(val);

    // On nettoie l'ancien timer s'il existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // On programme un nouvel appel à onSave après 500 ms
    saveTimeoutRef.current = setTimeout(async () => {
      await onSave(val);
    }, 500);
  };

  // Sauvegarde finale au blur (quand on quitte le champ)
  const handleBlur = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await onSave(newValue);
    setEditing(false);
  };

  // Vérifie si la valeur courante est un lien (URL)
  const isUrl = (str: string) => {
    try {
      // Si ceci ne lève pas d'erreur, c'est probablement une URL valide
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const inputStyles =
    "bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none rounded w-full";

  if (editing) {
    // Mode édition : on affiche un <input> ou <textarea>
    if (inputType === "textarea") {
      return (
        <div className={className}>
          <textarea
            value={newValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${inputStyles} p-2`}
            rows={4}
            autoFocus
            onBlur={handleBlur}
          />
        </div>
      );
    } else {
      return (
        <div className={className}>
          <input
            type="text"
            value={newValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${inputStyles} px-2 py-1`}
            autoFocus
            onBlur={handleBlur}
          />
        </div>
      );
    }
  }

  // Mode affichage : on clique pour passer en mode édition
  return (
    <div className={className}>
      {value ? (
        isUrl(value) ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer hover:underline text-blue-400 break-all"
            onClick={(e) => {
              // Pour éditer au lieu de cliquer, on peut faire un Ctrl+Click ou Clic molette.
              // Si on veut toujours éditer au simple clic, on peut empêcher le lien de s’ouvrir.
              // Ici on laisse le lien actif, mais on peut adapter si besoin.
              e.stopPropagation();
            }}
            onDoubleClick={() => setEditing(true)}
          >
            {value}
          </a>
        ) : (
          <span
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:text-gray-300 p-1 rounded hover:bg-[#2a2a2a] transition-colors break-all"
          >
            {value}
          </span>
        )
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="cursor-pointer text-gray-500 italic p-1 rounded hover:bg-[#2a2a2a] transition-colors"
        >
          {placeholder}
        </span>
      )}
    </div>
  );
}
