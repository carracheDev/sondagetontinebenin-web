type Props = { current: number; total: number };

export default function StepIndicator({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
          Étape {current} sur {total}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        {['Profil', 'Épargne', 'Digital', 'Solution', 'Lancement'].map((label, i) => (
          <div key={i} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', margin: '0 auto 2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
              background: i + 1 < current ? '#2563EB' : i + 1 === current ? '#1E3A8A' : '#e5e7eb',
              color: i + 1 <= current ? 'white' : '#9ca3af',
              transition: 'all 0.3s',
            }}>
              {i + 1 < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.6rem', color: i + 1 <= current ? '#2563EB' : '#9ca3af',
              fontWeight: i + 1 === current ? 700 : 400,
              display: 'block',
            }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
