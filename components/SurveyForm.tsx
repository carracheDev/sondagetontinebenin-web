'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { useRouter } from 'next/navigation';
import StepIndicator from './StepIndicator';

// Types
type FormData = {
  age: string; sexe: string; ville: string; activite: string;
  typedevise: string; receptionUSSD: string;
  epargne: string; frequence: string; montant: string;
  nbMembres: string;
  gestionnaireArgent: string;
  commMode: string;
  perteArgent: string; montantPerdu: string;
  fraisActuels: string;
  probleme: string; barriereAdoption: string;
  mobileMoney: string;
  fraisRetrait: string; souhaiteCredit: string; tauxCreditAcceptable: string;
  garantiePadme: string; pretASwitcher: string;
  besoinCredit12mois: string; refuseCredit: string;
  connaitPadme: string; dossierAuto: string;
  aCollecteur: string; collecteurTrace: string;
  preferenceCollecte: string; interetSMS: string;
  npsScore: string;
  veutTesteur: string; telephone: string;
};

const initialData: FormData = {
  age: '', sexe: '', ville: '', activite: '',
  typedevise: '', receptionUSSD: '',
  epargne: '', frequence: '', montant: '',
  nbMembres: '', gestionnaireArgent: '', commMode: '',
  perteArgent: '', montantPerdu: '',
  fraisActuels: '',
  probleme: '', barriereAdoption: '',
  mobileMoney: '',
  fraisRetrait: '', souhaiteCredit: '', tauxCreditAcceptable: '',
  garantiePadme: '', pretASwitcher: '',
  besoinCredit12mois: '', refuseCredit: '',
  connaitPadme: '', dossierAuto: '',
  aCollecteur: '', collecteurTrace: '',
  preferenceCollecte: '', interetSMS: '',
  npsScore: '',
  veutTesteur: '', telephone: '',
};

