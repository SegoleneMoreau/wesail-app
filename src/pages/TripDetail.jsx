import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './TripDetail.css'

const CAT_COLORS = { traversee: '#4a8fd4', journee: '#f59e0b', weekend: '#22c55e', croisiere: '#06b6d4', regate: '#6366f1', equipier: '#7c3aed', convoyage: '#854f0b' }
const CAT_LABELS = { traversee: 'Traversée', journee: 'Sortie journée', weekend: 'Week-end', croisiere: 'Croisière', regate: 'Régate', equipier: 'Équipier cherche trajet', convoyage: 'Mission convoyage' }
const NIV_LABELS = ['', 'Débutant', 'Initié', 'Expérimenté', 'Skipper']

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [resaStatus, setResaStatus] = useState(null) // null | 'pending' | 'accepted'
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadTrip() {
      setLoading(true)
      // Essayer d'abord avec l'UUID (vrai trajet Supabase)
      const { data, error } = await supabase
        .from('trips')
        .select('*, users:skipper_id(id, prenom, nom, niveau, bio, photo_url)')
        .eq('id', id)
        .single()

      if (data) {
        setTrip(data)
      } else {
        // Fallback sur données mock si l'id est numérique
        setTrip(null)
      }
      setLoading(false)
    }
    loadTrip()
  }, [id])

  async function handleReserver() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }

    // Créer une réservation
    const { error } = await supabase.from('bookings').insert({
      trip_id: id,
      equip_id: user.id,
      statut: 'en_attente',
      montant: trip.prix_par_personne
    })

    if (error) {
      if (error.code === '23505') {
        alert('Vous avez déjà une demande pour ce trajet.')
      } else {
        alert('Erreur : ' + error.message)
      }
      return
    }
    setResaStatus('pending')
    setShowContact(false)
  }

  if (loading) return (
    <div className="td-loading">
      <div className="td-loading-spinner">⟳</div>
      <p>Chargement du trajet...</p>
    </div>
  )

  if (!trip) return (
    <div className="td-notfound">
      <div style={{ fontSize: 48 }}>⚓</div>
      <h2>Trajet introuvable</h2>
      <button className="td-back-btn" onClick={() => navigate('/search')}>← Retour à la recherche</button>
    </div>
  )

  const skipper = trip.users
  const skipperAv = skipper ? `${skipper.prenom[0]}${skipper.nom[0]}` : 'SK'
  const skipperNom = skipper ? `${skipper.prenom} ${skipper.nom}` : 'Skipper'
  const dateAff = trip.date_depart
    ? new Date(trip.date_depart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const dateFin = trip.date_fin
    ? new Date(trip.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="td-page">
      <div className="td-header">
        <button className="td-back" onClick={() => navigate('/search')}>← Retour</button>
        <span className="td-header-title">Détail du trajet</span>
      </div>

      <div className="td-content">
        {/* Titre et badges */}
        <div className="td-hero">
          <h1 className="td-titre">{trip.titre}</h1>
          <div className="td-badges">
            {trip.categorie && (
              <span className="td-badge" style={{ background: (CAT_COLORS[trip.categorie] || '#6b7e94') + '22', color: CAT_COLORS[trip.categorie] || '#6b7e94' }}>
                {CAT_LABELS[trip.categorie] || trip.categorie}
              </span>
            )}
            {trip.only_women && <span className="td-badge ow">Only Women 🚺</span>}
            {trip.niveau_requis && <span className="td-badge niv">{NIV_LABELS[trip.niveau_requis]}</span>}
          </div>
        </div>

        {/* Itinéraire */}
        <div className="td-section">
          <div className="td-section-title">Itinéraire</div>
          <div className="td-route">
            <div className="td-port">
              <div className="td-port-dot dep"></div>
              <div>
                <div className="td-port-label">Départ</div>
                <div className="td-port-name">{trip.depart}</div>
                <div className="td-port-date">{dateAff}</div>
              </div>
            </div>
            <div className="td-route-line"></div>
            <div className="td-port">
              <div className="td-port-dot arr"></div>
              <div>
                <div className="td-port-label">Arrivée</div>
                <div className="td-port-name">{trip.arrivee}</div>
                {dateFin && <div className="td-port-date">{dateFin}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Infos pratiques */}
        <div className="td-section">
          <div className="td-section-title">Infos pratiques</div>
          <div className="td-info-grid">
            <div className="td-info-item">
              <span className="td-info-icon">👥</span>
              <div>
                <div className="td-info-label">Places disponibles</div>
                <div className="td-info-val">{trip.places_dispo} / {trip.places_total}</div>
              </div>
            </div>
            <div className="td-info-item">
              <span className="td-info-icon">💶</span>
              <div>
                <div className="td-info-label">Prix par personne</div>
                <div className="td-info-val">{trip.prix_par_personne === 0 ? 'Gratuit' : `${trip.prix_par_personne} €`}</div>
              </div>
            </div>
            <div className="td-info-item">
              <span className="td-info-icon">⚓</span>
              <div>
                <div className="td-info-label">Niveau requis</div>
                <div className="td-info-val">{NIV_LABELS[trip.niveau_requis] || 'Tous niveaux'}</div>
              </div>
            </div>
            <div className="td-info-item">
              <span className="td-info-icon">📋</span>
              <div>
                <div className="td-info-label">Statut</div>
                <div className="td-info-val">{trip.statut === 'actif' ? '🟢 Actif' : trip.statut}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="td-section">
            <div className="td-section-title">Description</div>
            <p className="td-desc">{trip.description}</p>
          </div>
        )}

        {/* Skipper */}
        <div className="td-section">
          <div className="td-section-title">Le skipper</div>
          <div className="td-skipper">
            <div className="td-sk-av">{skipperAv}</div>
            <div className="td-sk-info">
              <div className="td-sk-nom">{skipperNom}</div>
              <div className="td-sk-niveau">{NIV_LABELS[skipper?.niveau] || 'Navigateur'}</div>
              {skipper?.bio && <div className="td-sk-bio">{skipper.bio}</div>}
            </div>
          </div>
        </div>

        {/* Statut réservation */}
        {resaStatus === 'pending' && (
          <div className="td-resa-banner pending">
            ⏳ Votre demande a été envoyée — en attente de confirmation du skipper
          </div>
        )}

        {/* Boutons action */}
        <div className="td-actions">
          {resaStatus === null && trip.places_dispo > 0 && (
            <button className="td-btn-primary" onClick={() => setShowContact(true)}>
              ⛵ Demander à rejoindre
            </button>
          )}
          {trip.places_dispo === 0 && (
            <div className="td-complet">Complet — plus de places disponibles</div>
          )}
          <button className="td-btn-sec" onClick={() => navigate('/messages')}>
            💬 Contacter le skipper
          </button>
        </div>
      </div>

      {/* Modal confirmation réservation */}
      {showContact && (
        <div className="td-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-title">Demande de réservation</div>
            <div className="td-modal-trip">
              <div className="td-modal-route">{trip.titre}</div>
              <div className="td-modal-prix">{trip.prix_par_personne === 0 ? 'Gratuit' : `${trip.prix_par_personne} € / pers.`}</div>
            </div>
            <div className="td-modal-field">
              <label>Message au skipper (optionnel)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Présentez-vous brièvement, votre niveau, vos motivations..."
                rows={4}
              />
            </div>
            <p className="td-modal-note">Vous ne serez débité qu'après acceptation du skipper.</p>
            <div className="td-modal-btns">
              <button className="td-modal-cancel" onClick={() => setShowContact(false)}>Annuler</button>
              <button className="td-modal-confirm" onClick={handleReserver}>Envoyer la demande</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}