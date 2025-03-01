import { useState, useRef, useEffect } from "react";

export const useEditable = (
  initialValue: string,
  onSave: (value: string) => Promise<void>,
  delay = 500
) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editing) {
      setValue(initialValue);
    }
  }, [initialValue, editing]);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await onSave(newVal);
    }, delay);
  };

  const handleBlur = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await onSave(value);
    setEditing(false);
  };

  return {
    editing,
    value,
    setEditing,
    handleChange,
    handleBlur,
  };
};
