import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [genre, setGenre] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPwd })
    setLoading(false)
    if (error) { setError('Email ou mot de passe incorrect'); return }
    navigate('/')
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!genre) { setError('Veuillez sélectionner votre genre'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: regEmail, password: regPwd,
      options: { data: { prenom, nom, genre, niveau: 1 } }
    })
    if (error) { setLoading(false); setError(error.message); return }
    if (data.user) {
      await supabase.from('users').upsert({ id: data.user.id, email: regEmail, prenom, nom, genre, niveau: 1 })
    }
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-circle">⛵</div>
          <div>
            <div className="auth-logo-title">WeSail</div>
            <div className="auth-logo-sub">La plateforme de rencontres entre skippers et voyageurs</div>
          </div>
        </div>
        <div className="auth-tagline">Naviguez ensemble.<br/>Partagez l'aventure.</div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={() => { setTab('login'); setError('') }}>Connexion</button>
            <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={() => { setTab('register'); setError('') }}>Inscription</button>
          </div>
          {error && <div className="auth-error">{error}</div>}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field"><label>Email</label><input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="votre@email.com" required /></div>
              <div className="auth-field"><label>Mot de passe</label><input type="password" value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} placeholder="••••••••" required /></div>
              <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
            </form>
          )}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-row">
                <div className="auth-field"><label>Prénom</label><input type="text" value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Marie" required /></div>
                <div className="auth-field"><label>Nom</label><input type="text" value={nom} onChange={e=>setNom(e.target.value)} placeholder="Dupont" required /></div>
              </div>
              <div className="auth-field"><label>Email</label><input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="votre@email.com" required /></div>
              <div className="auth-field"><label>Mot de passe</label><input type="password" value={regPwd} onChange={e=>setRegPwd(e.target.value)} placeholder="8 caractères minimum" minLength={8} required /></div>
              <div className="auth-field">
                <label>Genre</label>
                <div className="auth-genre">
                  <button type="button" className={`genre-btn ${genre==='m'?'active':''}`} onClick={() => setGenre('m')}>Homme</button>
                  <button type="button" className={`genre-btn ${genre==='f'?'active':''}`} onClick={() => setGenre('f')}>Femme</button>
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
