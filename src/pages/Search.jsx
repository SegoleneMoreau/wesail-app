import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Search.css'

const ZONES = [
  {n:'Méditerranée',s:'247 annonces',zone:'med'},
  {n:'Atlantique',s:'183 annonces',zone:'atl'},
  {n:'Bretagne',s:'96 annonces',zone:'bre'},
  {n:'Corse',s:'74 annonces',zone:'cors'},
  {n:'Manche & Normandie',s:'58 annonces',zone:'man'},
  {n:'Mer du Nord',s:'31 annonces',zone:'nord'},
  {n:'Antilles · Caraïbes',s:'42 annonces',zone:'antilles'},
  {n:'Polynésie française',s:'19 annonces',zone:'polynesie'},
]

const MOCK_TRIPS = [
  {id:1,depart:'Marseille',arrivee:'Porto-Vecchio',date_depart:'2026-06-14',prix_par_personne:159,places_dispo:2,niveau_requis:2,categorie:'traversee',skipper:{prenom:'Thomas',nom:'Leroy',note:4.9}},
  {id:2,depart:'Brest',arrivee:'Saint-Malo',date_depart:'2026-06-20',prix_par_personne:89,places_dispo:3,niveau_requis:1,categorie:'traversee',skipper:{prenom:'Claire',nom:'Dubois',note:4.7}},
  {id:3,depart:'Nice',arrivee:'Ajaccio',date_depart:'2026-07-02',prix_par_personne:120,places_dispo:1,niveau_requis:2,categorie:'traversee',skipper:{prenom:'Pierre',nom:'Bernard',note:4.8}},
  {id:4,depart:'La Rochelle',arrivee:'Île de Ré',date_depart:'2026-06-28',prix_par_personne:65,places_dispo:4,niveau_requis:1,categorie:'journee',skipper:{prenom:'Marie',nom:'Moreau',note:5.0}},
  {id:5,depart:'Toulon',arrivee:'Saint-Tropez',date_depart:'2026-07-10',prix_par_personne:95,places_dispo:2,niveau_requis:1,categorie:'journee',skipper:{prenom:'Lucas',nom:'Simon',note:4.6}},
  {id:6,depart:'Lorient',arrivee:'Belle-Île',date_depart:'2026-07-15',prix_par_personne:55,places_dispo:3,niveau_requis:1,categorie:'journee',skipper:{prenom:'Sophie',nom:'Laurent',note:4.8}},
  {id:7,depart:'Bordeaux',arrivee:'Arcachon',date_depart:'2026-08-01',prix_par_personne:75,places_dispo:2,niveau_requis:2,categorie:'weekend',skipper:{prenom:'Antoine',nom:'Petit',note:4.5}},
]

function normStr(s){return(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}

export default function Search() {
  const navigate = useNavigate()
  const [dep, setDep] = useState('')
  const [arr, setArr] = useState('')
  const [date, setDate] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  function doSearch() {
    setLoading(true)
    setTimeout(() => {
      let f = MOCK_TRIPS
      if(dep) f=f.filter(t=>normStr(t.depart).includes(normStr(dep))||normStr(t.arrivee).includes(normStr(dep)))
      if(arr) f=f.filter(t=>normStr(t.arrivee).includes(normStr(arr)))
      if(date) f=f.filter(t=>t.date_depart>=date)
      setResults(f); setLoading(false)
    },400)
  }

  return (
    <div className="search-page">
      <div className="search-topbar">
        <span className="search-topbar-title">Trouver un trajet / bateau</span>
      </div>
      <div className="search-bar">
        <div className="sb-field">
          <span className="sb-icon">📍</span>
          <input value={dep} onChange={e=>setDep(e.target.value)} placeholder="Port de départ..." className="sb-input"/>
        </div>
        <span className="sb-sep">→</span>
        <div className="sb-field">
          <span className="sb-icon">📍</span>
          <input value={arr} onChange={e=>setArr(e.target.value)} placeholder="Destination..." className="sb-input"/>
        </div>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="sb-date"/>
        <button onClick={doSearch} className="sb-btn">🔍 Rechercher</button>
      </div>
      <div className="search-content">
        {!results && (
          <div className="zones-section">
            <div className="zones-title">Zones populaires</div>
            <div className="zones-grid">
              {ZONES.map(z=>(
                <div key={z.zone} className="zone-card" onClick={()=>{setDep(z.n);setTimeout(doSearch,100)}}>
                  <div className="zone-icon">⛵</div>
                  <div><div className="zone-name">{z.n}</div><div className="zone-sub">{z.s}</div></div>
                  <span className="zone-arr">›</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {results && (
          <div className="results-section">
            <div className="results-header">
              <span>{results.length} trajet{results.length>1?'s':''} trouvé{results.length>1?'s':''}</span>
              <button className="results-reset" onClick={()=>{setResults(null);setDep('');setArr('');setDate('')}}>Effacer</button>
            </div>
            {results.length===0 && <div className="no-results">Aucun trajet trouvé.</div>}
            {results.map(t=>(
              <div key={t.id} className="trip-card" onClick={()=>navigate(`/trip/${t.id}`)}>
                <div className="trip-route">
                  <span className="trip-dep">{t.depart}</span>
                  <span className="trip-arrow">→</span>
                  <span className="trip-arr">{t.arrivee}</span>
                </div>
                <div className="trip-meta">
                  <span>📅 {new Date(t.date_depart).toLocaleDateString('fr-FR')}</span>
                  <span>👤 {t.places_dispo} place{t.places_dispo>1?'s':''}</span>
                </div>
                <div className="trip-footer">
                  <div className="trip-skipper">
                    <div className="trip-sk-av">{t.skipper.prenom[0]}</div>
                    <span>{t.skipper.prenom} {t.skipper.nom}</span>
                    <span className="trip-note">★ {t.skipper.note}</span>
                  </div>
                  <div className="trip-price">{t.prix_par_personne} €<span>/pers.</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
