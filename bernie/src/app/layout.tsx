import { Providers } from "@/components/Providers";
import GlobalWrapper from "@/components/GlobalWrapper";
import "./globals.css";

export const metadata = {
  title: "Grattage",
  description: "Alexandre Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <GlobalWrapper>{children}</GlobalWrapper>
        </Providers>
      </body>
    </html>
  );
}
