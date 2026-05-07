import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './NewTrip.css'

const PORTS = ['Marseille','Toulon','Nice','Brest','Saint-Malo','La Rochelle','Bordeaux','Lorient','Cherbourg','Ajaccio','Bonifacio','Bastia','Fort-de-France','Papeete']
const CATEGORIES = [{v:'traversee',l:'Traversée'},{v:'journee',l:'Journée'},{v:'weekend',l:'Weekend'},{v:'croisiere',l:'Croisière'},{v:'regate',l:'Régate'}]
const NIVEAUX = [{v:1,l:'Débutant'},{v:2,l:'Initié'},{v:3,l:'Expérimenté'},{v:4,l:'Skipper'}]

export default function NewTrip() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    depart:'', arrivee:'', date_depart:'', date_fin:'',
    places:'2', prix:'', niveau:1, categorie:'traversee',
    description:'', only_women:false
  })
  const [submitted, setSubmitted] = useState(false)

  function update(k, v) { setForm(f => ({...f, [k]:v})) }

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(() => navigate('/'), 2000)
  }

  if (submitted) return (
    <div className="nt-success">
      <div className="nt-success-icon">✓</div>
      <h2>Annonce publiée !</h2>
      <p>Votre trajet est maintenant visible par les équipiers.</p>
    </div>
  )

  return (
    <div className="nt-page">
      <div className="nt-header">
        <button className="nt-back" onClick={() => step > 1 ? setStep(s=>s-1) : navigate('/')}>← {step > 1 ? 'Retour' : 'Annuler'}</button>
        <span className="nt-header-title">Déposer une annonce</span>
        <span className="nt-step">{step}/3</span>
      </div>

      <div className="nt-progress"><div className="nt-progress-fill" style={{width:`${(step/3)*100}%`}}></div></div>

      <div className="nt-content">
        {/* Étape 1 — Trajet */}
        {step === 1 && (
          <div className="nt-section">
            <h2 className="nt-title">Le trajet</h2>
            <div className="nt-field">
              <label>Port de départ *</label>
              <select value={form.depart} onChange={e=>update('depart',e.target.value)}>
                <option value="">Sélectionnez un port</option>
                {PORTS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="nt-field">
              <label>Destination *</label>
              <select value={form.arrivee} onChange={e=>update('arrivee',e.target.value)}>
                <option value="">Sélectionnez un port</option>
                {PORTS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="nt-row">
              <div className="nt-field">
                <label>Date de départ *</label>
                <input type="date" value={form.date_depart} onChange={e=>update('date_depart',e.target.value)} />
              </div>
              <div className="nt-field">
                <label>Date d'arrivée</label>
                <input type="date" value={form.date_fin} onChange={e=>update('date_fin',e.target.value)} />
              </div>
            </div>
            <div className="nt-field">
              <label>Catégorie</label>
              <div className="nt-chips">
                {CATEGORIES.map(c=>(
                  <button key={c.v} className={`nt-chip ${form.categorie===c.v?'active':''}`} onClick={()=>update('categorie',c.v)}>{c.l}</button>
                ))}
              </div>
            </div>
            <button className="nt-next" disabled={!form.depart||!form.arrivee||!form.date_depart} onClick={()=>setStep(2)}>Suivant →</button>
          </div>
        )}

        {/* Étape 2 — Places et prix */}
        {step === 2 && (
          <div className="nt-section">
            <h2 className="nt-title">Places & Prix</h2>
            <div className="nt-field">
              <label>Nombre de places disponibles *</label>
              <div className="nt-counter">
                <button onClick={()=>update('places',Math.max(1,parseInt(form.places)-1).toString())}>−</button>
                <span>{form.places}</span>
                <button onClick={()=>update('places',Math.min(10,parseInt(form.places)+1).toString())}>+</button>
              </div>
            </div>
            <div className="nt-field">
              <label>Prix par équipier (€) *</label>
              <input type="number" value={form.prix} onChange={e=>update('prix',e.target.value)} placeholder="ex: 150" min="0" />
              {form.prix && <div className="nt-price-info">Vous recevrez {(form.prix*0.94).toFixed(0)} € · WeSail perçoit {(form.prix*0.06).toFixed(0)} € (6%)</div>}
            </div>
            <div className="nt-field">
              <label>Niveau requis</label>
              <div className="nt-chips">
                {NIVEAUX.map(n=>(
                  <button key={n.v} className={`nt-chip ${form.niveau===n.v?'active':''}`} onClick={()=>update('niveau',n.v)}>{n.l}</button>
                ))}
              </div>
            </div>
            <div className="nt-field">
              <label>
                <input type="checkbox" checked={form.only_women} onChange={e=>update('only_women',e.target.checked)} />
                {' '}Sortie Only Women
              </label>
            </div>
            <button className="nt-next" disabled={!form.prix} onClick={()=>setStep(3)}>Suivant →</button>
          </div>
        )}

        {/* Étape 3 — Description */}
        {step === 3 && (
          <div className="nt-section">
            <h2 className="nt-title">Description</h2>
            <div className="nt-field">
              <label>Décrivez votre trajet *</label>
              <textarea value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Décrivez le trajet, les conditions, ce que vous attendez des équipiers..." rows={6} />
              <div className="nt-chars">{form.description.length}/500</div>
            </div>
            <div className="nt-recap">
              <div className="nt-recap-title">Récapitulatif</div>
              <div className="nt-recap-row"><span>Trajet</span><span>{form.depart} → {form.arrivee}</span></div>
              <div className="nt-recap-row"><span>Départ</span><span>{form.date_depart ? new Date(form.date_depart).toLocaleDateString('fr-FR') : '-'}</span></div>
              <div className="nt-recap-row"><span>Places</span><span>{form.places}</span></div>
              <div className="nt-recap-row"><span>Prix</span><span>{form.prix} €/pers.</span></div>
            </div>
            <button className="nt-next" disabled={!form.description} onClick={handleSubmit}>🚀 Publier l'annonce</button>
          </div>
        )}
      </div>
    </div>
  )
}
