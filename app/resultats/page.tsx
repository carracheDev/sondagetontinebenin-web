import type { Metadata } from 'next';
import ResultatsDashboard from '@/components/ResultatsDashboard';

export const metadata: Metadata = {
  title: 'Résultats — TontineBénin',
  robots: { index: false, follow: false },
};

export default function ResultatsPage() {
  return <ResultatsDashboard />;
}
