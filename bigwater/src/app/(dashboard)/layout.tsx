// ./app/(dashboard)/layout.tsx
import { Navigation } from '@/components/ui/navigation';
import { Toaster } from '@/components/ui/feedback/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Aller au contenu principal
      </a>
      <Navigation>
        <div id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </Navigation>
      <Toaster />
    </>
  );
}