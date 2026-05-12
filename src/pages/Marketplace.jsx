import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

function formatPrix(p) {
  return p >= 1000 ? (p/1000).toFixed(0)+'k €' : p+' €'
}

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [newForm, setNewForm] = useState({ titre:'', cat:'electronique', prix:'', ville:'', desc:'', nego: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    loadListings()
  }, [])

  async function loadListings() {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*, vendeur:vendeur_id(prenom, nom)')
      .eq('statut', 'actif')
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  async function publishListing() {
    if (!newForm.titre || !newForm.prix || !userId) return
    setSaving(true)
    const { data } = await supabase.from('listings').insert({
      vendeur_id: userId,
      titre: newForm.titre,
      categorie: newForm.cat,
      prix: parseFloat(newForm.prix),
      negociable: newForm.nego,
      ville: newForm.ville || null,
      description: newForm.desc || null,
      statut: 'actif',
    }).select('*, vendeur:vendeur_id(prenom, nom)').single()
    if (data) setListings(ls => [data, ...ls])
    setNewForm({ titre:'', cat:'electronique', prix:'', ville:'', desc:'', nego: false })
    setSaving(false)
    setShowNew(false)
  }

  async function deleteListing(id) {
    await supabase.from('listings').update({ statut: 'archive' }).eq('id', id)
    setListings(ls => ls.filter(l => l.id !== id))
    setDeleteId(null)
  }

  const filtered = listings.filter(l => {
    const matchCat = activeCat === 'all' || l.categorie === activeCat
    const matchSearch = !search || l.titre?.toLowerCase().includes(search.toLowerCase()) || l.ville?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="market-page">
      <div className="market-topbar">
        <span className="market-topbar-title">Marketplace</span>
        <button className="market-new-btn" onClick={() => setShowNew(true)}>+ Vendre</button>
      </div>

      <div className="market-content">
        <div className="market-search-wrap">
          <input className="market-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher du matériel..." />
        </div>

        <div className="market-cats">
          {CATEGORIES.map(c => (
            <button key={c.id} className={`market-cat ${activeCat===c.id?'active':''}`} onClick={() => setActiveCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {loading && <div className="market-empty">Chargement...</div>}

        <div className="market-grid">
          {filtered.map(l => {
            const isMine = l.vendeur_id === userId
            const vendeurNom = l.vendeur ? `${l.vendeur.prenom} ${l.vendeur.nom}` : 'Vendeur'
            const dateAff = new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            return (
              <div key={l.id} className="market-card">
                <div className="market-card-img">
                  <span>{CATEGORIES.find(c=>c.id===l.categorie)?.icon||'📦'}</span>
                </div>
                <div className="market-card-body">
                  <div className="market-card-header">
                    <div className="market-card-titre">{l.titre}</div>
                    {isMine && (
                      <button className="market-delete-btn" onClick={() => setDeleteId(l.id)} title="Supprimer">🗑</button>
                    )}
                  </div>
                  <div className="market-card-vendeur">
                    {isMine ? <span className="market-moi-badge">Mon annonce</span> : vendeurNom}
                  </div>
                  {l.description && <div className="market-card-desc">{l.description}</div>}
                  <div className="market-card-footer">
                    <div className="market-card-prix">
                      {l.prix ? formatPrix(l.prix) : 'Prix sur demande'}
                      {l.negociable && <span className="market-nego">Négociable</span>}
                    </div>
                    <div className="market-card-meta">{l.ville || '—'} · {dateAff}</div>
                  </div>
                  {!isMine && <button className="market-contact-btn">Contacter</button>}
                </div>
              </div>
            )
          })}
        </div>

        {!loading && filtered.length === 0 && <div className="market-empty">Aucune annonce trouvée.</div>}
      </div>

      {/* Modal suppression */}
      {deleteId && (
        <div className="market-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="market-modal" onClick={e => e.stopPropagation()}>
            <div className="market-modal-title">Supprimer l'annonce ?</div>
            <p style={{fontSize:14,color:'#6b7e94',margin:'0 0 16px'}}>Cette action est irréversible.</p>
            <div className="market-modal-btns">
              <button className="market-modal-cancel" onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="market-modal-send" style={{background:'#ef4444'}} onClick={() => deleteListing(deleteId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vendre */}
      {showNew && (
        <div className="market-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="market-modal" onClick={e => e.stopPropagation()}>
            <div className="market-modal-title">Déposer une annonce</div>
            <div className="market-modal-field">
              <label>Titre *</label>
              <input value={newForm.titre} onChange={e=>setNewForm(f=>({...f,titre:e.target.value}))} placeholder="ex: GPS Garmin GPSMAP..." />
            </div>
            <div className="market-modal-field">
              <label>Catégorie</label>
              <select value={newForm.cat} onChange={e=>setNewForm(f=>({...f,cat:e.target.value}))}>
                {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="market-modal-field">
              <label>Prix (€) *</label>
              <input type="number" value={newForm.prix} onChange={e=>setNewForm(f=>({...f,prix:e.target.value}))} placeholder="ex: 450" />
            </div>
            <div className="market-modal-field">
              <label>Ville</label>
              <input value={newForm.ville} onChange={e=>setNewForm(f=>({...f,ville:e.target.value}))} placeholder="ex: Marseille" />
            </div>
            <div className="market-modal-field">
              <label>Description</label>
              <textarea value={newForm.desc} onChange={e=>setNewForm(f=>({...f,desc:e.target.value}))} rows={3} placeholder="Décrivez votre article..." />
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}>
              <input type="checkbox" checked={newForm.nego} onChange={e=>setNewForm(f=>({...f,nego:e.target.checked}))} />
              Prix négociable
            </label>
            <div className="market-modal-btns">
              <button className="market-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="market-modal-send" disabled={!newForm.titre||!newForm.prix||saving} onClick={publishListing}>
                {saving ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}