import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Layout.css'

const NIVEAUX = ['','Débutant','Initié','Expérimenté','Skipper']

export default function Layout({ children, user, profile }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const prenom = profile?.prenom || user?.user_metadata?.prenom || 'Marin'
  const nom = profile?.nom || user?.user_metadata?.nom || ''
  const niveau = profile?.niveau || 1
  const genre = profile?.genre || 'm'
  const initials = (prenom[0]||'').toUpperCase() + (nom[0]||'').toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      {/* Overlay mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`layout-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => { navigate('/'); setSidebarOpen(false) }}>
          <div className="sidebar-logo-circle">⛵</div>
          <div>
            <div className="sidebar-logo-name">WeSail</div>
            <div className="sidebar-logo-sub">La plateforme de rencontres<br/>entre skippers et voyageurs</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Activité nautique</div>
          <button className={`sidebar-item ${isActive('/search')?'active':''}`} onClick={() => { navigate('/search'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">🔍</span>Trouver un trajet / bateau
          </button>
          <button className="sidebar-item cta" onClick={() => { navigate('/annonce'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">＋</span>Déposer une annonce
          </button>
          <button className={`sidebar-item ${isActive('/meteo')?'active':''}`} onClick={() => { navigate('/meteo'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">🌊</span>Cartes & météo marines
          </button>

          <div className="sidebar-section-label">Communauté</div>
          <button className={`sidebar-item ${isActive('/forum')?'active':''}`} onClick={() => { navigate('/forum'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">💬</span>Forum
          </button>
          <button className={`sidebar-item ${isActive('/marketplace')?'active':''}`} onClick={() => { navigate('/marketplace'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">🛒</span>Marketplace
          </button>

          <div className="sidebar-section-label">Mon espace</div>
          <button className={`sidebar-item ${isActive('/fil')?'active':''}`} onClick={() => { navigate('/fil'); setSidebarOpen(false) }}>
            <span className="sidebar-item-icon">📰</span>Mon fil
          </button>
        </div>

        {/* Footer avatar */}
        <div className="sidebar-footer">
          <button className={`sidebar-pf-btn ${drawerOpen?'open':''}`} onClick={() => setDrawerOpen(d => !d)}>
            <div className="sidebar-pf-av">{initials}</div>
            <div>
              <div className="sidebar-pf-name">{prenom} {nom}</div>
              <div className="sidebar-pf-role">Skipper · Équipier</div>
            </div>
            <span className="sidebar-pf-chevron">▾</span>
          </button>

          {drawerOpen && (
            <div className="sidebar-drawer">
              <div className="drawer-head">
                <div className="drawer-av">{initials}</div>
                <div>
                  <div className="drawer-name">{prenom} {nom}</div>
                  <div className="drawer-sub">Skipper · Équipier · Niveau {niveau}</div>
                </div>
              </div>
              <button className="drawer-item" onClick={() => { navigate('/profile'); setDrawerOpen(false); setSidebarOpen(false) }}>
                👤 Mon profil
              </button>
              <button className="drawer-item" onClick={() => { navigate('/trajets'); setDrawerOpen(false); setSidebarOpen(false) }}>
                ⛵ Mes trajets
              </button>
              <button className="drawer-item" onClick={() => { navigate('/avis'); setDrawerOpen(false); setSidebarOpen(false) }}>
                ⭐ Mes avis
              </button>
              <button className="drawer-item" onClick={() => { navigate('/bateaux'); setDrawerOpen(false); setSidebarOpen(false) }}>
                🚢 Mes bateaux
              </button>
              <div className="drawer-sep" />
              <button className="drawer-item" onClick={() => { navigate('/settings'); setDrawerOpen(false); setSidebarOpen(false) }}>
                ⚙️ Paramètres
              </button>
              <button className="drawer-item" onClick={() => { navigate('/aide'); setDrawerOpen(false); setSidebarOpen(false) }}>
                ❓ Obtenir de l'aide
              </button>
              <div className="drawer-sep" />
              <button className="drawer-item danger" onClick={handleLogout}>
                🚪 Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenu */}
      <main className="layout-main">
        {/* Topbar mobile */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="mobile-topbar-title">WeSail</span>
          <button className="mobile-msg-btn" onClick={() => navigate('/messages')}>💬</button>
        </div>
        {children}
      </main>

      {/* Bottom nav mobile */}
      <nav className="bottomnav">
        <button className={`bottomnav-item ${isActive('/')?'active':''}`} onClick={() => navigate('/')}>
          <span className="bottomnav-icon">🏠</span>
          <span className="bottomnav-label">Accueil</span>
        </button>
        <button className={`bottomnav-item ${isActive('/search')?'active':''}`} onClick={() => navigate('/search')}>
          <span className="bottomnav-icon">🔍</span>
          <span className="bottomnav-label">Recherche</span>
        </button>
        <button className="bottomnav-item cta" onClick={() => navigate('/annonce')}>
          <span className="bottomnav-icon">＋</span>
          <span className="bottomnav-label">Publier</span>
        </button>
        <button className={`bottomnav-item ${isActive('/messages')?'active':''}`} onClick={() => navigate('/messages')}>
          <span className="bottomnav-icon">💬</span>
          <span className="bottomnav-label">Messages</span>
        </button>
        <button className={`bottomnav-item ${isActive('/profile')?'active':''}`} onClick={() => navigate('/profile')}>
          <span className="bottomnav-icon">👤</span>
          <span className="bottomnav-label">Profil</span>
        </button>
      </nav>
    </div>
  )
}
