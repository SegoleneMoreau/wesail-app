import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Forum.css'

const CATS = [
  { id: 'all', label: 'Tous', color: '#0f2d52' },
  { id: 'meteo', label: 'Météo & Conditions', color: '#185fa5' },
  { id: 'recits', label: 'Récits de navigation', color: '#0f6e56' },
  { id: 'entraide', label: 'Entraide & Conseils', color: '#d97706' },
  { id: 'annonces', label: 'Annonces', color: '#7c3aed' },
  { id: 'materiel', label: 'Matériel & Équipement', color: '#854f0b' },
  { id: 'destinations', label: 'Destinations', color: '#0891b2' },
]

const MOCK_POSTS = [
  {
    id: 1, cat: 'meteo', auteur: 'Thomas L.', av: 'TL', avc: '#185fa5', time: 'il y a 2h',
    titre: 'Conditions en Méditerranée cet été ?', hot: true, epingle: true,
    texte: 'Bonjour à tous ! Quelqu\'un a des infos sur les conditions prévues cet été en Méditerranée occidentale ? Je prévois une traversée Marseille-Corse fin juin.',
    likes: 24, liked: false, views: 234,
    comments: [
      { id: 1, av: 'CD', avc: '#993556', auteur: 'Claire D.', time: 'il y a 1h', texte: 'Généralement calme en juin avant le mistral de juillet. Partez tôt le matin !', likes: 5, liked: false },
      { id: 2, av: 'PB', avc: '#0f6e56', auteur: 'Pierre B.', time: 'il y a 45min', texte: 'Je confirme, juin c\'est idéal. Météo plus stable qu\'en juillet/août.' },
    ],
    showComments: false, reported: false
  },
  {
    id: 2, cat: 'recits', auteur: 'Claire D.', av: 'CD', avc: '#993556', time: 'il y a 5h',
    titre: 'Mon tour de Corse en 10 jours', hot: false, epingle: false,
    texte: 'Retour de croisière ! 10 jours autour de la Corse avec un équipage de 4. On a fait Marseille, Ajaccio, Bonifacio, Porto-Vecchio, Bastia et retour. Un voyage inoubliable !',
    likes: 41, liked: true, views: 156,
    comments: [
      { id: 1, av: 'TL', avc: '#185fa5', auteur: 'Thomas L.', time: 'il y a 3h', texte: 'Superbe récit ! Quelle météo vous avez eu ?' },
    ],
    showComments: false, reported: false
  },
  {
    id: 3, cat: 'entraide', auteur: 'Pierre B.', av: 'PB', avc: '#0f6e56', time: 'hier',
    titre: 'Conseils pour première traversée Marseille-Corse', hot: true, epingle: false,
    texte: 'Je prépare ma première grande traversée. Des conseils sur les points de passage, les risques météo, l\'équipement indispensable ?',
    likes: 67, liked: false, views: 445,
    comments: [],
    showComments: false, reported: false
  },
  {
    id: 4, cat: 'materiel', auteur: 'Marie M.', av: 'MM', avc: '#d97706', time: 'hier',
    titre: 'Comparatif GPS marins 2026', hot: false, epingle: false,
    texte: 'J\'ai testé les 3 principaux GPS du marché. Voici mon comparatif détaillé après 6 mois d\'utilisation...',
    likes: 33, liked: false, views: 89,
    comments: [],
    showComments: false, reported: false
  },
  {
    id: 5, cat: 'destinations', auteur: 'Lucas S.', av: 'LS', avc: '#0891b2', time: 'il y a 2j',
    titre: 'Les plus beaux mouillages de Bretagne', hot: true, epingle: false,
    texte: 'Après 3 étés à naviguer en Bretagne, voici ma sélection des 10 plus beaux mouillages. De Ouessant aux Glénan en passant par Belle-Île...',
    likes: 89, liked: false, views: 678,
    comments: [],
    showComments: false, reported: false
  },
]

