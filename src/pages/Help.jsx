import { useState } from 'react'
import './Help.css'

const FAQ = [
  {q:"Comment fonctionne WeSail ?",a:"WeSail met en relation des skippers qui proposent des places à bord avec des équipiers qui cherchent à naviguer. Le skipper publie une annonce, les équipiers postulent, et le skipper accepte les demandes."},
  {q:"Est-ce que WeSail prend une commission ?",a:"Oui, WeSail prend 6% sur le prix affiché. Le skipper reçoit 94% du montant. Cette commission couvre les frais de plateforme, le support et l'assurance."},
  {q:"Comment contacter un skipper ?",a:"Depuis la page détail d'un trajet, cliquez sur Contacter le skipper. Un message lui sera envoyé directement via la messagerie WeSail."},
  {q:"Puis-je annuler une réservation ?",a:"Oui, jusqu'à 48h avant le départ. Après ce délai, les conditions d'annulation du skipper s'appliquent."},
  {q:"Comment fonctionne le paiement ?",a:"Le paiement est sécurisé via Stripe. Votre carte n'est débitée qu'après acceptation de votre demande par le skipper."},
  {q:"Comment publier un trajet ?",a:"Cliquez sur Déposer une annonce dans le menu. Remplissez les 3 étapes : trajet, places et prix, description. Votre annonce sera visible immédiatement."},
]

export default function Help() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="help-page">
      <div className="help-topbar">
        <span className="help-topbar-title">Aide et Support</span>
      </div>
      <div className="help-content">
        <div className="help-contact">
          <div className="help-contact-icon">💬</div>
          <div>
            <div className="help-contact-title">Besoin d'aide ?</div>
            <div className="help-contact-sub">Notre équipe répond en moins de 24h</div>
          </div>
          <a href="mailto:support@wesail.fr" className="help-contact-btn">Nous contacter</a>
        </div>

        <div className="help-faq-title">Questions fréquentes</div>

        <div className="help-faq-list">
          {FAQ.map((item, i) => (
            <div key={i} className="help-faq-item">
              <button
                className="help-faq-q"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="help-faq-q-text">{item.q}</span>
                <span className="help-faq-chevron">{openIdx === i ? '▲' : '▼'}</span>
              </button>
              {openIdx === i && (
                <div className="help-faq-a">{item.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="help-links">
          <div className="help-links-title">Liens utiles</div>
          <div className="help-link">📄 Conditions générales d'utilisation</div>
          <div className="help-link">🔒 Politique de confidentialité</div>
          <div className="help-link">⚓ Guide du skipper</div>
          <div className="help-link">🧭 Guide de l'équipier</div>
        </div>

        <div className="help-version">WeSail v1.0.0 · Made with love in France</div>
      </div>
    </div>
  )
}
