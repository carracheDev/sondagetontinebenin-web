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
  besoinCredit12mois?: string; refuseCredit?: string;
  connaitPadme?: string; dossierAuto?: string;
  aCollecteur?: string; collecteurTrace?: string;
  preferenceCollecte?: string; interetSMS?: string;
  npsScore?: string;
  veutTesteur?: string; telephone?: string;
  creeLe?: number;
};

// Colonnes du tableau (ordre + libellé court)
const COLS: { key: keyof Reponse; label: string }[] = [
  { key: 'creeLe', label: 'Date' },
  { key: 'age', label: 'Âge' },
  { key: 'sexe', label: 'Sexe' },
  { key: 'ville', label: 'Ville' },
  { key: 'activite', label: 'Activité' },
  { key: 'typedevise', label: 'Téléphone' },
  { key: 'epargne', label: 'Épargne' },
  { key: 'frequence', label: 'Fréquence' },
  { key: 'montant', label: 'Montant' },
  { key: 'nbMembres', label: 'Membres' },
  { key: 'gestionnaireArgent', label: 'Gestionnaire' },
  { key: 'commMode', label: 'Communication' },
  { key: 'perteArgent', label: 'A perdu' },
  { key: 'montantPerdu', label: 'Montant perdu' },
  { key: 'fraisActuels', label: 'Frais actuels' },
  { key: 'probleme', label: 'Défauts' },
  { key: 'barriereAdoption', label: 'Peurs app' },
  { key: 'mobileMoney', label: 'Mobile Money' },
  { key: 'receptionUSSD', label: 'USSD' },
  { key: 'fraisRetrait', label: 'Frais retrait' },
  { key: 'souhaiteCredit', label: 'Veut crédit' },
  { key: 'tauxCreditAcceptable', label: 'Taux ok' },
  { key: 'besoinCredit12mois', label: 'Besoin crédit 12m' },
  { key: 'refuseCredit', label: 'Refusé crédit' },
  { key: 'connaitPadme', label: 'Connaît PADME' },
  { key: 'dossierAuto', label: 'Dossier auto' },
  { key: 'garantiePadme', label: 'Garantie PADME' },
  { key: 'aCollecteur', label: 'A collecteur' },
  { key: 'collecteurTrace', label: 'Collecteur tracé' },
  { key: 'preferenceCollecte', label: 'Préf. collecte' },
  { key: 'pretASwitcher', label: 'Prêt à switcher' },
  { key: 'npsScore', label: 'NPS' },
  { key: 'veutTesteur', label: 'Testeur' },
  { key: 'telephone', label: 'Téléphone' },
];

// Champs à choix multiples (séparés par ", ")
const MULTI = new Set(['epargne', 'probleme', 'barriereAdoption', 'mobileMoney']);

type QuestionStats = { field: string; label: string; counts: Record<string, number>; total: number };

