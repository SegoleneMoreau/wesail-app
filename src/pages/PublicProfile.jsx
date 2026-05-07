import { useNavigate, useParams } from 'react-router-dom'
import './PublicProfile.css'

const MOCK_USERS = [
  {id:1,prenom:'Thomas',nom:'Leroy',av:'TL',avc:'#0f2d52',niveau:4,genre:'m',bio:'Skipper professionnel, 15 ans de navigation. Spécialiste Méditerranée et Atlantique. Passionné de voile hauturière.',note:4.9,avis:47,trajets:89,milles:12400,abonnes:312,bateau:'Jeanneau Sun Odyssey 440',port:'Marseille',membre:'2022'},
  {id:2,prenom:'Claire',nom:'Dubois',av:'CD',avc:'#7c3aed',niveau:3,genre:'f',bio:'Passionnée de voile depuis 20 ans. Aime partager sa passion avec les débutants.',note:4.7,avis:23,trajets:34,milles:5200,abonnes:156,bateau:'Bénéteau Oceanis 35',port:'Brest',membre:'2023'},
  {id:3,prenom:'Pierre',nom:'Bernard',av:'PB',avc:'#0891b2',niveau:4,genre:'m',bio:'Skipper expérimenté, nombreuses traversées Méditerranée et Atlantique.',note:4.8,avis:31,trajets:56,milles:8900,abonnes:203,bateau:'Dufour 460 GL',port:'Nice',membre:'2022'},
]

const NIVEAUX = ['','Débutant','Initié','Expérimenté','Skipper']

const MOCK_TRIPS = [
  {id:1,titre:'Marseille → Porto-Vecchio',date:'14 juin 2026',prix:159,places:2},
  {id:5,titre:'Toulon → Saint-Tropez',date:'10 juil. 2026',prix:95,places:2},
]

const MOCK_REVIEWS = [
  {av:'CD',avc:'#7c3aed',auteur:'Claire D.',note:5,commentaire:'Excellent skipper, très pédagogue et rassurant.',date:'mars 2026'},
  {av:'MM',avc:'#d97706',auteur:'Marie M.',note:5,commentaire:'Traversée parfaite, Thomas est un professionnel.',date:'fév. 2026'},
]

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = MOCK_USERS.find(u => u.id === parseInt(id)) || MOCK_USERS[0]

  return (
    <div className="pubprof-page">
      <div className="pubprof-header">
        <button className="pubprof-back" onClick={() => navigate(-1)}>← Retour</button>
        <span className="pubprof-header-title">Profil</span>
      </div>

      <div className="pubprof-content">
        {/* Hero */}
        <div className="pubprof-hero">
          <div className="pubprof-av" style={{background:user.avc}}>{user.av}</div>
          <div className="pubprof-hero-info">
            <div className="pubprof-name">{user.prenom} {user.nom}</div>
            <div className="pubprof-meta">{NIVEAUX[user.niveau]} · {user.port}</div>
            <div className="pubprof-note">★ {user.note} · {user.avis} avis</div>
          </div>
          <button className="pubprof-msg-btn" onClick={() => navigate('/messages')}>💬 Contacter</button>
        </div>

        {/* Stats */}
        <div className="pubprof-stats">
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.trajets}</div><div className="pubprof-stat-label">Trajets</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.note}</div><div className="pubprof-stat-label">Note</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{(user.milles/1000).toFixed(1)}k</div><div className="pubprof-stat-label">Milles</div></div>
          <div className="pubprof-stat"><div className="pubprof-stat-val">{user.abonnes}</div><div className="pubprof-stat-label">Abonnés</div></div>
        </div>

        {/* Bio */}
        <div className="pubprof-section">
          <div className="pubprof-section-title">À propos</div>
          <p className="pubprof-bio">{user.bio}</p>
          <div className="pubprof-info-row"><span>⛵ Bateau</span><span>{user.bateau}</span></div>
          <div className="pubprof-info-row"><span>📍 Port</span><span>{user.port}</span></div>
          <div className="pubprof-info-row"><span>📅 Membre depuis</span><span>{user.membre}</span></div>
        </div>

        {/* Trajets proposés */}
        <div className="pubprof-section">
          <div className="pubprof-section-title">Trajets proposés</div>
          {MOCK_TRIPS.map(t => (
            <div key={t.id} className="pubprof-trip" onClick={() => navigate(`/trip/${t.id}`)}>
              <div className="pubprof-trip-titre">{t.titre}</div>
              <div className="pubprof-trip-meta">📅 {t.date} · {t.places} places</div>
              <div className="pubprof-trip-prix">{t.prix} €</div>
            </div>
          ))}
        </div>

        {/* Avis */}
        <div className="pubprof-section">
          <div className="pubprof-section-title">Avis récents</div>
          {MOCK_REVIEWS.map((r,i) => (
            <div key={i} className="pubprof-review">
              <div className="pubprof-review-header">
                <div className="pubprof-review-av" style={{background:r.avc}}>{r.av}</div>
                <div>
                  <div className="pubprof-review-auteur">{r.auteur}</div>
                  <div className="pubprof-review-date">{r.date}</div>
                </div>
                <div className="pubprof-review-note">{'★'.repeat(r.note)}</div>
              </div>
              <p className="pubprof-review-text">"{r.commentaire}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
