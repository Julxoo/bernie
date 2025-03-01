"use client";

import { useState } from "react";
import { EditableField } from "./EditableField";
import { Copy } from "react-feather";

interface EditableItemProps {
  label: string;
  value: string;
  placeholder: string;
  onSave: (newValue: string) => Promise<void>;
  inputType?: "text" | "textarea";
  isLink?: boolean;
  copyable?: boolean; // Nouvelle prop pour activer la copie
}

export default function EditableItem({
  label,
  value,
  placeholder,
  onSave,
  inputType = "text",
  isLink = false,
  copyable = false,
}: EditableItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie", err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
      {label && (
        <span className="text-gray-400 min-w-[100px]">{label}</span>
      )}
      <div className="w-full sm:ml-4 flex items-center gap-2">
        <EditableField
          value={value}
          onSave={onSave}
          inputType={inputType}
          placeholder={placeholder}
          autoFocus
        />
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Copier"
          >
            <Copy size={16} />
            {copied && <span className="text-xs ml-1">Copié</span>}
          </button>
        )}
      </div>
    </div>
  );
}
