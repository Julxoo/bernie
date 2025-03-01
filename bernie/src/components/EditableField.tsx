"use client";

import { useEditable } from "../hooks/useEditable";
import { isUrl } from "../utils/urlUtils";
import React from "react";
import { ExternalLink, Edit } from "react-feather";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  inputType?: "text" | "textarea";
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function EditableField({
  value,
  onSave,
  inputType = "text",
  placeholder = "",
  className = "",
  autoFocus = false,
}: EditableFieldProps) {
  const {
    editing,
    value: localValue,
    setEditing,
    handleChange,
    handleBlur,
  } = useEditable(value, onSave);

  const inputStyles =
    "bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none rounded w-full";

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Pour les inputs : on capture "Enter" (et pour textarea, si Shift n'est pas pressé)
    if (e.key === "Enter" && (inputType !== "textarea" || !e.shiftKey)) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (editing) {
    return (
      <div className={className}>
        {inputType === "textarea" ? (
          <textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${inputStyles} p-2`}
            rows={4}
            autoFocus={autoFocus}
            onBlur={handleBlur}
            enterKeyHint="done"
          />
        ) : (
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${inputStyles} px-2 py-1`}
            autoFocus={autoFocus}
            onBlur={handleBlur}
            enterKeyHint="done"
          />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {value ? (
        isUrl(value) ? (
          <div className="flex items-center gap-2">
            <span
              onClick={() => setEditing(true)}
              className="cursor-pointer hover:text-gray-300 p-1 rounded hover:bg-[#2a2a2a] transition-colors break-all flex-1"
            >
              {value}
            </span>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer hover:underline text-blue-400"
              onClick={(e) => e.stopPropagation()}
              aria-label="Ouvrir le lien"
            >
              <ExternalLink size={16} />
            </a>
          </div>
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
