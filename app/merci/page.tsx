'use client';

import { useEffect, useState } from 'react';

const LIEN = typeof window !== 'undefined' ? window.location.origin + '/sondage' : '/sondage';

export default function MerciPage() {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('/sondage');

  useEffect(() => { setLink(window.location.origin + '/sondage'); }, []);

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    '🇧🇯 Participe au sondage TontineBénin et aide à digitaliser les tontines au Bénin ! ' + link
  )}`;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'white', borderRadius: 24, padding: '1rem',
            boxShadow: '0 4px 15px rgba(37,99,235,0.08)', marginBottom: '1.25rem'
          }}>
            <img src="/logo1.png" alt="TontineBénin" style={{ height: 140, width: 'auto' }} />
          </div>

          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #1E3A8A)',
            margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}>✅</div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 0.5rem' }}>
            Merci pour votre participation !
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Vos réponses ont bien été enregistrées. 🎉
          </p>
          <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Elles aideront TontineBénin à construire une solution <strong>faite pour vous</strong>, 
            pour sécuriser et simplifier les tontines au Bénin.
          </p>

          {/* Partager */}
          <div style={{
            background: '#EEF2FB', borderRadius: 14, padding: '1.25rem',
            marginBottom: '1rem',
          }}>
            <p style={{ fontWeight: 700, color: '#1E3A8A', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              📢 Partagez le sondage autour de vous !
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Plus on a de réponses, plus la solution sera adaptée à notre réalité.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.95rem',
                  padding: '0.75rem', borderRadius: 10, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}>
                <span>💬</span> Partager sur WhatsApp
              </a>
              <button onClick={copy} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'white', color: '#2563EB', fontWeight: 600, fontSize: '0.9rem',
                padding: '0.75rem', borderRadius: 10, border: '2px solid #2563EB', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {copied ? '✅ Lien copié !' : '🔗 Copier le lien du sondage'}
              </button>
            </div>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            TontineBénin · Digitaliser l'épargne, inclure tous les Béninois 🇧🇯
          </p>
        </div>
      </div>
    </main>
  );
}
