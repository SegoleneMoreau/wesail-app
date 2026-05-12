import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './MyTrips.css'

const TABS = [
  { id: 'avenir', label: 'À venir' },
  { id: 'passes', label: 'Passés' },
  { id: 'attente', label: 'En attente' },
  { id: 'annonces', label: 'Mes annonces' },
]

export default function MyTrips() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('avenir')
  const [trips, setTrips] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadData(user.id)
    })
  }, [])

  async function loadData(uid) {
    setLoading(true)
    const { data: myTrips } = await supabase
      .from('trips')
      .select('*')
      .eq('skipper_id', uid)
      .order('date_depart', { ascending: true })

    const { data: myBookings } = await supabase
      .from('bookings')
      .select('*, trips:trip_id(*, users:skipper_id(prenom, nom))')
      .eq('equip_id', uid)
      .order('created_at', { ascending: false })

    setTrips(myTrips || [])
    setBookings(myBookings || [])
    setLoading(false)
  }

  async function deleteTrip(id) {
    if (!window.confirm('Supprimer cette annonce ?')) return
    await supabase.from('trips').delete().eq('id', id)
    setTrips(ts => ts.filter(t => t.id !== id))
  }

  const now = new Date()

  const getItems = () => {
    if (tab === 'annonces') return trips.map(t => ({ ...t, _type: 'annonce' }))
    if (tab === 'avenir') return [
      ...trips.filter(t => new Date(t.date_depart) >= now).map(t => ({ ...t, _type: 'skipper' })),
      ...bookings.filter(b => ['accepte', 'paye'].includes(b.statut) && b.trips && new Date(b.trips.date_depart) >= now).map(b => ({ ...b, _type: 'equipier' }))
    ]
    if (tab === 'passes') return [
      ...trips.filter(t => new Date(t.date_depart) < now).map(t => ({ ...t, _type: 'skipper' })),
      ...bookings.filter(b => b.trips && new Date(b.trips.date_depart) < now).map(b => ({ ...b, _type: 'equipier' }))
    ]
    if (tab === 'attente') return bookings.filter(b => b.statut === 'en_attente').map(b => ({ ...b, _type: 'attente' }))
    return []
  }

  const items = getItems()

  const counts = {
    avenir: [
      ...trips.filter(t => new Date(t.date_depart) >= now),
      ...bookings.filter(b => ['accepte', 'paye'].includes(b.statut) && b.trips && new Date(b.trips.date_depart) >= now)
    ].length,
    passes: [
      ...trips.filter(t => new Date(t.date_depart) < now),
      ...bookings.filter(b => b.trips && new Date(b.trips.date_depart) < now)
    ].length,
    attente: bookings.filter(b => b.statut === 'en_attente').length,
    annonces: trips.length,
  }

  function renderItem(item) {
    const isEq = item._type === 'equipier' || item._type === 'attente'
    const trip = isEq ? item.trips : item
    if (!trip) return null
    const dateAff = trip.date_depart
      ? new Date(trip.date_depart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'
    const isAnnonce = item._type === 'annonce'
    const isPasse = tab === 'passes'

    return (
      <div key={item.id} className="mytrips-card">
        <div className="mytrips-card-header">
          <div className="mytrips-card-role">{isEq ? '👤 Équipier' : '⚓ Skipper'}</div>
          <div className={`mytrips-card-statut ${isAnnonce ? 'actif' : isPasse ? 'ok' : item._type === 'attente' ? 'att' : 'soon'}`}>
            {isAnnonce ? '📢 Actif' : isPasse ? '✓ Terminé' : item._type === 'attente' ? '⏳ En attente' : '🟢 À venir'}
          </div>
        </div>
        <div className="mytrips-card-route">{trip.titre || `${trip.depart} → ${trip.arrivee}`}</div>
        <div className="mytrips-card-meta">
          <span>📅 {dateAff}</span>
          <span>👥 {isEq ? '1 place' : `${trip.places_dispo}/${trip.places_total} places`}</span>
          {trip.prix_par_personne > 0 && <span>💶 {trip.prix_par_personne} €/pers.</span>}
        </div>
        {isEq && item.trips?.users && (
          <div className="mytrips-card-bateau">⚓ Skipper : {item.trips.users.prenom} {item.trips.users.nom}</div>
        )}
        {isPasse && !isEq && (
          <div className="mytrips-avis-cta">
            ⭐ Donnez un avis à vos équipiers
            <button className="mytrips-avis-btn" onClick={() => navigate('/avis')}>Laisser un avis</button>
          </div>
        )}
        <div className="mytrips-card-actions">
          <button className="mytrips-btn-sec" onClick={() => navigate(`/trip/${trip.id}`)}>Voir le trajet</button>
          <button className="mytrips-btn-sec" onClick={() => navigate('/messages')}>Messages</button>
          {isAnnonce && (
            <button className="mytrips-btn-sec danger" onClick={() => deleteTrip(item.id)}>Supprimer</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mytrips-page">
      <div className="mytrips-topbar">
        <span className="mytrips-topbar-title">Mes trajets</span>
        <button className="mytrips-new-btn" onClick={() => navigate('/annonce')}>+ Nouveau</button>
      </div>
      <div className="mytrips-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`mytrips-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}<span className="mytrips-tab-cnt">{counts[t.id]}</span>
          </button>
        ))}
      </div>
      <div className="mytrips-content">
        {loading && <div className="mytrips-empty"><div className="mytrips-empty-icon">⟳</div><p>Chargement...</p></div>}
        {!loading && items.length === 0 && (
          <div className="mytrips-empty">
            <div className="mytrips-empty-icon">⛵</div>
            <p>Aucun trajet dans cette catégorie.</p>
            {tab === 'annonces' && <button className="mytrips-empty-btn" onClick={() => navigate('/annonce')}>Déposer une annonce</button>}
          </div>
        )}
        {!loading && items.map(item => renderItem(item))}
      </div>
    </div>
  )
}