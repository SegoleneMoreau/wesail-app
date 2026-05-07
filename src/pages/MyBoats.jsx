import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyBoats.css'

const MOCK_BOATS = [
  {id:1,nom:'Mistral',type:'Voilier',marque:'Jeanneau',modele:'Sun Odyssey 440',longueur:13.5,couchages:8,port:'Marseille Vieux-Port',assurance:true,photo:'⛵'},
  {id:2,nom:'Liberté',type:'Catamaran',marque:'Lagoon',modele:'400 S2',longueur:11.9,couchages:6,port:'Toulon',assurance:true,photo:'⛵'},
]

export default function MyBoats() {
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({nom:'',type:'Voilier',marque:'',modele:'',longueur:'',couchages:'',port:''})

  function update(k,v){ setForm(f=>({...f,[k]:v})) }

  return (
    <div className="boats-page">
      <div className="boats-topbar">
        <span className="boats-topbar-title">Mes bateaux</span>
        <button className="boats-new-btn" onClick={() => setShowNew(true)}>+ Ajouter</button>
      </div>

      <div className="boats-content">
        {MOCK_BOATS.map(b => (
          <div key={b.id} className="boat-card">
            <div className="boat-card-icon">{b.photo}</div>
            <div className="boat-card-body">
              <div className="boat-card-nom">{b.nom}</div>
              <div className="boat-card-type">{b.type} · {b.marque} {b.modele}</div>
              <div className="boat-card-infos">
                <span>📏 {b.longueur}m</span>
                <span>🛏 {b.couchages} couchages</span>
                <span>📍 {b.port}</span>
              </div>
              <div className="boat-card-docs">
                <span className={`boat-doc ${b.assurance?'ok':''}`}>
                  {b.assurance?'✓':'✗'} Assurance
                </span>
              </div>
            </div>
            <div className="boat-card-actions">
              <button className="boat-btn">Modifier</button>
              <button className="boat-btn danger">Supprimer</button>
            </div>
          </div>
        ))}

        {MOCK_BOATS.length === 0 && (
          <div className="boats-empty">
            <div className="boats-empty-icon">⛵</div>
            <p>Vous n'avez pas encore de bateau enregistré.</p>
            <button className="boats-empty-btn" onClick={() => setShowNew(true)}>Ajouter mon bateau</button>
          </div>
        )}
      </div>

      {showNew && (
        <div className="boats-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="boats-modal" onClick={e => e.stopPropagation()}>
            <div className="boats-modal-title">Ajouter un bateau</div>
            <div className="boats-modal-field"><label>Nom du bateau *</label><input value={form.nom} onChange={e=>update('nom',e.target.value)} placeholder="ex: Mistral" /></div>
            <div className="boats-modal-row">
              <div className="boats-modal-field"><label>Type</label>
                <select value={form.type} onChange={e=>update('type',e.target.value)}>
                  <option>Voilier</option><option>Catamaran</option><option>Moteur</option><option>Dériveur</option>
                </select>
              </div>
              <div className="boats-modal-field"><label>Longueur (m)</label><input type="number" value={form.longueur} onChange={e=>update('longueur',e.target.value)} placeholder="ex: 12" /></div>
            </div>
            <div className="boats-modal-row">
              <div className="boats-modal-field"><label>Marque</label><input value={form.marque} onChange={e=>update('marque',e.target.value)} placeholder="ex: Jeanneau" /></div>
              <div className="boats-modal-field"><label>Modèle</label><input value={form.modele} onChange={e=>update('modele',e.target.value)} placeholder="ex: Sun Odyssey" /></div>
            </div>
            <div className="boats-modal-row">
              <div className="boats-modal-field"><label>Couchages</label><input type="number" value={form.couchages} onChange={e=>update('couchages',e.target.value)} placeholder="ex: 6" /></div>
              <div className="boats-modal-field"><label>Port d'attache</label><input value={form.port} onChange={e=>update('port',e.target.value)} placeholder="ex: Marseille" /></div>
            </div>
            <div className="boats-modal-btns">
              <button className="boats-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="boats-modal-send" onClick={() => setShowNew(false)}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
