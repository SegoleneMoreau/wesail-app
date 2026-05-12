import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './PublicProfile.css'

const MOCK_USERS = [
  {
    id: 1, prenom: 'Thomas', nom: 'Leroy', av: 'TL', avc: '#185fa5', niveau: 4,
    genre: 'm', bio: 'Skipper professionnel, 15 ans de navigation. Spécialiste Méditerranée et Atlantique. Passionné de voile hauturière.',
    note: 4.9, avis_count: 47, trajets_count: 89, milles: 12400, abonnes: 312,
    bateau: 'Jeanneau Sun Odyssey 440', port: 'Marseille', membre: '2022',
    certifs: ['Permis hauturier', 'Brevet de chef de bord', 'Radio VHF / SRC'],
    avis: [
      { av: 'CD', avc: '#993556', auteur: 'Claire D.', note: 5, trip: 'Marseille → Porto-Vecchio', date: 'mars 2026', texte: 'Excellent skipper, très pédagogue et rassurant.' },
      { av: 'MM', avc: '#d97706', auteur: 'Marie M.', note: 5, trip: 'Nice → Ajaccio', date: 'fév. 2026', texte: 'Traversée parfaite, Thomas est un professionnel.' },
      { av: 'PB', avc: '#0f6e56', auteur: 'Pierre B.', note: 4, trip: 'Brest → Saint-Malo', date: 'jan. 2026', texte: 'Très bon skipper, bonne ambiance à bord.' },
    ],
    trajets: [
      { id: 1, titre: 'Marseille → Porto-Vecchio', date: '14 juin 2026', places: '2 places', prix: 159 },
      { id: 5, titre: 'Toulon → Saint-Tropez', date: '10 juil. 2026', places: '2 places', prix: 95 },
    ],
    posts: [
      { cat: 'Météo', titre: 'Conditions en Méditerranée cet été ?', texte: 'Quelqu\'un a des infos sur les conditions prévues ?', likes: 24, comments: 8, date: 'il y a 2h' },
      { cat: 'Récits', titre: 'Traversée Marseille-Bonifacio en 18h', texte: 'Récit de notre dernière traversée...', likes: 41, comments: 12, date: 'il y a 3j' },
    ],
    annonces: [
      { id: 1, titre: 'Marseille → Porto-Vecchio', date: '14 juin 2026', places: '2 places', prix: 159 },
    ]
  },
]

const NIVEAUX = ['', 'Débutant', 'Initié', 'Expérimenté', 'Skipper']