function aggregate(reponses: Reponse[]): QuestionStats[] {
  const count = (field: keyof Reponse) => {
    const c: Record<string, number> = {};
    reponses.forEach(r => {
      const v = r[field];
      if (v && typeof v === 'string') {
        if (MULTI.has(field as string)) {
          v.split(', ').forEach(part => { if (part) c[part] = (c[part] || 0) + 1; });
        } else {
          c[v] = (c[v] || 0) + 1;
        }
      }
    });
    return c;
  };
  const repondus = (field: keyof Reponse) => reponses.filter(r => r[field]).length || reponses.length;
  const defs: { field: keyof Reponse; label: string }[] = [
    { field: 'age', label: 'Âge' },
    { field: 'sexe', label: 'Sexe' },
    { field: 'activite', label: 'Activité' },
    { field: 'typedevise', label: 'Type de téléphone' },
    { field: 'epargne', label: 'Habitudes d\'épargne' },
    { field: 'frequence', label: 'Fréquence' },
    { field: 'perteArgent', label: 'A déjà perdu de l\'argent' },
    { field: 'fraisActuels', label: 'Frais/pénalités actuels' },
    { field: 'probleme', label: 'Défauts du système actuel' },
    { field: 'barriereAdoption', label: 'Peurs avec une app' },
    { field: 'mobileMoney', label: 'Réseaux Mobile Money' },
    { field: 'receptionUSSD', label: 'Intérêt USSD' },
    { field: 'fraisRetrait', label: 'Acceptation des frais' },
    { field: 'souhaiteCredit', label: 'Intérêt pour le crédit' },
    { field: 'besoinCredit12mois', label: 'Besoin de crédit (12 mois)' },
    { field: 'refuseCredit', label: 'Déjà refusé de crédit' },
    { field: 'connaitPadme', label: 'Connaît PADME / microfinance' },
    { field: 'dossierAuto', label: 'Veut un dossier de crédit auto' },
    { field: 'garantiePadme', label: 'Impact garantie PADME' },
    { field: 'aCollecteur', label: 'Passe par un collecteur' },
    { field: 'collecteurTrace', label: 'Veut un collecteur tracé' },
    { field: 'preferenceCollecte', label: 'Préférence de collecte' },
    { field: 'pretASwitcher', label: 'Prêt à switcher' },
    { field: 'veutTesteur', label: 'Veut être testeur' },
  ];
  return defs.map(d => ({
    field: d.field as string,
    label: d.label,
    counts: count(d.field),
    total: repondus(d.field),
  }));
}

