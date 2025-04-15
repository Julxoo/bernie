"use client";

import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "En cours...",
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button type="submit" aria-disabled={isDisabled} disabled={isDisabled} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
