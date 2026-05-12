import { useState } from 'react'
import './Feed.css'

const MOCK_USERS = [
  { id: 'tl', nom: 'Thomas Leroy', av: 'TL', avc: '#185fa5', role: 'Skipper', zone: 'Marseille', abonnes: 142, following: false },
  { id: 'ad', nom: 'Anne-Marie D.', av: 'AD', avc: '#854f0b', role: 'Skippeure', zone: 'Toulon', abonnes: 89, following: true },
  { id: 'pb', nom: 'Pierre Bernard', av: 'PB', avc: '#0f6e56', role: 'Skipper', zone: 'Brest', abonnes: 67, following: true },
  { id: 'cd', nom: 'Claire Dubois', av: 'CD', avc: '#993556', role: 'Skippeure', zone: 'Nice', abonnes: 203, following: false },
]

const MOCK_TRAJETS = [
  { titre: 'Marseille → Porto-Vecchio', date: '3–12 juin 2026', bateau: 'Sun Odyssey 40' },
  { titre: 'Marseille → Ibiza', date: '1–10 juil. 2026', bateau: 'Sun Odyssey 40' },
]

const MOCK_POSTS = [
  {
    id: 1, av: 'TL', avc: '#185fa5', nom: 'Thomas Leroy', time: 'il y a 2h',
    zone: 'Méditerranée', visibilite: 'public',
    texte: 'Belle traversée hier de Marseille à Bonifacio. Mistral à 25 noeuds, 2m de creux. Équipage au top !',
    likes: 24, liked: false, comments: [
      { id: 1, av: 'CD', avc: '#993556', nom: 'Claire D.', time: 'il y a 1h', texte: 'Bravo ! Conditions musclées 💪', likes: 3, liked: false },
    ], showComments: false
  },
  {
    id: 2, av: 'CD', avc: '#993556', nom: 'Claire Dubois', time: 'il y a 5h',
    zone: 'Bretagne', visibilite: 'public',
    texte: 'Mouillage magique ce soir aux Glénan. Coucher de soleil exceptionnel. On repart demain vers Belle-Île.',
    likes: 41, liked: true, comments: [], showComments: false
  },
  {
    id: 3, av: 'PB', avc: '#0f6e56', nom: 'Pierre Bernard', time: 'hier',
    zone: 'Corse', visibilite: 'public',
    texte: 'Arrivée à Porto-Vecchio après 36h de mer. Fatigue mais bonheur immense. La Corse depuis la mer c\'est magique.',
    likes: 67, liked: false, comments: [], showComments: false
  },
  {
    id: 4, av: 'AD', avc: '#854f0b', nom: 'Anne-Marie D.', time: 'il y a 2j',
    zone: 'Atlantique', visibilite: 'abonnes',
    texte: 'Sortie découverte avec 4 nouveaux équipiers aujourd\'hui. Beau temps, belle mer. C\'est pour ça qu\'on navigue !',
    likes: 33, liked: false, comments: [], showComments: false
  },
]