// ── Exports ────────────────────────────────────────────────
function telechargerFichier(nom: string, contenu: string, type: string) {
  const blob = new Blob(['﻿' + contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(v: unknown) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

function exportDonneesCSV(reponses: Reponse[]) {
  const header = COLS.map(c => esc(c.label)).join(',');
  const body = reponses.map(r =>
    COLS.map(c =>
      c.key === 'creeLe'
        ? esc(r.creeLe ? new Date(r.creeLe).toLocaleString('fr-FR') : '')
        : esc(r[c.key])
    ).join(',')
  ).join('\n');
  telechargerFichier('tontinebenin-reponses.csv', header + '\n' + body, 'text/csv;charset=utf-8');
}

function exportPourcentagesCSV(stats: QuestionStats[]) {
  let out = 'Question,Réponse,Nombre,Pourcentage\n';
  stats.forEach(s => {
    Object.entries(s.counts).sort((a, b) => b[1] - a[1]).forEach(([opt, c]) => {
      const pct = s.total ? Math.round((c / s.total) * 100) : 0;
      out += [esc(s.label), esc(opt), c, esc(pct + ' %')].join(',') + '\n';
    });
  });
  telechargerFichier('tontinebenin-pourcentages.csv', out, 'text/csv;charset=utf-8');
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const check = () => {
    if (pwd === (process.env.NEXT_PUBLIC_RESULTATS_PASSWORD || 'tontine2026')) onAuth();
    else { setErr(true); setPwd(''); }
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔐</div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 8 }}>Accès résultats</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Tableau de bord réservé à l&apos;équipe TontineBénin</p>
        <input className="form-input" type="password" placeholder="Mot de passe"
          value={pwd} onChange={e => { setPwd(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && check()}
          style={{ marginBottom: '0.75rem', borderColor: err ? '#ef4444' : undefined }} />
        {err && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Mot de passe incorrect.</p>}
        <button className="btn-primary" onClick={check}>Accéder →</button>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 180, borderTop: `4px solid ${color}` }}>
      <p style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function ResultatsDashboard() {
  const [auth, setAuth] = useState(false);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) { if (!db) setLoading(false); return; }
    const dbRef = ref(db, 'sondage_reponses');
    const unsub = onValue(dbRef, (snap) => {
      const data = snap.val();
      setReponses(data ? (Object.values(data) as Reponse[]) : []);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [auth]);

  if (!auth) return <PasswordGate onAuth={() => setAuth(true)} />;

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#1E3A8A', fontWeight: 600 }}>Chargement des données…</p>
        </div>
      </main>
    );
  }

  if (!db) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#ef4444' }}>Configuration Firebase manquante</h2>
        </div>
      </main>
    );
  }

  const stats = aggregate(reponses);
  const total = reponses.length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  // KPIs clés (texte, pas de graphique)
  const perteOui = pct(reponses.filter(r => r.perteArgent === 'Oui').length);
  const veutCredit = pct(reponses.filter(r => (r.souhaiteCredit === 'Oui') || (r.besoinCredit12mois === 'Oui')).length);
  const collecteurTrace = pct(reponses.filter(r => r.collecteurTrace === 'Oui sûrement').length);
  const testeurs = reponses.filter(r => r.veutTesteur === 'Oui').length;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--lavender)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 8 }}>
            Résultats du sondage
          </h1>
          <div style={{ display: 'inline-block', background: '#2563EB', color: 'white', borderRadius: 99, padding: '0.3rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
            {total} réponse{total !== 1 ? 's' : ''} · Temps réel 🔴
          </div>
        </div>

        {/* Boutons export */}
        <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button className="btn-primary" onClick={() => exportDonneesCSV(reponses)} disabled={!total}>
            📥 Exporter les données (CSV)
          </button>
          <button className="btn-secondary" onClick={() => exportPourcentagesCSV(stats)} disabled={!total}>
            📊 Télécharger les pourcentages (CSV)
          </button>
          <button className="btn-secondary" onClick={() => window.print()} disabled={!total}>
            🖨️ Exporter en PDF
          </button>
        </div>

        {total > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <KPICard label="Ont perdu de l'argent" value={`${perteOui}%`} sub="Le problème est réel" color="#ef4444" />
            <KPICard label="Intéressés par le crédit" value={`${veutCredit}%`} sub="Marché du crédit" color="#2563EB" />
            <KPICard label="Veulent un collecteur tracé" value={`${collecteurTrace}%`} sub="Demande collecteur digital" color="#10b981" />
            <KPICard label="Testeurs inscrits" value={testeurs} sub="Contacts laissés" color="#f59e0b" />
          </div>
        )}

        {total === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>Aucune réponse pour le moment. Partagez le lien du sondage !</p>
          </div>
        ) : (
          <>
            {/* TABLEAU : 1 ligne par répondant */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '1rem' }}>
                Réponses — 1 ligne par participant
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: '#EEF2FB', color: '#1E3A8A' }}>
                      <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>#</th>
                      {COLS.map(c => (
                        <th key={c.key} style={{ padding: '0.5rem 0.6rem', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 700 }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reponses
                      .slice()
                      .sort((a, b) => (b.creeLe || 0) - (a.creeLe || 0))
                      .map((r, i) => (
                        <tr key={i} style={{ color: '#1f2937', background: i % 2 ? '#fafbff' : 'white' }}>
                          <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9', color: '#9ca3af' }}>{i + 1}</td>
                          {COLS.map(c => (
                            <td key={c.key} style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9' }}>
                              {c.key === 'creeLe'
                                ? (r.creeLe ? new Date(r.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—')
                                : (r[c.key] || '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* POURCENTAGES (tableau, pas de graphique) */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '1rem' }}>
                Statistiques en pourcentage
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#EEF2FB', color: '#1E3A8A', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb' }}>Question</th>
                      <th style={{ padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb' }}>Réponse</th>
                      <th style={{ padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>Nb</th>
                      <th style={{ padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.flatMap(s => {
                      const entries = Object.entries(s.counts).sort((a, b) => b[1] - a[1]);
                      return entries.map(([opt, c], idx) => (
                        <tr key={s.field + opt} style={{ color: '#1f2937' }}>
                          <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9', fontWeight: idx === 0 ? 700 : 400, color: idx === 0 ? '#1E3A8A' : '#9ca3af' }}>
                            {idx === 0 ? s.label : ''}
                          </td>
                          <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9' }}>{opt}</td>
                          <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9', textAlign: 'right' }}>{c}</td>
                          <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 700, color: '#2563EB' }}>
                            {s.total ? Math.round((c / s.total) * 100) : 0}%
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
