import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({
    messages:true, reservations:true, avis:true, forum:false, newsletter:false
  })
  const [privacy, setPrivacy] = useState({
    profil_public:true, only_women:false, show_level:true
  })
  const [pwd, setPwd] = useState({current:'', new:'', confirm:''})
  const [pwdMsg, setPwdMsg] = useState('')

  function toggleNotif(k){ setNotifs(n=>({...n,[k]:!n[k]})) }
  function togglePrivacy(k){ setPrivacy(p=>({...p,[k]:!p[k]})) }

  async function handleSavePassword() {
    if(pwd.new !== pwd.confirm){ setPwdMsg('Les mots de passe ne correspondent pas'); return }
    if(pwd.new.length < 8){ setPwdMsg('8 caractères minimum'); return }
    const { error } = await supabase.auth.updateUser({ password: pwd.new })
    if(error){ setPwdMsg(error.message); return }
    setPwdMsg('✓ Mot de passe mis à jour !')
    setPwd({current:'',new:'',confirm:''})
    setTimeout(() => setPwdMsg(''), 3000)
  }

  async function handleDeleteAccount() {
    if(!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <div className="settings-page">
      <div className="settings-topbar">
        <span className="settings-topbar-title">Paramètres</span>
      </div>

      <div className="settings-content">
        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-section-title">🔔 Notifications</div>
          {[
            {k:'messages',l:'Nouveaux messages'},
            {k:'reservations',l:'Demandes de réservation'},
            {k:'avis',l:'Nouveaux avis'},
            {k:'forum',l:'Activité forum'},
            {k:'newsletter',l:'Newsletter WeSail'},
          ].map(({k,l}) => (
            <div key={k} className="settings-row">
              <span>{l}</span>
              <button className={`settings-toggle ${notifs[k]?'on':''}`} onClick={() => toggleNotif(k)}>
                <div className="settings-toggle-thumb"></div>
              </button>
            </div>
          ))}
        </div>

        {/* Confidentialité */}
        <div className="settings-section">
          <div className="settings-section-title">🔒 Confidentialité</div>
          {[
            {k:'profil_public',l:'Profil visible publiquement'},
            {k:'show_level',l:'Afficher mon niveau de voile'},
            {k:'only_women',l:'Mode Only Women actif'},
          ].map(({k,l}) => (
            <div key={k} className="settings-row">
              <span>{l}</span>
              <button className={`settings-toggle ${privacy[k]?'on':''}`} onClick={() => togglePrivacy(k)}>
                <div className="settings-toggle-thumb"></div>
              </button>
            </div>
          ))}
        </div>

        {/* Mot de passe */}
        <div className="settings-section">
          <div className="settings-section-title">🔑 Changer le mot de passe</div>
          <div className="settings-field"><label>Nouveau mot de passe</label>
            <input type="password" value={pwd.new} onChange={e=>setPwd(p=>({...p,new:e.target.value}))} placeholder="8 caractères minimum" />
          </div>
          <div className="settings-field"><label>Confirmer</label>
            <input type="password" value={pwd.confirm} onChange={e=>setPwd(p=>({...p,confirm:e.target.value}))} placeholder="Répétez le mot de passe" />
          </div>
          {pwdMsg && <div className={`settings-msg ${pwdMsg.startsWith('✓')?'ok':'err'}`}>{pwdMsg}</div>}
          <button className="settings-btn" onClick={handleSavePassword}>Mettre à jour</button>
        </div>

        {/* Langue */}
        <div className="settings-section">
          <div className="settings-section-title">🌍 Langue & Région</div>
          <div className="settings-field"><label>Langue</label>
            <select defaultValue="fr"><option value="fr">Français</option><option value="en">English</option></select>
          </div>
          <div className="settings-field"><label>Devise</label>
            <select defaultValue="eur"><option value="eur">Euro (€)</option><option value="usd">Dollar ($)</option></select>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-section danger-zone">
          <div className="settings-section-title">⚠️ Zone de danger</div>
          <p className="settings-danger-text">La suppression de votre compte est irréversible. Toutes vos données seront perdues.</p>
          <button className="settings-danger-btn" onClick={handleDeleteAccount}>Supprimer mon compte</button>
        </div>
      </div>
    </div>
  )
}