export default function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [users, setUsers] = useState(MOCK_USERS)
  const [newText, setNewText] = useState('')
  const [visibilite, setVisibilite] = useState('public')
  const [selectedTrajet, setSelectedTrajet] = useState(null)
  const [showTrajetPicker, setShowTrajetPicker] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const [charCount, setCharCount] = useState(0)

  function toggleLike(id) {
    setPosts(ps => ps.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ))
  }

  function toggleComments(id) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, showComments: !p.showComments } : p))
  }

  function sendComment(postId) {
    const txt = (commentInputs[postId] || '').trim()
    if (!txt) return
    const newComment = { id: Date.now(), av: 'SM', avc: '#0f2d52', nom: 'Moi', time: 'à l\'instant', texte: txt }
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    setCommentInputs(ci => ({ ...ci, [postId]: '' }))
  }

  function deletePost(id) {
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  function likeComment(postId, commentId) {
    setPosts(ps => ps.map(p => p.id === postId ? {
      ...p, comments: p.comments.map(c => c.id === commentId
        ? { ...c, liked: !c.liked, likes: (c.likes || 0) + (c.liked ? -1 : 1) }
        : c)
    } : p))
  }

  function handlePost() {
    if (!newText.trim()) return
    const post = {
      id: Date.now(), av: 'SM', avc: '#0f2d52', nom: 'Segolene M.',
      time: 'à l\'instant', zone: selectedTrajet ? 'Mon trajet' : '',
      visibilite, texte: newText, likes: 0, liked: false,
      comments: [], showComments: false,
      trajet: selectedTrajet
    }
    setPosts(ps => [post, ...ps])
    setNewText(''); setCharCount(0); setSelectedTrajet(null)
  }

  function toggleFollow(id) {
    setUsers(us => us.map(u => u.id === id ? { ...u, following: !u.following } : u))
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
              onChange={e => { setNewText(e.target.value); setCharCount(e.target.value.length) }}
              placeholder="Partagez votre expérience nautique..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Trajet attaché */}
          {selectedTrajet && (
            <div className="feed-trajet-tag">
              ⛵ {selectedTrajet.titre} · {selectedTrajet.date}
              <button className="feed-trajet-remove" onClick={() => setSelectedTrajet(null)}>✕</button>
            </div>
          )}

          <div className="feed-composer-bottom">
            <div className="feed-vis-btns">
              <button className={`feed-vis-btn ${visibilite === 'public' ? 'active' : ''}`} onClick={() => setVisibilite('public')}>🌐 Public</button>
              <button className={`feed-vis-btn ${visibilite === 'abonnes' ? 'active' : ''}`} onClick={() => setVisibilite('abonnes')}>🔒 Abonnés</button>
            </div>
            <div className="feed-toolbar">
              <button className="feed-tool-btn" onClick={() => setShowTagPicker(true)} title="Taguer">👤</button>
              <button className="feed-tool-btn" onClick={() => setShowTrajetPicker(true)} title="Rattacher un trajet">⛵</button>
              <span className="feed-char-count">{charCount}/500</span>
              <button className="feed-post-btn" disabled={!newText.trim()} onClick={handlePost}>Publier</button>
            </div>
          </div>
        </div>

        {/* Suggestions à suivre */}
        <div className="feed-suggestions">
          <div className="feed-suggestions-title">Personnes à suivre</div>
          <div className="feed-suggestions-list">
            {users.filter(u => !u.following).slice(0, 3).map(u => (
              <div key={u.id} className="feed-suggestion-item">
                <div className="feed-sug-av" style={{ background: u.avc }}>{u.av}</div>
                <div className="feed-sug-info">
                  <div className="feed-sug-nom">{u.nom}</div>
                  <div className="feed-sug-role">{u.role} · {u.zone}</div>
                </div>
                <button className="feed-follow-btn" onClick={() => toggleFollow(u.id)}>Suivre</button>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.map(p => (
          <div key={p.id} className="feed-post">
            <div className="feed-post-header">
              <div className="feed-post-av" style={{ background: p.avc }}>{p.av}</div>
              <div className="feed-post-meta">
                <div className="feed-post-auteur">{p.nom}</div>
                <div className="feed-post-time">
                  {p.time}
                  {p.zone && <span className="feed-post-zone"> · {p.zone}</span>}
                  <span className="feed-post-vis">{p.visibilite === 'public' ? ' 🌐' : ' 🔒'}</span>
                </div>
              </div>
            </div>

            {/* Trajet rattaché */}
            {p.trajet && (
              <div className="feed-post-trajet">⛵ {p.trajet.titre} · {p.trajet.date}</div>
            )}

            <p className="feed-post-texte">{p.texte}</p>

            <div className="feed-post-actions">
              <button className={`feed-action ${p.liked ? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>
                {p.liked ? '❤️' : '🤍'} {p.likes}
              </button>
              <button className="feed-action" onClick={() => toggleComments(p.id)}>
                💬 {p.comments.length}
              </button>
              <button className="feed-action">↗️ Partager</button>
              {p.av === 'SM' && (
                <button className="feed-action delete" onClick={() => deletePost(p.id)}>🗑</button>
              )}
            </div>

            {/* Commentaires */}
            {p.showComments && (
              <div className="feed-comments">
                {p.comments.map(c => (
                  <div key={c.id} className="feed-comment">
                    <div className="feed-cmt-av" style={{ background: c.avc }}>{c.av}</div>
                    <div className="feed-cmt-body">
                      <span className="feed-cmt-nom">{c.nom}</span>
                      <span className="feed-cmt-time"> · {c.time}</span>
                      <div className="feed-cmt-texte">{c.texte}</div>
                      <button className={`feed-cmt-like ${c.liked ? 'liked' : ''}`} onClick={() => likeComment(p.id, c.id)}>
                        {c.liked ? '❤️' : '🤍'} {c.likes || 0}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="feed-cmt-input-wrap">
                  <input
                    className="feed-cmt-input"
                    placeholder="Votre commentaire..."
                    value={commentInputs[p.id] || ''}
                    onChange={e => setCommentInputs(ci => ({ ...ci, [p.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && sendComment(p.id)}
                  />
                  <button className="feed-cmt-send" onClick={() => sendComment(p.id)}>→</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal taguer */}
      {showTagPicker && (
        <div className="feed-modal-overlay" onClick={() => setShowTagPicker(false)}>
          <div className="feed-modal" onClick={e => e.stopPropagation()}>
            <div className="feed-modal-title">Taguer des personnes</div>
            {MOCK_USERS.map(u => (
              <div key={u.id} className="feed-tag-item">
                <div className="feed-sug-av" style={{ background: u.avc }}>{u.av}</div>
                <div className="feed-sug-info">
                  <div className="feed-sug-nom">{u.nom}</div>
                  <div className="feed-sug-role">{u.role}</div>
                </div>
                <button className="feed-tag-btn" onClick={() => {
                  setNewText(t => t + ` @${u.nom}`)
                  setShowTagPicker(false)
                }}>Taguer</button>
              </div>
            ))}
            <button className="feed-modal-close" onClick={() => setShowTagPicker(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modal rattacher trajet */}
      {showTrajetPicker && (
        <div className="feed-modal-overlay" onClick={() => setShowTrajetPicker(false)}>
          <div className="feed-modal" onClick={e => e.stopPropagation()}>
            <div className="feed-modal-title">Rattacher un trajet</div>
            {MOCK_TRAJETS.map((t, i) => (
              <div key={i} className="feed-trajet-item" onClick={() => { setSelectedTrajet(t); setShowTrajetPicker(false) }}>
                <div className="feed-trajet-item-icon">⛵</div>
                <div>
                  <div className="feed-trajet-item-titre">{t.titre}</div>
                  <div className="feed-trajet-item-meta">{t.date} · {t.bateau}</div>
                </div>
              </div>
            ))}
            <button className="feed-modal-close" onClick={() => setShowTrajetPicker(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}