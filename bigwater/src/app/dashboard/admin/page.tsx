import { Metadata } from "next";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Administration | BigWater",
  description: "Administration du système",
};

export default function AdminPage() {
  return (
    <div className="container py-6 pb-20 md:pb-6">
      <AdminClient />
    </div>
  );
} 