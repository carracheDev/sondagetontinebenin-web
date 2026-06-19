import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sondage TontineBénin — Participez à notre enquête',
  description:
    "TontineBénin digitalise les tontines au Bénin. Donnez votre avis et aidez-nous à construire une solution faite pour vous.",
  openGraph: {
    title: 'Sondage TontineBénin',
    description: "Participez au sondage et aidez-nous à digitaliser les tontines au Bénin.",
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
