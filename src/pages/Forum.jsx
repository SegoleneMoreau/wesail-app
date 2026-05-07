import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Forum.css'

const CATEGORIES = [
  {id:'meteo', label:'Météo & Conditions', icon:'🌊', count:234},
  {id:'recits', label:'Récits de navigation', icon:'📖', count:189},
  {id:'entraide', label:'Entraide & Conseils', icon:'🤝', count:156},
  {id:'annonces', label:'Annonces', icon:'📢', count:98},
  {id:'materiel', label:'Matériel & Équipement', icon:'⚓', count:145},
  {id:'destinations', label:'Destinations', icon:'🗺️', count:201},
]

const MOCK_POSTS = [
  {id:1,cat:'meteo',titre:'Conditions en Méditerranée cet été ?',auteur:'Thomas L.',date:'il y a 2h',replies:12,views:234,hot:true},
  {id:2,cat:'recits',titre:'Mon tour de Corse en 10 jours',auteur:'Claire D.',date:'il y a 5h',replies:8,views:156,hot:false},
  {id:3,cat:'entraide',titre:'Conseils pour première traversée Marseille-Corse',auteur:'Pierre B.',date:'hier',replies:23,views:445,hot:true},
  {id:4,cat:'materiel',titre:'Comparatif GPS marins 2026',auteur:'Marie M.',date:'hier',replies:5,views:89,hot:false},
  {id:5,cat:'destinations',titre:'Les plus beaux mouillages de Bretagne',auteur:'Lucas S.',date:'il y a 2j',replies:31,views:678,hot:true},
  {id:6,cat:'annonces',titre:'Recherche équipier expérimenté Atlantique',auteur:'Sophie L.',date:'il y a 3j',replies:4,views:67,hot:false},
]

export default function Forum() {
  const navigate = useNavigate()
  const [activeCat, setActiveCat] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newPost, setNewPost] = useState({titre:'', cat:'meteo', contenu:''})

  const filtered = activeCat === 'all' ? MOCK_POSTS : MOCK_POSTS.filter(p => p.cat === activeCat)

  return (
    <div className="forum-page">
      <div className="forum-topbar">
        <span className="forum-topbar-title">Forum</span>
        <button className="forum-new-btn" onClick={() => setShowNew(true)}>+ Nouveau post</button>
      </div>

      <div className="forum-content">
        {/* Catégories */}
        <div className="forum-cats">
          <button className={`forum-cat ${activeCat==='all'?'active':''}`} onClick={() => setActiveCat('all')}>
            Tous
          </button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`forum-cat ${activeCat===c.id?'active':''}`} onClick={() => setActiveCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="forum-posts">
          {filtered.map(p => (
            <div key={p.id} className="forum-post">
              <div className="forum-post-left">
                {p.hot && <span className="forum-hot">🔥</span>}
                <div className="forum-post-cat">{CATEGORIES.find(c=>c.id===p.cat)?.icon} {CATEGORIES.find(c=>c.id===p.cat)?.label}</div>
                <div className="forum-post-titre">{p.titre}</div>
                <div className="forum-post-meta">Par {p.auteur} · {p.date}</div>
              </div>
              <div className="forum-post-stats">
                <div className="forum-stat"><span>{p.replies}</span><span>réponses</span></div>
                <div className="forum-stat"><span>{p.views}</span><span>vues</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal nouveau post */}
      {showNew && (
        <div className="forum-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="forum-modal" onClick={e => e.stopPropagation()}>
            <div className="forum-modal-title">Nouveau post</div>
            <div className="forum-modal-field">
              <label>Catégorie</label>
              <select value={newPost.cat} onChange={e => setNewPost(p=>({...p,cat:e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="forum-modal-field">
              <label>Titre</label>
              <input value={newPost.titre} onChange={e => setNewPost(p=>({...p,titre:e.target.value}))} placeholder="Titre de votre post..." />
            </div>
            <div className="forum-modal-field">
              <label>Contenu</label>
              <textarea value={newPost.contenu} onChange={e => setNewPost(p=>({...p,contenu:e.target.value}))} placeholder="Votre message..." rows={5} />
            </div>
            <div className="forum-modal-btns">
              <button className="forum-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="forum-modal-send" onClick={() => setShowNew(false)}>Publier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