function Stars({ note }) {
  return (
    <div className="pp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= note ? '#f59e0b' : '#dde4ec' }}>★</span>
      ))}
    </div>
  )
}

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('info')
  const [following, setFollowing] = useState(false)

  const user = MOCK_USERS.find(u => u.id === parseInt(id)) || MOCK_USERS[0]

  const TABS = [
    { id: 'info', label: 'Infos' },
    { id: 'avis', label: `Avis (${user.avis.length})` },
    { id: 'trajets', label: 'Trajets' },
    { id: 'forum', label: 'Forum' },
  ]

  return (
    <div className="pubprof-page">
      <div className="pubprof-header">
        <button className="pubprof-back" onClick={() => navigate(-1)}>← Retour</button>
        <span className="pubprof-header-title">Profil</span>
      </div>

      <div className="pubprof-scroll">
        {/* Hero */}
        <div className="pubprof-hero">
          <div className="pubprof-av" style={{ background: user.avc }}>{user.av}</div>
          <div className="pubprof-hero-info">
            <div className="pubprof-name">{user.prenom} {user.nom}</div>
            <div className="pubprof-meta">{NIVEAUX[user.niveau]} · {user.port}</div>
            <div className="pubprof-note">★ {user.note} · {user.avis_count} avis</div>
          </div>
          <div className="pubprof-hero-actions">
            <button className={`pubprof-follow-btn ${following ? 'following' : ''}`} onClick={() => setFollowing(f => !f)}>
              {following ? '✓ Abonné' : '+ Suivre'}
            </button>
            <button className="pubprof-msg-btn" onClick={() => navigate('/messages')}>💬</button>
          </div>
        </div>

        {/* Stats */}
        <div className="pubprof-stats">
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.trajets_count}</div><div className="pubprof-stat-label">Trajets</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.note}</div><div className="pubprof-stat-label">Note</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{(user.milles / 1000).toFixed(1)}k</div><div className="pubprof-stat-label">Milles</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.abonnes}</div><div className="pubprof-stat-label">Abonnés</div></div>
        </div>

        {/* Onglets */}
        <div className="pubprof-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`pubprof-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pubprof-tab-content">
          {/* Infos */}
          {tab === 'info' && (
            <div className="pubprof-section">
              <p className="pubprof-bio">{user.bio}</p>
              <div className="pubprof-info-row"><span>⛵ Bateau</span><span>{user.bateau}</span></div>
              <div className="pubprof-info-row"><span>📍 Port</span><span>{user.port}</span></div>
              <div className="pubprof-info-row"><span>📅 Membre depuis</span><span>{user.membre}</span></div>
              {user.certifs && (
                <div className="pubprof-certifs">
                  <div className="pubprof-certifs-title">Certifications</div>
                  {user.certifs.map((c, i) => (
                    <span key={i} className="pubprof-certif-badge">{c}</span>
                  ))}
                </div>
              )}
              {/* Annonces actives */}
              {user.annonces.length > 0 && (
                <div>
                  <div className="pubprof-sub-title">Annonces actives</div>
                  {user.annonces.map(a => (
                    <div key={a.id} className="pubprof-annonce" onClick={() => navigate(`/trip/${a.id}`)}>
                      <div>
                        <div className="pubprof-annonce-titre">{a.titre}</div>
                        <div className="pubprof-annonce-meta">{a.date} · {a.places}</div>
                      </div>
                      <div className="pubprof-annonce-prix">{a.prix} €<span>/pers.</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Avis */}
          {tab === 'avis' && (
            <div className="pubprof-section">
              {/* Résumé note */}
              <div className="pubprof-note-summary">
                <div className="pubprof-note-big">{user.note}</div>
                <div>
                  <Stars note={Math.round(user.note)} />
                  <div className="pubprof-note-count">{user.avis_count} avis</div>
                </div>
              </div>
              {user.avis.map((a, i) => (
                <div key={i} className="pubprof-review">
                  <div className="pubprof-review-header">
                    <div className="pubprof-review-av" style={{ background: a.avc }}>{a.av}</div>
                    <div>
                      <div className="pubprof-review-auteur">{a.auteur}</div>
                      <div className="pubprof-review-trip">{a.trip} · {a.date}</div>
                    </div>
                    <div className="pubprof-review-note">{'★'.repeat(a.note)}</div>
                  </div>
                  <p className="pubprof-review-text">"{a.texte}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Trajets */}
          {tab === 'trajets' && (
            <div className="pubprof-section">
              {user.trajets.map(t => (
                <div key={t.id} className="pubprof-trip" onClick={() => navigate(`/trip/${t.id}`)}>
                  <div>
                    <div className="pubprof-trip-titre">{t.titre}</div>
                    <div className="pubprof-trip-meta">📅 {t.date} · {t.places}</div>
                  </div>
                  <div className="pubprof-trip-prix">{t.prix} €</div>
                </div>
              ))}
            </div>
          )}

          {/* Forum */}
          {tab === 'forum' && (
            <div className="pubprof-section">
              {user.posts.map((p, i) => (
                <div key={i} className="pubprof-post">
                  <div className="pubprof-post-header">
                    <span className="pubprof-post-cat">{p.cat}</span>
                    <span className="pubprof-post-date">{p.date}</span>
                  </div>
                  <div className="pubprof-post-titre">{p.titre}</div>
                  <div className="pubprof-post-texte">{p.texte}</div>
                  <div className="pubprof-post-stats">
                    <span>❤ {p.likes}</span>
                    <span>💬 {p.comments} commentaires</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}