export default function Forum() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [curCat, setCurCat] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newPost, setNewPost] = useState({ titre: '', cat: 'meteo', texte: '' })
  const [commentInputs, setCommentInputs] = useState({})
  const [reportId, setReportId] = useState(null)

  const filtered = curCat === 'all' ? posts : posts.filter(p => p.cat === curCat)

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
    const newComment = { id: Date.now(), av: 'SM', avc: '#0f2d52', auteur: 'Moi', time: 'à l\'instant', texte: txt }
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    setCommentInputs(ci => ({ ...ci, [postId]: '' }))
  }

  function publishPost() {
    if (!newPost.titre || !newPost.texte) return
    const post = {
      id: Date.now(), cat: newPost.cat, auteur: 'Moi', av: 'SM', avc: '#0f2d52',
      time: 'à l\'instant', titre: newPost.titre, hot: false, epingle: false,
      texte: newPost.texte, likes: 0, liked: false, views: 1,
      comments: [], showComments: false, reported: false
    }
    setPosts(ps => [post, ...ps])
    setNewPost({ titre: '', cat: 'meteo', texte: '' })
    setShowNew(false)
  }

  function reportPost(id) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, reported: true } : p))
    setReportId(null)
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

  const catLabel = id => CATS.find(c => c.id === id)?.label || id
  const catColor = id => CATS.find(c => c.id === id)?.color || '#6b7e94'

  return (
    <div className="forum-page">
      <div className="forum-topbar">
        <span className="forum-topbar-title">Forum</span>
        <button className="forum-new-btn" onClick={() => setShowNew(true)}>+ Nouveau post</button>
      </div>

      <div className="forum-content">
        {/* Catégories */}
        <div className="forum-cats">
          {CATS.map(c => (
            <button key={c.id}
              className={`forum-cat ${curCat === c.id ? 'active' : ''}`}
              style={curCat === c.id ? { background: c.color + '22', borderColor: c.color, color: c.color } : {}}
              onClick={() => setCurCat(c.id)}>
              {c.id !== 'all' && <span className="cat-dot" style={{ background: c.color }}></span>}
              {c.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filtered.length === 0 && (
          <div className="forum-empty">Aucun post dans cette catégorie.</div>
        )}

        {filtered.map(p => (
          <div key={p.id} className={`forum-post-card ${p.reported ? 'reported' : ''}`}>
            {/* Header post */}
            <div className="fpc-header">
              <div className="fpc-av" style={{ background: p.avc }}>{p.av}</div>
              <div className="fpc-meta">
                <div className="fpc-auteur">{p.auteur}</div>
                <div className="fpc-time">{p.time}</div>
              </div>
              <span className="fpc-cat" style={{ background: catColor(p.cat) + '22', color: catColor(p.cat) }}>
                {catLabel(p.cat)}
              </span>
              {p.hot && <span className="fpc-hot">🔥</span>}
              {p.epingle && <span className="fpc-epingle">📌</span>}
            </div>

            {/* Titre + texte */}
            <div className="fpc-titre">{p.titre}</div>
            <div className="fpc-texte">{p.texte}</div>

            {/* Actions */}
            <div className="fpc-actions">
              <button className={`fpc-action ${p.liked ? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>
                {p.liked ? '❤️' : '🤍'} {p.likes}
              </button>
              <button className="fpc-action" onClick={() => toggleComments(p.id)}>
                💬 {p.comments.length}
              </button>
              <button className="fpc-action">↗️ Partager</button>
              <span className="fpc-views">{p.views} vues</span>
              {p.auteur === 'Moi' ? (
                <button className="fpc-action delete" onClick={() => deletePost(p.id)}>🗑 Supprimer</button>
              ) : !p.reported ? (
                <button className="fpc-action report" onClick={() => setReportId(p.id)}>⚑ Signaler</button>
              ) : (
                <span className="fpc-reported">Signalé</span>
              )}
            </div>

            {/* Commentaires */}
            {p.showComments && (
              <div className="fpc-comments">
                {p.comments.map(c => (
                  <div key={c.id} className="fpc-comment">
                    <div className="fpc-cmt-av" style={{ background: c.avc }}>{c.av}</div>
                    <div className="fpc-cmt-body">
                      <div className="fpc-cmt-auteur">{c.auteur} <span className="fpc-cmt-time">{c.time}</span></div>
                      <div className="fpc-cmt-texte">{c.texte}</div>
                      <button className={`fpc-cmt-like ${c.liked ? 'liked' : ''}`} onClick={() => likeComment(p.id, c.id)}>
                        {c.liked ? '❤️' : '🤍'} {c.likes || 0}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="fpc-cmt-input-wrap">
                  <input
                    className="fpc-cmt-input"
                    placeholder="Votre commentaire..."
                    value={commentInputs[p.id] || ''}
                    onChange={e => setCommentInputs(ci => ({ ...ci, [p.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && sendComment(p.id)}
                  />
                  <button className="fpc-cmt-send" onClick={() => sendComment(p.id)}>→</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal nouveau post */}
      {showNew && (
        <div className="forum-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="forum-modal" onClick={e => e.stopPropagation()}>
            <div className="forum-modal-title">Nouveau post</div>
            <div className="forum-modal-field">
              <label>Catégorie</label>
              <select value={newPost.cat} onChange={e => setNewPost(p => ({ ...p, cat: e.target.value }))}>
                {CATS.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="forum-modal-field">
              <label>Titre *</label>
              <input value={newPost.titre} onChange={e => setNewPost(p => ({ ...p, titre: e.target.value }))} placeholder="Titre de votre post..." />
            </div>
            <div className="forum-modal-field">
              <label>Contenu *</label>
              <textarea value={newPost.texte} onChange={e => setNewPost(p => ({ ...p, texte: e.target.value }))} placeholder="Votre message..." rows={5} />
            </div>
            <div className="forum-modal-btns">
              <button className="forum-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="forum-modal-send" disabled={!newPost.titre || !newPost.texte} onClick={publishPost}>Publier</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal signalement */}
      {reportId && (
        <div className="forum-modal-overlay" onClick={() => setReportId(null)}>
          <div className="forum-modal" onClick={e => e.stopPropagation()}>
            <div className="forum-modal-title">Signaler ce post</div>
            <p style={{ fontSize: 14, color: '#6b7e94', marginBottom: 16 }}>Ce post sera examiné par notre équipe de modération.</p>
            <div className="forum-modal-btns">
              <button className="forum-modal-cancel" onClick={() => setReportId(null)}>Annuler</button>
              <button className="forum-modal-send" style={{ background: '#ef4444' }} onClick={() => reportPost(reportId)}>Signaler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}