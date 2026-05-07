import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Profile.css'

const NIVEAUX = ['','Débutant','Initié','Expérimenté','Skipper']

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        supabase.from('users').select('*').eq('id', data.user.id).single()
          .then(({ data: prof }) => {
            if (prof) { setProfile(prof); setForm(prof) }
            else {
              const meta = data.user.user_metadata || {}
              const defaultProf = { prenom: meta.prenom||'', nom: meta.nom||'', genre: meta.genre||'m', niveau: meta.niveau||1, bio:'' }
              setForm(defaultProf)
            }
          })
      }
    })
  }, [])

  function update(k, v) { setForm(f => ({...f, [k]:v})) }

  async function handleSave() {
    setSaving(true)
    await supabase.from('users').upsert({ ...form, id: user.id, email: user.email })
    setProfile(form)
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = form.prenom ? form.prenom[0].toUpperCase() + (form.nom?.[0]||'').toUpperCase() : '?'

  return (
    <div className="prof-page">
      <div className="prof-header">
        <button className="prof-back" onClick={() => navigate('/')}>← Retour</button>
        <span className="prof-header-title">Mon profil</span>
        <button className="prof-edit-btn" onClick={() => editing ? handleSave() : setEditing(true)}>
          {saving ? 'Enregistrement...' : editing ? '✓ Sauvegarder' : '✏️ Modifier'}
        </button>
      </div>

      {saved && <div className="prof-saved">✓ Profil mis à jour !</div>}

      <div className="prof-content">
        {/* Avatar */}
        <div className="prof-avatar-section">
          <div className="prof-avatar">{initials}</div>
          <div className="prof-avatar-info">
            <div className="prof-name">{form.prenom} {form.nom}</div>
            <div className="prof-meta">{NIVEAUX[form.niveau||1]} · {form.genre==='f'?'Femme':'Homme'}</div>
          </div>
        </div>

        {/* Infos */}
        <div className="prof-section">
          <div className="prof-section-title">Informations personnelles</div>
          <div className="prof-row">
            <div className="prof-field">
              <label>Prénom</label>
              {editing ? <input value={form.prenom||''} onChange={e=>update('prenom',e.target.value)} /> : <div className="prof-val">{form.prenom||'—'}</div>}
            </div>
            <div className="prof-field">
              <label>Nom</label>
              {editing ? <input value={form.nom||''} onChange={e=>update('nom',e.target.value)} /> : <div className="prof-val">{form.nom||'—'}</div>}
            </div>
          </div>
          <div className="prof-field">
            <label>Email</label>
            <div className="prof-val">{user?.email}</div>
          </div>
          <div className="prof-field">
            <label>Genre</label>
            {editing ? (
              <div className="prof-genre">
                <button className={`prof-genre-btn ${form.genre==='m'?'active':''}`} onClick={()=>update('genre','m')}>Homme</button>
                <button className={`prof-genre-btn ${form.genre==='f'?'active':''}`} onClick={()=>update('genre','f')}>Femme</button>
              </div>
            ) : <div className="prof-val">{form.genre==='f'?'Femme':'Homme'}</div>}
          </div>
        </div>

        {/* Niveau */}
        <div className="prof-section">
          <div className="prof-section-title">Niveau de voile</div>
          {editing ? (
            <div className="prof-niveaux">
              {[1,2,3,4].map(n => (
                <button key={n} className={`prof-niveau-btn ${form.niveau===n?'active':''}`} onClick={()=>update('niveau',n)}>
                  <div className="prof-niveau-label">{NIVEAUX[n]}</div>
                  <div className="prof-niveau-sub">{['','Quelques sorties','Navigations côtières','Traversées','Skipper confirmé'][n]}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="prof-niveau-display">
              <div className="prof-niveau-badge">{NIVEAUX[form.niveau||1]}</div>
              <div className="prof-niveau-dots">
                {[1,2,3,4].map(n => <div key={n} className={`prof-dot ${n<=(form.niveau||1)?'active':''}`}></div>)}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="prof-section">
          <div className="prof-section-title">Présentation</div>
          {editing ? (
            <textarea className="prof-bio-input" value={form.bio||''} onChange={e=>update('bio',e.target.value)} placeholder="Parlez de vous, de votre expérience nautique..." rows={4} />
          ) : (
            <p className="prof-bio">{form.bio||'Aucune présentation pour le moment.'}</p>
          )}
        </div>

        {/* Stats */}
        <div className="prof-stats">
          <div className="prof-stat"><div className="prof-stat-val">0</div><div className="prof-stat-label">Trajets</div></div>
          <div className="prof-stat"><div className="prof-stat-val">—</div><div className="prof-stat-label">Note</div></div>
          <div className="prof-stat"><div className="prof-stat-val">0</div><div className="prof-stat-label">Avis</div></div>
          <div className="prof-stat"><div className="prof-stat-val">0</div><div className="prof-stat-label">Milles</div></div>
        </div>

        {/* Déconnexion */}
        <button className="prof-logout" onClick={async()=>{await supabase.auth.signOut();navigate('/auth')}}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
