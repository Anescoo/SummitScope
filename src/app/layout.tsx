import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeakAtlas 3D — Cartographie Alpine Interactive",
  description:
    "Explorez les sommets mythiques du monde en 3D. Globe interactif, routes d'ascension, données météo et histoire des grandes premières.",
  keywords: ["alpinisme", "cartographie 3D", "sommets", "CesiumJS", "montagne"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${spaceGrotesk.variable} font-sans bg-slate-950 text-slate-100 overflow-hidden h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
