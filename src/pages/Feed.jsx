import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FileUpload from '../components/FileUpload'
import './Feed.css'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [newText, setNewText] = useState('')
  const [newPhotos, setNewPhotos] = useState([])
  const [visibilite, setVisibilite] = useState('public')
  const [commentInputs, setCommentInputs] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        supabase.from('users').select('prenom, nom, photo_url').eq('id', user.id).single()
          .then(({ data }) => setUserProfile(data))
      }
    })
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('feed_posts')
      .select('*, auteur:auteur_id(prenom, nom, photo_url)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setPosts(data.map(p => ({ ...p, liked: false, likes: p.likes_count || 0, comments: [], showComments: false })))
    setLoading(false)
  }

  async function handlePost() {
    if (!newText.trim() || !userId) return
    const { data } = await supabase.from('feed_posts').insert({
      auteur_id: userId,
      contenu: newText,
      visibilite,
      likes_count: 0,
    }).select('*, auteur:auteur_id(prenom, nom, photo_url)').single()
    if (data) setPosts(ps => [{ ...data, liked: false, likes: 0, comments: [], showComments: false, photos: newPhotos }, ...ps])
    setNewText('')
    setNewPhotos([])
  }

  async function deletePost(id) {
    await supabase.from('feed_posts').delete().eq('id', id)
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  function toggleLike(id) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
  }

  function toggleComments(id) {
    setExpandedComments(ec => ({ ...ec, [id]: !ec[id] }))
  }

  function sendComment(postId) {
    const txt = (commentInputs[postId] || '').trim()
    if (!txt) return
    const newCmt = { id: Date.now(), nom: userProfile ? `${userProfile.prenom} ${userProfile.nom}` : 'Moi', texte: txt, time: 'à l\'instant', liked: false, likes: 0 }
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), newCmt] } : p))
    setCommentInputs(ci => ({ ...ci, [postId]: '' }))
  }

  function likeComment(postId, cId) {
    setPosts(ps => ps.map(p => p.id === postId ? {
      ...p, comments: p.comments.map(c => c.id === cId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c)
    } : p))
  }

  function handlePhotoUpload(files) {
    const arr = Array.isArray(files) ? files : [files]
    setNewPhotos(p => [...p, ...arr].slice(0, 4))
  }

  function removeNewPhoto(idx) {
    setNewPhotos(p => p.filter((_, i) => i !== idx))
  }

  const myAv = userProfile ? `${userProfile.prenom?.[0] || ''}${userProfile.nom?.[0] || ''}` : 'M'

  return (
    <div className="feed-page">
      <div className="feed-topbar">
        <span className="feed-topbar-title">Mon fil</span>
      </div>

      <div className="feed-content">
        {/* Composer */}
        <div className="feed-composer">
          <div className="feed-composer-top">
            <div className="feed-composer-av">{myAv}</div>
            <textarea className="feed-composer-input" value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Partagez votre expérience nautique..." rows={3} maxLength={500} />
          </div>

          {/* Photos sélectionnées */}
          {newPhotos.length > 0 && (
            <div className="feed-new-photos">
              {newPhotos.map((p, i) => (
                <div key={i} className="feed-new-photo">
                  <img src={p.url} alt="" />
                  <button onClick={() => removeNewPhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="feed-composer-bottom">
            <div className="feed-vis-btns">
              <button className={`feed-vis-btn ${visibilite === 'public' ? 'active' : ''}`} onClick={() => setVisibilite('public')}>🌐 Public</button>
              <button className={`feed-vis-btn ${visibilite === 'abonnes' ? 'active' : ''}`} onClick={() => setVisibilite('abonnes')}>🔒 Abonnés</button>
            </div>
            <div className="feed-toolbar">
              {newPhotos.length < 4 && (
                <FileUpload
                  bucket="posts"
                  folder={userId}
                  accept="image/*"
                  multiple
                  maxFiles={4}
                  label=""
                  existingFiles={newPhotos}
                  onUpload={handlePhotoUpload}
                  compact
                />
              )}
              <button className="feed-post-btn" disabled={!newText.trim()} onClick={handlePost}>Publier</button>
            </div>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 20, color: '#6b7e94' }}>Chargement...</div>}

        {posts.map(p => {
          const auteurNom = p.auteur ? `${p.auteur.prenom} ${p.auteur.nom}` : 'Utilisateur'
          const auteurAv = p.auteur ? `${p.auteur.prenom?.[0] || ''}${p.auteur.nom?.[0] || ''}` : 'U'
          const isMe = p.auteur_id === userId
          const timeAff = new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          const showCmts = expandedComments[p.id]

          return (
            <div key={p.id} className="feed-post">
              <div className="feed-post-header">
                <div className="feed-post-av" style={{ background: '#185fa5' }}>{auteurAv}</div>
                <div className="feed-post-meta">
                  <div className="feed-post-auteur">{auteurNom}</div>
                  <div className="feed-post-time">{timeAff}<span className="feed-post-vis">{p.visibilite === 'public' ? ' 🌐' : ' 🔒'}</span></div>
                </div>
              </div>

              <p className="feed-post-texte">{p.contenu}</p>

              {/* Photos du post */}
              {p.photos && p.photos.length > 0 && (
                <div className={`feed-post-photos feed-photos-${p.photos.length}`}>
                  {p.photos.map((ph, i) => (
                    <img key={i} src={ph.url} alt="" className="feed-post-photo" />
                  ))}
                </div>
              )}

              <div className="feed-post-actions">
                <button className={`feed-action ${p.liked ? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>
                  {p.liked ? '❤️' : '🤍'} {p.likes}
                </button>
                <button className="feed-action" onClick={() => toggleComments(p.id)}>
                  💬 {p.comments?.length || 0}
                </button>
                <button className="feed-action">↗️ Partager</button>
                {isMe && <button className="feed-action delete" onClick={() => deletePost(p.id)}>🗑</button>}
              </div>

              {showCmts && (
                <div className="feed-comments">
                  {(p.comments || []).map(c => (
                    <div key={c.id} className="feed-comment">
                      <div className="feed-cmt-av" style={{ background: '#185fa5' }}>{c.nom?.[0] || 'U'}</div>
                      <div className="feed-cmt-body">
                        <span className="feed-cmt-nom">{c.nom}</span>
                        <span className="feed-cmt-time"> · {c.time}</span>
                        <div className="feed-cmt-texte">{c.texte}</div>
                        <button className={`feed-cmt-like ${c.liked ? 'liked' : ''}`} onClick={() => likeComment(p.id, c.id)}>
                          {c.liked ? '❤️' : '🤍'} {c.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="feed-cmt-input-wrap">
                    <input className="feed-cmt-input" placeholder="Votre commentaire..."
                      value={commentInputs[p.id] || ''}
                      onChange={e => setCommentInputs(ci => ({ ...ci, [p.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && sendComment(p.id)} />
                    <button className="feed-cmt-send" onClick={() => sendComment(p.id)}>→</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}