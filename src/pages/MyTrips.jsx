import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyTrips.css'

const MOCK_MY_TRIPS = [
  {id:1,role:'skipper',titre:'Marseille → Porto-Vecchio',date:'14 juin 2026',statut:'actif',places_dispo:2,places_total:4,prix:159,equip:[{nom:'Thomas L.',av:'TL',statut:'accepte'},{nom:'Claire D.',av:'CD',statut:'en_attente'}]},
  {id:2,role:'equipier',titre:'Brest → Saint-Malo',date:'20 juin 2026',statut:'confirme',skipper:'Pierre Bernard',prix:89},
  {id:3,role:'skipper',titre:'Nice → Ajaccio',date:'2 juil. 2026',statut:'complet',places_dispo:0,places_total:3,prix:120,equip:[{nom:'Marie M.',av:'MM',statut:'paye'},{nom:'Lucas S.',av:'LS',statut:'paye'},{nom:'Sophie L.',av:'SL',statut:'paye'}]},
  {id:4,role:'equipier',titre:'La Rochelle → Île de Ré',date:'28 juin 2026',statut:'termine',skipper:'Antoine Petit',prix:65},
]

const statutLabel = {actif:'Actif',confirme:'Confirmé',complet:'Complet',termine:'Terminé',annule:'Annulé'}
const statutColor = {actif:'#0f6e56',confirme:'#185fa5',complet:'#d97706',termine:'#6b7e94',annule:'#ef4444'}

export default function MyTrips() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')

  const filtered = tab === 'all' ? MOCK_MY_TRIPS :
    tab === 'skipper' ? MOCK_MY_TRIPS.filter(t => t.role === 'skipper') :
    MOCK_MY_TRIPS.filter(t => t.role === 'equipier')

  return (
    <div className="mytrips-page">
      <div className="mytrips-topbar">
        <span className="mytrips-topbar-title">Mes trajets</span>
        <button className="mytrips-new-btn" onClick={() => navigate('/annonce')}>+ Nouveau</button>
      </div>

      <div className="mytrips-content">
        <div className="mytrips-tabs">
          <button className={`mytrips-tab ${tab==='all'?'active':''}`} onClick={() => setTab('all')}>Tous ({MOCK_MY_TRIPS.length})</button>
          <button className={`mytrips-tab ${tab==='skipper'?'active':''}`} onClick={() => setTab('skipper')}>Skipper ({MOCK_MY_TRIPS.filter(t=>t.role==='skipper').length})</button>
          <button className={`mytrips-tab ${tab==='equipier'?'active':''}`} onClick={() => setTab('equipier')}>Équipier ({MOCK_MY_TRIPS.filter(t=>t.role==='equipier').length})</button>
        </div>

        {filtered.map(t => (
          <div key={t.id} className="mytrips-card">
            <div className="mytrips-card-header">
              <div className="mytrips-card-role">{t.role === 'skipper' ? '⚓ Skipper' : '👤 Équipier'}</div>
              <div className="mytrips-card-statut" style={{color:statutColor[t.statut]}}>{statutLabel[t.statut]}</div>
            </div>
            <div className="mytrips-card-titre">{t.titre}</div>
            <div className="mytrips-card-date">📅 {t.date}</div>

            {t.role === 'skipper' && (
              <div className="mytrips-equip">
                <div className="mytrips-equip-label">{t.places_total - t.places_dispo}/{t.places_total} équipiers</div>
                <div className="mytrips-equip-list">
                  {t.equip.map((e,i) => (
                    <div key={i} className="mytrips-equip-item">
                      <div className="mytrips-equip-av">{e.av}</div>
                      <span>{e.nom}</span>
                      <span className={`mytrips-equip-statut ${e.statut}`}>{e.statut === 'accepte' ? 'Accepté' : e.statut === 'paye' ? '💳 Payé' : 'En attente'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {t.role === 'equipier' && (
              <div className="mytrips-skipper-info">
                <span>Skipper : {t.skipper}</span>
                <span className="mytrips-prix">{t.prix} €</span>
              </div>
            )}

            <div className="mytrips-card-actions">
              <button className="mytrips-btn-sec" onClick={() => navigate(`/trip/${t.id}`)}>Voir le trajet</button>
              <button className="mytrips-btn-sec" onClick={() => navigate('/messages')}>Messages</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
