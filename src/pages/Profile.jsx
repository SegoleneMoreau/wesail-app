import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FileUpload from '../components/FileUpload'
import './Profile.css'

const NIVEAUX = [
  { v: 1, l: 'Débutant', s: 'Quelques sorties en mer' },
  { v: 2, l: 'Initié', s: 'Navigations côtières' },
  { v: 3, l: 'Expérimenté', s: 'Traversées et navigation hauturière' },
  { v: 4, l: 'Skipper', s: 'Skipper confirmé, compétences avancées' },
]

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ prenom: '', nom: '', bio: '', niveau: 1, genre: 'f' })
  const [photoUrl, setPhotoUrl] = useState(null)
  const [documents, setDocuments] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        loadProfile(user.id)
      }
    })
  }, [])

  async function loadProfile(uid) {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').eq('id', uid).single()
    if (data) {
      setProfile(data)
      setForm({
        prenom: data.prenom || '',
        nom: data.nom || '',
        bio: data.bio || '',
        niveau: data.niveau || 1,
        genre: data.genre || 'f',
      })
      setPhotoUrl(data.photo_url || null)
      // Charger les documents depuis storage
      const { data: files } = await supabase.storage.from('documents').list(uid + '/')
      if (files) {
        const docs = files.map(f => ({
          name: f.name,
          url: supabase.storage.from('documents').getPublicUrl(`${uid}/${f.name}`).data.publicUrl,
          path: `${uid}/${f.name}`
        }))
        setDocuments(docs)
      }
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    const { error } = await supabase.from('users').update({
      prenom: form.prenom,
      nom: form.nom,
      bio: form.bio,
      niveau: form.niveau,
      genre: form.genre,
      photo_url: photoUrl,
    }).eq('id', userId)
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  async function handlePhotoUpload(file) {
    setPhotoUrl(file.url)
  }

  async function handleDocUpload(files) {
    const newDocs = Array.isArray(files) ? files : [files]
    setDocuments(d => [...d, ...newDocs])
  }

  async function removeDocument(idx) {
    const doc = documents[idx]
    if (doc.path) await supabase.storage.from('documents').remove([doc.path])
    setDocuments(d => d.filter((_, i) => i !== idx))
  }

  function u(k, v) { setForm(f => ({ ...f, [k]: v })) }

  if (loading) return <div className="prof-loading">Chargement...</div>

  const initials = profile ? `${profile.prenom?.[0] || ''}${profile.nom?.[0] || ''}` : 'U'

  return (
    <div className="prof-page">
      <div className="prof-topbar">
        <span className="prof-topbar-title">Mon profil</span>
        <button className="prof-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="prof-content">
        {/* Photo de profil */}
        <div className="prof-section">
          <div className="prof-section-title">Photo de profil</div>
          <div className="prof-photo-wrap">
            <div className="prof-avatar-big">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="prof-avatar-img" />
              ) : (
                <span className="prof-avatar-initials">{initials}</span>
              )}
            </div>
            <div className="prof-photo-actions">
              <FileUpload
                bucket="avatars"
                folder={userId}
                accept="image/*"
                label="Changer la photo"
                onUpload={handlePhotoUpload}
                compact
              />
              {photoUrl && (
                <button className="prof-photo-remove" onClick={() => setPhotoUrl(null)}>Supprimer</button>
              )}
            </div>
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="prof-section">
          <div className="prof-section-title">Informations personnelles</div>
          <div className="prof-row">
            <div className="prof-field">
              <label>Prénom *</label>
              <input value={form.prenom} onChange={e => u('prenom', e.target.value)} placeholder="Votre prénom" />
            </div>
            <div className="prof-field">
              <label>Nom *</label>
              <input value={form.nom} onChange={e => u('nom', e.target.value)} placeholder="Votre nom" />
            </div>
          </div>
          <div className="prof-field">
            <label>Genre</label>
            <div className="prof-genre-btns">
              <button className={`prof-genre-btn ${form.genre === 'f' ? 'active' : ''}`} onClick={() => u('genre', 'f')}>Femme</button>
              <button className={`prof-genre-btn ${form.genre === 'm' ? 'active' : ''}`} onClick={() => u('genre', 'm')}>Homme</button>
            </div>
          </div>
          <div className="prof-field">
            <label>Bio</label>
            <textarea value={form.bio} onChange={e => u('bio', e.target.value)}
              placeholder="Parlez de vous, votre expérience nautique, vos zones favorites..."
              rows={4} />
          </div>
        </div>

        {/* Niveau */}
        <div className="prof-section">
          <div className="prof-section-title">Niveau de navigation</div>
          <div className="prof-niveaux">
            {NIVEAUX.map(n => (
              <button key={n.v} className={`prof-niveau-btn ${form.niveau === n.v ? 'active' : ''}`}
                onClick={() => u('niveau', n.v)}>
                <div className="prof-niveau-label">{n.l}</div>
                <div className="prof-niveau-sub">{n.s}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="prof-section">
          <div className="prof-section-title">Documents & Certifications</div>
          <p className="prof-section-sub">CNI, permis côtier, permis hauturier, diplômes, certifications...</p>
          <FileUpload
            bucket="documents"
            folder={userId}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            maxFiles={10}
            label="Ajouter un document"
            existingFiles={documents}
            onUpload={handleDocUpload}
            onRemove={removeDocument}
          />
        </div>
      </div>
    </div>
  )
}