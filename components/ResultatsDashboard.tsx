'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

type Reponse = {
  age?: string; sexe?: string; activite?: string; ville?: string;
  typedevise?: string; receptionUSSD?: string;
  epargne?: string; frequence?: string; montant?: string;
  nbMembres?: string; gestionnaireArgent?: string; commMode?: string;
  perteArgent?: string; montantPerdu?: string;
  fraisActuels?: string;
  probleme?: string; barriereAdoption?: string; mobileMoney?: string;
  fraisRetrait?: string; souhaiteCredit?: string; tauxCreditAcceptable?: string;
  garantiePadme?: string; pretASwitcher?: string;
  preferenceCollecte?: string; interetSMS?: string;
  npsScore?: string;
  veutTesteur?: string; telephone?: string;
  creeLe?: number;
};

type QuestionStats = { label: string; counts: Record<string, number>; total: number };

function aggregate(reponses: Reponse[]): QuestionStats[] {
  const count = (field: keyof Reponse) => {
    const c: Record<string, number> = {};
    reponses.forEach(r => {
      const v = r[field];
      if (v) {
        // Gérer les choix multiples (séparés par des virgules)
        if (field === 'epargne' && typeof v === 'string') {
          v.split(', ').forEach((part: string) => {
            c[part] = (c[part] || 0) + 1;
          });
        } else {
          c[v] = (c[v] || 0) + 1;
        }
      }
    });
    return c;
  };
  return [
    { label: 'Âge', counts: count('age'), total: reponses.length },
    { label: 'Sexe', counts: count('sexe'), total: reponses.length },
    { label: 'Activité principale', counts: count('activite'), total: reponses.length },
    { label: 'Type de téléphone', counts: count('typedevise'), total: reponses.length },
    { label: 'Habitudes d\'épargne (Choix multiples)', counts: count('epargne'), total: reponses.length },
    { label: 'Taille des groupes', counts: count('nbMembres'), total: reponses.filter(r => r.nbMembres).length },
    { label: 'Gestionnaire de la caisse', counts: count('gestionnaireArgent'), total: reponses.filter(r => r.gestionnaireArgent).length },
    { label: 'Mode de Communication', counts: count('commMode'), total: reponses.filter(r => r.commMode).length },
    { label: 'Antécédents (Pertes d\'argent)', counts: count('perteArgent'), total: reponses.length },
    { label: 'Pénalités (Frais de tenue/retrait)', counts: count('fraisActuels'), total: reponses.length },
    { label: 'Défaut principal du système actuel', counts: count('probleme'), total: reponses.length },
    { label: 'Barrières d\'adoption (Peur de l\'app)', counts: count('barriereAdoption'), total: reponses.length },
    { label: 'Accessibilité Mobile Money', counts: count('mobileMoney'), total: reponses.length },
    { label: 'Intérêt pour le Crédit', counts: count('souhaiteCredit'), total: reponses.length },
    { label: 'Taux d\'intérêt Acceptable', counts: count('tauxCreditAcceptable'), total: reponses.filter(r => r.tauxCreditAcceptable).length },
    { label: 'Impact Garantie PADME', counts: count('garantiePadme'), total: reponses.length },
    { label: 'Volonté de Switching', counts: count('pretASwitcher'), total: reponses.length },
    { label: 'Préférence de Collecte', counts: count('preferenceCollecte'), total: reponses.length },
    { label: 'Intérêt Testeur', counts: count('veutTesteur'), total: reponses.length },
  ];
}

