import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section className="bg-[#171717] p-4 md:p-6 rounded-lg border border-gray-700 shadow-sm">
      <h2 className="text-lg md:text-xl font-medium mb-4">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
