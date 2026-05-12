import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [curCat, setCurCat] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newPost, setNewPost] = useState({ titre: '', cat: 'meteo', texte: '' })
  const [commentInputs, setCommentInputs] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        supabase.from('users').select('prenom, nom').eq('id', user.id).single()
          .then(({ data }) => setUserProfile(data))
      }
    })
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('forum_posts')
      .select('*, auteur:auteur_id(prenom, nom), forum_comments(id, contenu, created_at, auteur:auteur_id(prenom, nom))')
      .order('created_at', { ascending: false })
    if (data) setPosts(data.map(p => ({ ...p, liked: false, likes: 0, showComments: false })))
    setLoading(false)
  }

  async function publishPost() {
    if (!newPost.titre || !newPost.texte || !userId) return
    const { data } = await supabase.from('forum_posts').insert({
      auteur_id: userId,
      categorie: newPost.cat,
      titre: newPost.titre,
      contenu: newPost.texte,
    }).select('*, auteur:auteur_id(prenom, nom), forum_comments(id)').single()
    if (data) setPosts(ps => [{ ...data, liked: false, likes: 0, showComments: false }, ...ps])
    setNewPost({ titre: '', cat: 'meteo', texte: '' })
    setShowNew(false)
  }

  async function deletePost(id) {
    await supabase.from('forum_posts').delete().eq('id', id)
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  async function sendComment(postId) {
    const txt = (commentInputs[postId] || '').trim()
    if (!txt || !userId) return
    const { data } = await supabase.from('forum_comments').insert({
      post_id: postId,
      auteur_id: userId,
      contenu: txt,
    }).select('*, auteur:auteur_id(prenom, nom)').single()
    if (data) {
      setPosts(ps => ps.map(p => p.id === postId
        ? { ...p, forum_comments: [...(p.forum_comments || []), data] }
        : p
      ))
    }
    setCommentInputs(ci => ({ ...ci, [postId]: '' }))
  }

  function toggleLike(id) {
    setPosts(ps => ps.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ))
  }

  function toggleComments(id) {
    setExpandedComments(ec => ({ ...ec, [id]: !ec[id] }))
  }

  const filtered = curCat === 'all' ? posts : posts.filter(p => p.categorie === curCat)
  const catColor = id => CATS.find(c => c.id === id)?.color || '#6b7e94'
  const catLabel = id => CATS.find(c => c.id === id)?.label || id

  return (
    <div className="forum-page">
      <div className="forum-topbar">
        <span className="forum-topbar-title">Forum</span>
        <button className="forum-new-btn" onClick={() => setShowNew(true)}>+ Nouveau post</button>
      </div>

      <div className="forum-content">
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

        {loading && <div className="forum-empty">Chargement...</div>}
        {!loading && filtered.length === 0 && <div className="forum-empty">Aucun post dans cette catégorie.</div>}

        {filtered.map(p => {
          const auteurNom = p.auteur ? `${p.auteur.prenom} ${p.auteur.nom}` : 'Utilisateur'
          const auteurAv = p.auteur ? `${p.auteur.prenom[0]}${p.auteur.nom[0]}` : 'U'
          const isMyPost = p.auteur_id === userId
          const timeAff = new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          const showCmts = expandedComments[p.id]

          return (
            <div key={p.id} className="forum-post-card">
              <div className="fpc-header">
                <div className="fpc-av" style={{ background: '#185fa5' }}>{auteurAv}</div>
                <div className="fpc-meta">
                  <div className="fpc-auteur">{auteurNom}</div>
                  <div className="fpc-time">{timeAff}</div>
                </div>
                <span className="fpc-cat" style={{ background: catColor(p.categorie) + '22', color: catColor(p.categorie) }}>
                  {catLabel(p.categorie)}
                </span>
                {p.epingle && <span className="fpc-epingle">📌</span>}
              </div>

              <div className="fpc-titre">{p.titre}</div>
              <div className="fpc-texte">{p.contenu}</div>

              <div className="fpc-actions">
                <button className={`fpc-action ${p.liked ? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>
                  {p.liked ? '❤️' : '🤍'} {p.likes}
                </button>
                <button className="fpc-action" onClick={() => toggleComments(p.id)}>
                  💬 {p.forum_comments?.length || 0}
                </button>
                <button className="fpc-action">↗️ Partager</button>
                <span className="fpc-views">{p.vues || 0} vues</span>
                {isMyPost && (
                  <button className="fpc-action delete" onClick={() => deletePost(p.id)}>🗑 Supprimer</button>
                )}
              </div>

              {showCmts && (
                <div className="fpc-comments">
                  {(p.forum_comments || []).map(c => {
                    const cAv = c.auteur ? `${c.auteur.prenom[0]}${c.auteur.nom[0]}` : 'U'
                    const cNom = c.auteur ? `${c.auteur.prenom} ${c.auteur.nom}` : 'Utilisateur'
                    return (
                      <div key={c.id} className="fpc-comment">
                        <div className="fpc-cmt-av" style={{ background: '#185fa5' }}>{cAv}</div>
                        <div className="fpc-cmt-body">
                          <div className="fpc-cmt-auteur">{cNom}
                            <span className="fpc-cmt-time"> · {new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="fpc-cmt-texte">{c.contenu}</div>
                        </div>
                      </div>
                    )
                  })}
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
          )
        })}
      </div>

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
    </div>
  )
}