// Composant choix radio
function RadioChoice({ name, value, label, selected, onSelect }: {
  name: string; value: string; label: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button type="button" className={`choice-item ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <span className="choice-dot" />
      <span>{label}</span>
    </button>
  );
}

// Composant choix checkbox
function CheckboxChoice({ label, selected, onToggle }: {
  label: string; selected: boolean; onToggle: () => void;
}) {
  return (
    <button type="button" className={`choice-item ${selected ? 'selected' : ''}`} onClick={onToggle}>
      <div className="choice-dot" style={{ borderRadius: 4 }}>
        {selected && <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>}
      </div>
      <span>{label}</span>
    </button>
  );
}

const TOTAL_STEPS = 5;

export default function SurveyForm() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const set = (field: keyof FormData, value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  const toggleCheckbox = (field: keyof FormData, value: string) => {
    setData(prev => {
      const current = prev[field] as string;
      const parts = current ? current.split(', ') : [];
      const next = parts.includes(value)
        ? parts.filter(p => p !== (value as string))
        : [...parts, value];
      return { ...prev, [field]: next.join(', ') };
    });
  };

  const validate = (): boolean => {
    setError('');
    if (step === 1) {
      if (!data.age || !data.sexe || !data.ville.trim() || !data.activite || !data.typedevise) {
        setError('Veuillez répondre à toutes les questions de cette étape.');
        return false;
      }
    }
    if (step === 2) {
      if (!data.epargne || !data.frequence || !data.montant || !data.commMode) {
        setError('Veuillez répondre à toutes les questions obligatoires.');
        return false;
      }
      if ((data.epargne.includes('groupe') || data.epargne === 'Association') && (!data.nbMembres || !data.gestionnaireArgent)) {
        setError('Veuillez préciser les détails de votre groupe de tontine.');
        return false;
      }
    }
    if (step === 3) {
      if (!data.perteArgent || !data.fraisActuels || !data.probleme || !data.barriereAdoption || !data.mobileMoney) {
        setError('Veuillez répondre à toutes les questions de cette étape.');
        return false;
      }
      if (data.perteArgent === 'Oui' && !data.montantPerdu) {
        setError('Veuillez indiquer le montant approximatif perdu.');
        return false;
      }
    }
    if (step === 4) {
      if (!data.fraisRetrait || !data.souhaiteCredit || !data.garantiePadme || !data.pretASwitcher
          || !data.besoinCredit12mois || !data.connaitPadme || !data.dossierAuto) {
        setError('Veuillez répondre à toutes les questions de cette étape.');
        return false;
      }
      if (data.besoinCredit12mois === 'Oui' && !data.refuseCredit) {
        setError('Veuillez préciser si vous avez déjà été refusé(e).');
        return false;
      }
    }
    if (step === 5) {
      if (!data.npsScore || !data.veutTesteur || !data.preferenceCollecte
          || !data.aCollecteur || !data.collecteurTrace) {
        setError('Veuillez répondre aux questions obligatoires.');
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const submit = async () => {
    if (!validate()) return;
    if (!db) {
      setError("Erreur de configuration client. Veuillez réessayer plus tard.");
      return;
    }
    setLoading(true);
    try {
      await push(ref(db, 'sondage_reponses'), {
        ...data,
        montant: data.montant ? parseInt(data.montant) : null,
        telephone: data.telephone || null,
        creeLe: serverTimestamp(),
      });
      router.push('/merci');
    } catch (e) {
      setError("Erreur d'envoi. Vérifiez votre connexion et réessayez.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'white', borderRadius: 24, padding: '1rem',
          boxShadow: '0 4px 15px rgba(37,99,235,0.08)', marginBottom: '1.25rem'
        }}>
          <img src="/logo1.png" alt="TontineBénin" style={{ height: 100, width: 'auto' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 0.4rem' }}>
          Votre avis compte ! 🇧🇯
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
          Sondage anonyme · 3 minutes
        </p>
      </div>

      {!started && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E3A8A', marginTop: 0 }}>
            Bienvenue 👋
          </h2>
          <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.55, marginTop: '0.4rem' }}>
            <strong>TontineBénin</strong>, c&apos;est épargner et accéder au crédit en toute
            sécurité, depuis votre téléphone. Vos réponses (anonymes) nous aident à
            construire la meilleure solution pour vous.
          </p>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['💰', 'Tontine digitale', 'Cotisez en toute sécurité depuis une application, avec un reçu pour chaque dépôt.'],
              ['🧑🏾‍💼', 'Collecteur digital', 'Un agent vient vous assister à domicile pour épargner, sans jamais toucher d\'espèces : tout passe par votre téléphone (Android ou à touches).'],
              ['📱', 'Accès sans internet (USSD)', 'Pas de smartphone ni d\'internet ? Accédez aux services par code USSD (#) et SMS.'],
              ['💳', 'Micro-crédit', 'Un petit crédit débloqué grâce à votre régularité d\'épargne, sans paperasse.'],
              ['🏦', 'Crédit formel (PADME, FECECAM…)', 'De grandes institutions de microfinance au Bénin : l\'app génère votre dossier pour y accéder au crédit.'],
            ].map(([ico, titre, desc]) => (
              <div key={titre} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{ico}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>{titre}</div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid #bfdbfe', margin: '1.25rem 0' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#1E3A8A' }}>
              ⏱️ 3 minutes · 🔒 Anonyme · 🇧🇯 Pour le Bénin
            </p>
          </div>

          <button className="btn-primary" onClick={() => setStarted(true)} style={{ width: '100%' }}>
            Commencer le sondage →
          </button>
        </div>
      )}

      {started && <StepIndicator current={step} total={TOTAL_STEPS} />}

      {started && (
      <div className="card" style={{ marginTop: '1rem' }}>
        {/* ÉTAPE 1 — Profil */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginTop: 0 }}>
              👤 Votre profil
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                1. Quel est votre âge ? *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Moins de 18 ans', '18-25 ans', '26-35 ans', '36-45 ans', '46-60 ans', '60 ans et plus'].map((label, i) => {
                  const vals = ['<18','18-25','26-35','36-45','46-60','60+'];
                  return (
                    <RadioChoice key={i} name="age" value={vals[i]} label={label}
                      selected={data.age === vals[i]} onSelect={() => set('age', vals[i])} />
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                2. Vous êtes ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Homme','Femme'].map(v => (
                  <RadioChoice key={v} name="sexe" value={v} label={v}
                    selected={data.sexe === v} onSelect={() => set('sexe', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                3. Votre ville / quartier *
              </label>
              <input className="form-input" type="text" placeholder="Ex: Cotonou, Zogbo..."
                value={data.ville} onChange={e => set('ville', e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                4. Quelle est votre activité principale ? *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Zémidjan (Conducteur)', 'Commerçant(e)', 'Artisan(e)', 'Fonctionnaire (État)', 'Salarié(e) Privé', 'Étudiant / Apprenant', 'Association / Groupement', 'Autre'].map(v => (
                  <RadioChoice key={v} name="activite" value={v} label={v}
                    selected={data.activite === v} onSelect={() => set('activite', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                5. Quel type de téléphone utilisez-vous ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Android (Smartphone)', 'Téléphone à touches (Boutons)'].map(v => (
                  <RadioChoice key={v} name="typedevise" value={v} label={v}
                    selected={data.typedevise === v} onSelect={() => set('typedevise', v)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Épargne & Groupe */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginTop: 0 }}>
              💵 Votre épargne & groupe
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                6. Comment épargnez-vous actuellement ? (Plusieurs choix possibles) *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {[
                  'Épargne à la maison / Coffre-fort',
                  'Tontine de marché (Collecteur)',
                  'Tontine de groupe (Amis, Travail)',
                  'Banque / IMF (PADME, FECECAM, etc.)',
                  'Application mobile / MoMo',
                  'Association / Mutualité'
                ].map(v => {
                  const isSelected = data.epargne.split(', ').includes(v);
                  return (
                    <CheckboxChoice key={v} label={v}
                      selected={isSelected}
                      onToggle={() => toggleCheckbox('epargne', v)} />
                  );
                })}
              </div>
            </div>

            {(data.epargne.includes('groupe') || data.epargne.includes('Association')) && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 15, border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#475569', fontSize: '0.9rem' }}>
                    👥 Taille du groupe (Membres) *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['< 5', '5-15', '16-30', '31+'].map(v => (
                      <RadioChoice key={v} name="nbMembres" value={v} label={v}
                        selected={data.nbMembres === v} onSelect={() => set('nbMembres', v)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#475569', fontSize: '0.9rem' }}>
                    👤 Qui gère l'argent du groupe ? *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Un président/membre élu', 'Chacun à son tour (tournante)', 'Un gérant de confiance extérieur'].map(v => (
                      <RadioChoice key={v} name="gestionnaireArgent" value={v} label={v}
                        selected={data.gestionnaireArgent === v} onSelect={() => set('gestionnaireArgent', v)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                7. À quelle fréquence mettez-vous de l&apos;argent de côté ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Par jour', 'Par semaine', 'Par mois'].map(v => (
                  <RadioChoice key={v} name="frequence" value={v} label={v}
                    selected={data.frequence === v} onSelect={() => set('frequence', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                8. Combien cotisez-vous par cycle ? (FCFA) *
              </label>
              <input className="form-input" type="number" placeholder="Ex: 5000"
                value={data.montant} onChange={e => set('montant', e.target.value)} min={0} />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                9. Comment communiquez-vous dans votre tontine ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['WhatsApp', 'Appels direct', 'En personne', 'SMS'].map(v => (
                  <RadioChoice key={v} name="commMode" value={v} label={v}
                    selected={data.commMode === v} onSelect={() => set('commMode', v)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Expériences & Barrières */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginTop: 0 }}>
              📱 Expériences & Risques
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                10. Avez-vous déjà perdu de l'argent (fuite d'un gérant ou d'un responsable) ? *
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: data.perteArgent === 'Oui' ? '0.75rem' : 0 }}>
                {['Oui', 'Non'].map(v => (
                  <RadioChoice key={v} name="perteArgent" value={v} label={v}
                    selected={data.perteArgent === v} onSelect={() => set('perteArgent', v)} />
                ))}
              </div>
              {data.perteArgent === 'Oui' && (
                <input className="form-input" type="number" placeholder="Montant total perdu environ (FCFA) ?"
                  value={data.montantPerdu} onChange={e => set('montantPerdu', e.target.value)} />
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                11. Payez-vous des frais de tenue de compte ou des frais cachés actuellement ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui, c\'est trop cher', 'Non', 'Je ne sais pas'].map(v => (
                  <RadioChoice key={v} name="fraisActuels" value={v} label={v}
                    selected={data.fraisActuels === v} onSelect={() => set('fraisActuels', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                12. Quels défauts trouvez-vous dans votre système actuel ? (Plusieurs choix possibles) *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Manque de confiance', 'Pas de suivi clair', 'Risque de vol', 'Déplacements fatigants', 'Lenteur des retraits'].map(v => (
                  <CheckboxChoice key={v} label={v}
                    selected={data.probleme.split(', ').includes(v)}
                    onToggle={() => toggleCheckbox('probleme', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                12. Qu'est-ce qui vous ferait PEUR avec une application ? (Plusieurs choix possibles) *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Risque de piratage', 'Trop compliqué à utiliser', 'Pas d\'internet', 'Pas de contact humain', 'Rien, je suis prêt'].map(v => (
                  <CheckboxChoice key={v} label={v}
                    selected={data.barriereAdoption.split(', ').includes(v)}
                    onToggle={() => toggleCheckbox('barriereAdoption', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                13. Quels réseaux Mobile Money utilisez-vous ? (Plusieurs choix possibles) *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['MTN MoMo', 'Moov Money', 'Celtiis Cash', 'Aucun'].map(v => (
                  <CheckboxChoice key={v} label={v}
                    selected={data.mobileMoney.split(', ').includes(v)}
                    onToggle={() => toggleCheckbox('mobileMoney', v)} />
                ))}
              </div>
            </div>

            {data.typedevise === 'Téléphone à touches (Nokia)' && (
              <div style={{ marginTop: '1.25rem', background: '#f0f9ff', padding: '1rem', borderRadius: 12, border: '1px solid #bae6fd' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#0369a1', fontSize: '0.9rem' }}>
                  📞 Option USSD (Sans internet)
                </label>
                <p style={{ fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                  Seriez-vous prêt à gérer par codes comme *144# ?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {['Oui', 'Non'].map(v => (
                    <RadioChoice key={v} name="receptionUSSD" value={v} label={v}
                      selected={data.receptionUSSD === v} onSelect={() => set('receptionUSSD', v)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 — La Solution */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginTop: 0 }}>
              🎯 Votre avis sur TontineBénin
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                14. Frais Fixes : Accepteriez-vous 100 F pour 5 000 F retirés (plus sûr que MoMo) ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Trop cher', 'Peut-être'].map(v => (
                  <RadioChoice key={v} name="fraisRetrait" value={v} label={v}
                    selected={data.fraisRetrait === v} onSelect={() => set('fraisRetrait', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                15. Auriez-vous besoin d'un coup de main financier (crédit activité) basé sur votre épargne ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Non'].map(v => (
                  <RadioChoice key={v} name="souhaiteCredit" value={v} label={v}
                    selected={data.souhaiteCredit === v} onSelect={() => set('souhaiteCredit', v)} />
                ))}
              </div>
            </div>

            {data.souhaiteCredit === 'Oui' && (
              <div style={{ marginBottom: '1.25rem', background: '#fefce8', padding: '1rem', borderRadius: 12, border: '1px solid #fef08a' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#854d0e', fontSize: '0.9rem' }}>
                   📈 Taux d'intérêt acceptable par mois
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['5%', '10%', '15%', '20%'].map(v => (
                    <RadioChoice key={v} name="tauxCreditAcceptable" value={v} label={v}
                      selected={data.tauxCreditAcceptable === v} onSelect={() => set('tauxCreditAcceptable', v)} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                16. Savoir vos fonds **garantis par PADME** augmenterait-il votre confiance ? *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Oui, énormément', 'Oui, un peu', 'Pas forcément'].map(v => (
                  <RadioChoice key={v} name="garantiePadme" value={v} label={v}
                    selected={data.garantiePadme === v} onSelect={() => set('garantiePadme', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                17. Seriez-vous prêt(e) à quitter votre système actuel pour TontineBénin ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Non', 'À tester'].map(v => (
                  <RadioChoice key={v} name="pretASwitcher" value={v} label={v}
                    selected={data.pretASwitcher === v} onSelect={() => set('pretASwitcher', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                Avez-vous eu besoin d&apos;un crédit ces 12 derniers mois (stock, urgence, projet) ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Non'].map(v => (
                  <RadioChoice key={v} name="besoinCredit12mois" value={v} label={v}
                    selected={data.besoinCredit12mois === v} onSelect={() => set('besoinCredit12mois', v)} />
                ))}
              </div>
            </div>

            {data.besoinCredit12mois === 'Oui' && (
              <div style={{ marginBottom: '1.25rem', background: '#fefce8', padding: '1rem', borderRadius: 12, border: '1px solid #fef08a' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#854d0e', fontSize: '0.9rem' }}>
                  Avez-vous déjà été refusé(e) faute d&apos;historique ou de garantie ?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Oui', 'Non'].map(v => (
                    <RadioChoice key={v} name="refuseCredit" value={v} label={v}
                      selected={data.refuseCredit === v} onSelect={() => set('refuseCredit', v)} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                Connaissez-vous les microfinances (ex. PADME) ? *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Oui, j\'y suis client(e)', 'J\'en ai entendu parler', 'Non'].map(v => (
                  <RadioChoice key={v} name="connaitPadme" value={v} label={v}
                    selected={data.connaitPadme === v} onSelect={() => set('connaitPadme', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                Si l&apos;app générait AUTOMATIQUEMENT votre dossier de crédit (basé sur votre épargne) pour une institution comme PADME, l&apos;utiliseriez-vous ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Peut-être', 'Non'].map(v => (
                  <RadioChoice key={v} name="dossierAuto" value={v} label={v}
                    selected={data.dossierAuto === v} onSelect={() => set('dossierAuto', v)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 — NPS & Contact */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginTop: 0 }}>
              🚀 Recommandation & Lancement
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', color: '#374151' }}>
                18. Recommanderiez-vous TontineBénin à un proche ? *
                <span style={{ display: 'block', fontWeight: 400, fontSize: '0.75rem', color: '#64748b' }}>(0 = Jamais, 10 = Absolument)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                  <button key={v} type="button" onClick={() => set('npsScore', v.toString())}
                    style={{
                      width: 38, height: 38, borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
                      border: '1px solid #e2e8f0',
                      background: data.npsScore === v.toString() ? '#2563EB' : 'white',
                      color: data.npsScore === v.toString() ? 'white' : '#1e293b',
                      transition: 'all 0.2s'
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                Passez-vous par un collecteur (agent qui collecte l&apos;argent) aujourd&apos;hui ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Non', 'Parfois'].map(v => (
                  <RadioChoice key={v} name="aCollecteur" value={v} label={v}
                    selected={data.aCollecteur === v} onSelect={() => set('aCollecteur', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                Aimeriez-vous un collecteur dont CHAQUE dépôt est confirmé sur votre téléphone (SMS/app) ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui sûrement', 'Peut-être', 'Non'].map(v => (
                  <RadioChoice key={v} name="collecteurTrace" value={v} label={v}
                    selected={data.collecteurTrace === v} onSelect={() => set('collecteurTrace', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                19. Mode de collecte préféré ? *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Visite d\'un agent de terrain', 'Dépôt direct Mobile Money'].map(v => (
                  <RadioChoice key={v} name="preferenceCollecte" value={v} label={v}
                    selected={data.preferenceCollecte === v} onSelect={() => set('preferenceCollecte', v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', color: '#374151' }}>
                20. Souhaitez-vous être testeur privilégié ? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Oui', 'Non'].map(v => (
                  <RadioChoice key={v} name="veutTesteur" value={v} label={v}
                    selected={data.veutTesteur === v} onSelect={() => set('veutTesteur', v)} />
                ))}
              </div>
            </div>

            {data.veutTesteur === 'Oui' && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>
                  Votre numéro de téléphone (facultatif)
                </label>
                <input className="form-input" type="tel" placeholder="Ex: 01XXXXXXXX"
                  value={data.telephone} onChange={e => set('telephone', e.target.value)} />
              </div>
            )}

            <div style={{ background: '#eff6ff', borderRadius: 12, padding: '1rem', border: '1px solid #bfdbfe', marginTop: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                🛡️ Vos données sont protégées et ne seront utilisées que pour valider ce projet.
              </p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '0.75rem 1rem', marginTop: '1rem', color: '#dc2626', fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }} className="btn-container">
          {step > 1 && (
            <button className="btn-secondary" onClick={prev} style={{ flex: 1 }}>
              ← Retour
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button className="btn-primary" onClick={next} style={{ flex: 2 }}>
              Continuer →
            </button>
          ) : (
            <button className="btn-primary" onClick={submit} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Envoi...' : '✅ Terminer'}
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
