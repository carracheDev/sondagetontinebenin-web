import type { Metadata } from 'next';
import SurveyForm from '@/components/SurveyForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sondage — TontineBénin',
  description: 'Participez à notre sondage et aidez-nous à construire la meilleure app de tontine au Bénin.',
};

export default function SondagePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--lavender)', paddingTop: '2rem' }}>
      <SurveyForm />
    </main>
  );
}
