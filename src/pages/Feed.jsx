import { useState } from 'react'
import './Feed.css'

const MOCK_POSTS = [
  {id:1,auteur:'Thomas Leroy',av:'TL',avc:'#0f2d52',time:'il y a 2h',zone:'Méditerranée',visibilite:'public',texte:'Belle traversée hier de Marseille à Bonifacio. Mistral à 25 noeuds, 2m de creux. Équipage au top !',likes:24,comments:8,liked:false},
  {id:2,auteur:'Claire Dubois',av:'CD',avc:'#7c3aed',time:'il y a 5h',zone:'Bretagne',visibilite:'public',texte:'Mouillage magique ce soir aux Glénan. Coucher de soleil exceptionnel. On repart demain vers Belle-Île.',likes:41,comments:12,liked:true},
  {id:3,auteur:'Pierre Bernard',av:'PB',avc:'#0891b2',time:'hier',zone:'Corse',visibilite:'public',texte:'Arrivée à Porto-Vecchio après 36h de mer. Fatigue mais bonheur immense. La Corse depuis la mer c\'est magique.',likes:67,comments:19,liked:false},
  {id:4,auteur:'Marie Moreau',av:'MM',avc:'#d97706',time:'il y a 2j',zone:'Atlantique',visibilite:'public',texte:'Sortie découverte avec 4 nouveaux équipiers aujourd\'hui. Beau temps, belle mer. C\'est pour ça qu\'on navigue !',likes:33,comments:7,liked:false},
]

export default function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [newText, setNewText] = useState('')
  const [visibilite, setVisibilite] = useState('public')

  function toggleLike(id) {
    setPosts(ps => ps.map(p => p.id === id ? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1} : p))
  }

  function handlePost() {
    if(!newText.trim()) return
    const post = {
      id: Date.now(), auteur:'Segolene Moreau', av:'SM', avc:'#0f2d52',
      time:'à l\'instant', zone:'', visibilite, texte:newText, likes:0, comments:0, liked:false
    }
    setPosts(ps => [post, ...ps])
    setNewText('')
  }

  return (
    <div className="feed-page">
      <div className="feed-topbar">
        <span className="feed-topbar-title">Mon fil</span>
      </div>

      <div className="feed-content">
        {/* Composer */}
        <div className="feed-composer">
          <div className="feed-composer-top">
            <div className="feed-composer-av">SM</div>
            <textarea
              className="feed-composer-input"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Partagez votre expérience nautique..."
              rows={3}
            />
          </div>
          <div className="feed-composer-bottom">
            <div className="feed-vis-btns">
              <button className={`feed-vis-btn ${visibilite==='public'?'active':''}`} onClick={() => setVisibilite('public')}>🌐 Public</button>
              <button className={`feed-vis-btn ${visibilite==='abonnes'?'active':''}`} onClick={() => setVisibilite('abonnes')}>🔒 Abonnés</button>
            </div>
            <button className="feed-post-btn" disabled={!newText.trim()} onClick={handlePost}>Publier</button>
          </div>
        </div>

        {/* Posts */}
        {posts.map(p => (
          <div key={p.id} className="feed-post">
            <div className="feed-post-header">
              <div className="feed-post-av" style={{background:p.avc}}>{p.av}</div>
              <div className="feed-post-meta">
                <div className="feed-post-auteur">{p.auteur}</div>
                <div className="feed-post-time">
                  {p.time}
                  {p.zone && <span className="feed-post-zone"> · {p.zone}</span>}
                  <span className={`feed-post-vis ${p.visibilite}`}>{p.visibilite==='public'?'🌐':'🔒'}</span>
                </div>
              </div>
            </div>
            <p className="feed-post-texte">{p.texte}</p>
            <div className="feed-post-actions">
              <button className={`feed-action ${p.liked?'liked':''}`} onClick={() => toggleLike(p.id)}>
                {p.liked?'❤️':'🤍'} {p.likes}
              </button>
              <button className="feed-action">💬 {p.comments}</button>
              <button className="feed-action">↗️ Partager</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