function BarChart({ stats }: { stats: QuestionStats }) {
  const entries = Object.entries(stats.counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E3A8A', marginBottom: '0.75rem' }}>
        {stats.label}
        <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8, fontSize: '0.85rem' }}>
          ({stats.total} réponses)
        </span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {entries.map(([label, count]) => {
          const pct = Math.round((count / stats.total) * 100);
          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                <span style={{ color: '#374151' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#2563EB' }}>{count} ({pct}%)</span>
              </div>
              <div style={{ background: '#EEF2FB', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, #2563EB, #60a5fa)',
                  width: `${Math.round((count / max) * 100)}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const check = () => {
    if (pwd === (process.env.NEXT_PUBLIC_RESULTATS_PASSWORD || 'tontine2026')) {
      onAuth();
    } else {
      setErr(true);
      setPwd('');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔐</div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 8 }}>
          Accès résultats
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Tableau de bord réservé à l'équipe TontineBénin
        </p>
        <input className="form-input" type="password" placeholder="Mot de passe"
          value={pwd} onChange={e => { setPwd(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && check()}
          style={{ marginBottom: '0.75rem', borderColor: err ? '#ef4444' : undefined }}
        />
        {err && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Mot de passe incorrect.</p>}
        <button className="btn-primary" onClick={check}>Accéder →</button>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 200, borderTop: `4px solid ${color}` }}>
      <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function ResultatsDashboard() {
  const [auth, setAuth] = useState(false);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeoutHelp, setShowTimeoutHelp] = useState(false);

  useEffect(() => {
    if (!auth) return;
    if (!db) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      if (loading) setShowTimeoutHelp(true);
    }, 7000);

    const dbRef = ref(db, 'sondage_reponses');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setReponses(data ? (Object.values(data) as Reponse[]) : []);
      setLoading(false);
      setShowTimeoutHelp(false);
      clearTimeout(timer);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [auth]);

  if (!auth) return <PasswordGate onAuth={() => setAuth(true)} />;

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="card" style={{ padding: '2rem', maxWidth: 400 }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
            <p style={{ color: '#1E3A8A', fontWeight: 600 }}>Chargement des données...</p>
            
            {showTimeoutHelp && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff7ed', borderRadius: 12, border: '1px solid #ffedd5' }}>
                <p style={{ color: '#9a3412', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>Connexion longue ?</strong><br/>
                  Si vous venez d'ajouter les variables sur Vercel, vous devez <strong>redéployer</strong> le projet pour qu'elles soient activées.
                </p>
                <button onClick={() => window.location.reload()} style={{
                  marginTop: '0.75rem', background: '#f97316', color: 'white', border: 'none',
                  padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}>
                  Actualiser la page
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!db) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Configuration Firebase manquante</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Les variables d'environnement Firebase ne sont pas configurées sur Vercel.<br/>
            Veuillez les ajouter dans <strong>Project Settings &gt; Environment Variables</strong>.
          </p>
        </div>
      </main>
    );
  }

  const stats = aggregate(reponses);

  // KPIs
  const npsScores = reponses.map(r => parseInt(r.npsScore || '-1')).filter(s => s >= 0);
  const promoters = npsScores.filter(s => s >= 9).length;
  const detractors = npsScores.filter(s => s <= 6).length;
  const nps = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : '-';

  const totalPerte = reponses.reduce((acc, r) => acc + (parseInt(r.montantPerdu || '0') || 0), 0);
  const switchPercent = Math.round((reponses.filter(r => r.pretASwitcher === 'Oui').length / reponses.length) * 100) || 0;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--lavender)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'white', borderRadius: 20, padding: '0.75rem',
            boxShadow: '0 4px 12px rgba(37,99,235,0.08)', marginBottom: '1rem'
          }}>
            <img src="/logo1.png" alt="TontineBénin" style={{ height: 80, width: 'auto' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 8 }}>
            Résultats du sondage 📊
          </h1>
        <div style={{
          display: 'inline-block', background: '#2563EB', color: 'white',
          borderRadius: 99, padding: '0.3rem 1rem', fontSize: '0.9rem', fontWeight: 600
        }}>
          {loading ? '...' : `${reponses.length} réponse${reponses.length !== 1 ? 's' : ''} · Temps réel 🔴`}
        </div>
      </div>

      {!loading && reponses.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }} className="kpi-container">
          <KPICard label="Net Promoter Score" value={nps} sub={`${promoters} Promoteurs / ${detractors} Détracteurs`} color="#10b981" />
          <KPICard label="Switch Rate" value={`${switchPercent}%`} sub="Prêts à quitter leur collecteur" color="#2563EB" />
          <KPICard label="Capital Perdu (Total)" value={`${totalPerte.toLocaleString()} F`} sub="Douleur financière identifiée" color="#ef4444" />
        </div>
      )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Chargement des données...
          </div>
        ) : reponses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>Aucune réponse pour le moment.</p>
          </div>
        ) : (
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '1.5rem', borderBottom: '2px solid #EEF2FB', paddingBottom: '0.5rem' }}>
                Statistiques Globales
              </h2>
              {stats.map((s, i) => <BarChart key={i} stats={s} />)}
            </div>

            {/* Liste des contacts */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #EEF2FB', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                  Volontaires & Contacts 📞
                </h2>
                <div style={{ background: '#EEF2FB', color: '#2563EB', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                  {reponses.filter(r => r.veutTesteur === 'Oui').length} inscrits
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 400 }}>
                  <thead>
                    <tr style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.75rem 0', borderBottom: '1px solid #EEF2FB' }}>Date</th>
                      <th style={{ padding: '0.75rem 0', borderBottom: '1px solid #EEF2FB' }}>Sexe/Âge</th>
                      <th style={{ padding: '0.75rem 0', borderBottom: '1px solid #EEF2FB' }}>Activité</th>
                      <th style={{ padding: '0.75rem 0', borderBottom: '1px solid #EEF2FB', textAlign: 'right' }}>Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reponses
                      .filter(r => r.veutTesteur === 'Oui')
                      .sort((a, b) => (b.creeLe || 0) - (a.creeLe || 0))
                      .map((r, i) => (
                        <tr key={i} style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                          <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f9fafb', color: '#9ca3af' }}>
                            {r.creeLe ? new Date(r.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                            {r.sexe} · {r.age}
                          </td>
                          <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                            {r.activite}
                          </td>
                          <td style={{ padding: '0.75rem 0', borderBottom: '1px solid #f9fafb', textAlign: 'right', fontWeight: 700, color: '#2563EB' }}>
                            {r.telephone || 'Non renseigné'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {reponses.filter(r => r.veutTesteur === 'Oui').length === 0 && (
                <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '1rem', fontSize: '0.9rem' }}>
                  Aucun participant n'a encore laissé son numéro.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
