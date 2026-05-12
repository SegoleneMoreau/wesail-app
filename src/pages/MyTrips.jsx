import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyTrips.css'

const TRAJETS = {
  avenir: [
    { id: 1, route: 'Marseille → Porto-Vecchio', bateau: 'Jeanneau Sun Odyssey 40', date: '14 juin 2026', duree: '8 jours', places: '2/4 occupées', role: 'skipper', status: 'soon', equipiers: [{ av: 'TL', avc: '#185fa5' }, { av: 'CD', avc: '#993556' }] },
    { id: 2, route: 'Marseille → Ibiza', bateau: 'Jeanneau Sun Odyssey 40', date: '1 juil. 2026', duree: '10 jours', places: '1/3 occupée', role: 'skipper', status: 'soon', equipiers: [{ av: 'PB', avc: '#0f6e56' }] },
  ],
  passes: [
    { id: 3, route: 'Tour de Corse', bateau: 'Jeanneau Sun Odyssey 40', date: '3–12 juin 2025', duree: '9 jours', places: '4/4', role: 'skipper', status: 'ok', equipiers: [{ av: 'TL', avc: '#185fa5' }, { av: 'AD', avc: '#854f0b' }, { av: 'MV', avc: '#534ab7' }], avis: true },
    { id: 4, route: 'Marseille → Santorin', bateau: 'Jeanneau Sun Odyssey 40', date: '14–26 mai 2025', duree: '12 jours', places: '3/3', role: 'skipper', status: 'ok', equipiers: [{ av: 'JM', avc: '#0f6e56' }, { av: 'RK', avc: '#854d0e' }], avis: false },
    { id: 5, route: 'Tour de Bretagne', bateau: 'Bénéteau Oceanis 35', date: 'Août 2024', duree: '14 jours', places: '4/4', role: 'equipier', status: 'ok', equipiers: [], avis: true },
  ],
  attente: [
    { id: 6, route: 'Traversée Atlantique', bateau: 'À définir', date: 'Nov. 2026', duree: '21 jours', places: 'En cours', role: 'equipier', status: 'att', equipiers: [] },
  ],
  annonces: [
    { id: 7, route: 'Marseille → Ibiza', bateau: 'Jeanneau Sun Odyssey 40', date: '1 juil. 2026', duree: '10 jours', places: '2 places disponibles', role: 'skipper', status: 'actif', equipiers: [{ av: 'PB', avc: '#0f6e56' }] },
    { id: 8, route: 'Tour de Méditerranée', bateau: 'Jeanneau Sun Odyssey 40', date: 'Sept. 2026', duree: '21 jours', places: '3 places disponibles', role: 'skipper', status: 'actif', equipiers: [] },
  ],
}

const TABS = [
  { id: 'avenir', label: 'À venir' },
  { id: 'passes', label: 'Passés' },
  { id: 'attente', label: 'En attente' },
  { id: 'annonces', label: 'Mes annonces' },
]

export default function MyTrips() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('avenir')

  const items = TRAJETS[tab] || []

  return (
    <div className="mytrips-page">
      <div className="mytrips-topbar">
        <span className="mytrips-topbar-title">Mes trajets</span>
        <button className="mytrips-new-btn" onClick={() => navigate('/annonce')}>+ Nouveau</button>
      </div>

      <div className="mytrips-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`mytrips-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="mytrips-tab-cnt">{TRAJETS[t.id].length}</span>
          </button>
        ))}
      </div>

      <div className="mytrips-content">
        {items.length === 0 && (
          <div className="mytrips-empty">
            <div className="mytrips-empty-icon">⛵</div>
            <p>Aucun trajet dans cette catégorie.</p>
            {tab === 'annonces' && (
              <button className="mytrips-empty-btn" onClick={() => navigate('/annonce')}>Déposer une annonce</button>
            )}
          </div>
        )}

        {items.map(t => (
          <div key={t.id} className="mytrips-card">
            <div className="mytrips-card-header">
              <div className="mytrips-card-role">{t.role === 'skipper' ? '⚓ Skipper' : '👤 Équipier'}</div>
              <div className={`mytrips-card-statut ${t.status}`}>
                {t.status === 'soon' && '🟢 À venir'}
                {t.status === 'ok' && '✓ Terminé'}
                {t.status === 'att' && '⏳ En attente'}
                {t.status === 'actif' && '📢 Actif'}
              </div>
            </div>

            <div className="mytrips-card-route">{t.route}</div>
            <div className="mytrips-card-meta">
              <span>📅 {t.date}</span>
              <span>⏱ {t.duree}</span>
              <span>👥 {t.places}</span>
            </div>
            <div className="mytrips-card-bateau">⛵ {t.bateau}</div>

            {/* Équipiers */}
            {t.equipiers.length > 0 && (
              <div className="mytrips-equipiers">
                {t.equipiers.map((e, i) => (
                  <div key={i} className="mytrips-eq-av" style={{ background: e.avc }}>{e.av}</div>
                ))}
              </div>
            )}

            {/* Avis à donner */}
            {tab === 'passes' && !t.avis && (
              <div className="mytrips-avis-cta">
                ⭐ Donnez un avis à vos équipiers
                <button className="mytrips-avis-btn">Laisser un avis</button>
              </div>
            )}

            <div className="mytrips-card-actions">
              <button className="mytrips-btn-sec" onClick={() => navigate(`/trip/${t.id}`)}>Voir le trajet</button>
              <button className="mytrips-btn-sec" onClick={() => navigate('/messages')}>Messages</button>
              {tab === 'annonces' && (
                <button className="mytrips-btn-sec danger">Supprimer</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}