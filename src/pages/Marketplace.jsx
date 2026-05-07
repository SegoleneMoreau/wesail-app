import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Marketplace.css'

const CATEGORIES = [
  {id:'all',label:'Tout',icon:'🛒'},
  {id:'bateaux',label:'Bateaux',icon:'⛵'},
  {id:'voilure',label:'Voilure',icon:'🪁'},
  {id:'electronique',label:'Électronique',icon:'📡'},
  {id:'securite',label:'Sécurité',icon:'🦺'},
  {id:'moteur',label:'Moteur',icon:'⚙️'},
  {id:'divers',label:'Divers',icon:'📦'},
]

const MOCK_LISTINGS = [
  {id:1,cat:'electronique',titre:'GPS Garmin GPSMAP 743xsv',prix:890,nego:true,ville:'Marseille',vendeur:'Thomas L.',date:'il y a 2j',desc:'Très bon état, utilisé 2 saisons. Écran 7 pouces, sondeur intégré.'},
  {id:2,cat:'voilure',titre:'Grand voile Elvström 40m²',prix:450,nego:false,ville:'Brest',vendeur:'Claire D.',date:'il y a 3j',desc:'Voile en bon état, quelques réparations mineures. Compatible Bénéteau Oceanis 35.'},
  {id:3,cat:'securite',titre:'Lot de gilets de sauvetage x4',prix:280,nego:true,ville:'Nice',vendeur:'Pierre B.',date:'il y a 5j',desc:'4 gilets 150N homologués, révisés en 2025. Tailles adulte.'},
  {id:4,cat:'electronique',titre:'VHF fixe Standard Horizon GX2200',prix:180,nego:false,ville:'La Rochelle',vendeur:'Marie M.',date:'il y a 1j',desc:'VHF avec AIS intégré, parfait état de fonctionnement.'},
  {id:5,cat:'bateaux',titre:'Jeanneau Sun Odyssey 33i - 2018',prix:65000,nego:true,ville:'Toulon',vendeur:'Lucas S.',date:'il y a 7j',desc:'Très bon état général, gréement révisé 2024, moteur 30h.'},
  {id:6,cat:'divers',titre:'Mouillage complet chaîne 40m + ancre',prix:320,nego:true,ville:'Lorient',vendeur:'Sophie L.',date:'il y a 4j',desc:'Chaîne galvanisée 10mm, ancre CQR 20kg. Peu utilisé.'},
]

function formatPrix(p) {
  return p >= 1000 ? (p/1000).toFixed(0)+'k €' : p+' €'
}

export default function Marketplace() {
  const [activeCat, setActiveCat] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = MOCK_LISTINGS.filter(l => {
    const matchCat = activeCat === 'all' || l.cat === activeCat
    const matchSearch = !search || l.titre.toLowerCase().includes(search.toLowerCase()) || l.ville.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="market-page">
      <div className="market-topbar">
        <span className="market-topbar-title">Marketplace</span>
        <button className="market-new-btn" onClick={() => setShowNew(true)}>+ Vendre</button>
      </div>

      <div className="market-content">
        {/* Recherche */}
        <div className="market-search-wrap">
          <input className="market-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher du matériel..." />
        </div>

        {/* Catégories */}
        <div className="market-cats">
          {CATEGORIES.map(c => (
            <button key={c.id} className={`market-cat ${activeCat===c.id?'active':''}`} onClick={() => setActiveCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="market-grid">
          {filtered.map(l => (
            <div key={l.id} className="market-card">
              <div className="market-card-img">
                <span>{CATEGORIES.find(c=>c.id===l.cat)?.icon||'📦'}</span>
              </div>
              <div className="market-card-body">
                <div className="market-card-titre">{l.titre}</div>
                <div className="market-card-desc">{l.desc}</div>
                <div className="market-card-footer">
                  <div className="market-card-prix">
                    {formatPrix(l.prix)}
                    {l.nego && <span className="market-nego">Négociable</span>}
                  </div>
                  <div className="market-card-meta">{l.ville} · {l.date}</div>
                </div>
                <button className="market-contact-btn">Contacter</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="market-empty">Aucune annonce trouvée.</div>
        )}
      </div>

      {/* Modal vendre */}
      {showNew && (
        <div className="market-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="market-modal" onClick={e => e.stopPropagation()}>
            <div className="market-modal-title">Déposer une annonce</div>
            <div className="market-modal-field"><label>Titre</label><input placeholder="ex: GPS Garmin GPSMAP..." /></div>
            <div className="market-modal-field"><label>Catégorie</label>
              <select>{CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
            </div>
            <div className="market-modal-field"><label>Prix (€)</label><input type="number" placeholder="ex: 450" /></div>
            <div className="market-modal-field"><label>Ville</label><input placeholder="ex: Marseille" /></div>
            <div className="market-modal-field"><label>Description</label><textarea rows={3} placeholder="Décrivez votre article..." /></div>
            <div className="market-modal-btns">
              <button className="market-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="market-modal-send" onClick={() => setShowNew(false)}>Publier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
