import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        supabase.from('users').select('*').eq('id', data.user.id).single()
          .then(({ data: prof }) => { if (prof) setProfile(prof) })
      }
    })
  }, [])

  const meta = user?.user_metadata || {}
  const prenom = profile?.prenom || meta.prenom || 'Marin'

  return (
    <div className="dash-scroll">
      <div className="dash-content">
        <div className="dash-welcome">
          <h1>Bonjour {prenom} 👋</h1>
          <p>Bienvenue sur WeSail — votre plateforme de covoiturage nautique.</p>
        </div>
        <div className="dash-cards">
          <div className="dash-card" onClick={() => navigate('/search')}>
            <div className="dash-card-icon">🔍</div>
            <div className="dash-card-title">Trouver un trajet</div>
            <div className="dash-card-sub">Rechercher parmi les annonces</div>
          </div>
          <div className="dash-card cta" onClick={() => navigate('/annonce')}>
            <div className="dash-card-icon">⛵</div>
            <div className="dash-card-title">Publier un trajet</div>
            <div className="dash-card-sub">Proposer des places à bord</div>
          </div>
          <div className="dash-card" onClick={() => navigate('/messages')}>
            <div className="dash-card-icon">💬</div>
            <div className="dash-card-title">Messages</div>
            <div className="dash-card-sub">0 nouveau message</div>
          </div>
          <div className="dash-card" onClick={() => navigate('/meteo')}>
            <div className="dash-card-icon">🌊</div>
            <div className="dash-card-title">Météo marine</div>
            <div className="dash-card-sub">Conditions en temps réel</div>
          </div>
        </div>
        {user && (
          <div className="dash-info">
            <h2>Mon compte</h2>
            <div className="dash-info-row"><span>Email</span><span>{user.email}</span></div>
            <div className="dash-info-row"><span>Membre depuis</span><span>{new Date(user.created_at).toLocaleDateString('fr-FR')}</span></div>
            {profile && <div className="dash-info-row"><span>Genre</span><span>{profile.genre==='f'?'Femme':'Homme'}</span></div>}
          </div>
        )}
      </div>
    </div>
  )
}
