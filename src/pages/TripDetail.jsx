import { useParams } from "react-router-dom"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TripDetail.css'

const MOCK_TRIPS = [
  {id:1,titre:'Marseille → Porto-Vecchio',depart:'Marseille',arrivee:'Porto-Vecchio',date_depart:'2026-06-14',date_fin:'2026-06-16',prix_par_personne:159,places_dispo:2,places_total:4,niveau_requis:2,categorie:'traversee',description:'Belle traversée Marseille-Corse en 2 jours. Départ vendredi soir, arrivée dimanche matin. Voilier confortable de 12m avec 2 cabines. Expérience de navigation souhaitée.',only_women:false,skipper:{id:1,prenom:'Thomas',nom:'Leroy',note:4.9,avis:47,niveau:4,bio:'Skipper professionnel, 15 ans de navigation. Spécialiste Méditerranée et Atlantique.',bateau:'Jeanneau Sun Odyssey 440',photo:'TL'},etapes:['Marseille Vieux-Port','Bonifacio','Porto-Vecchio']},
  {id:2,titre:'Brest → Saint-Malo',depart:'Brest',arrivee:'Saint-Malo',date_depart:'2026-06-20',date_fin:'2026-06-22',prix_par_personne:89,places_dispo:3,places_total:4,niveau_requis:1,categorie:'traversee',description:'Tour de Bretagne en voilier. Départ de Brest, escale à Douarnenez, arrivée Saint-Malo. Idéal pour débutants.',only_women:false,skipper:{id:2,prenom:'Claire',nom:'Dubois',note:4.7,avis:23,niveau:3,bio:'Passionnée de voile depuis 20 ans.',bateau:'Bénéteau Oceanis 35',photo:'CD'},etapes:['Brest','Douarnenez','Saint-Malo']},
  {id:3,titre:'Nice → Ajaccio',depart:'Nice',arrivee:'Ajaccio',date_depart:'2026-07-02',date_fin:'2026-07-04',prix_par_personne:120,places_dispo:1,places_total:3,niveau_requis:2,categorie:'traversee',description:'Traversée Nice-Corse en 2 jours. Navigation de nuit prévue.',only_women:false,skipper:{id:3,prenom:'Pierre',nom:'Bernard',note:4.8,avis:31,niveau:4,bio:'Skipper expérimenté, nombreuses traversées Méditerranée.',bateau:'Dufour 460 GL',photo:'PB'},etapes:['Nice','Ajaccio']},
  {id:4,titre:'La Rochelle → Île de Ré',depart:'La Rochelle',arrivee:'Île de Ré',date_depart:'2026-06-28',date_fin:'2026-06-28',prix_par_personne:65,places_dispo:4,places_total:6,niveau_requis:1,categorie:'journee',description:"Journée en mer autour de l'île de Ré. Parfait pour débutants.",only_women:false,skipper:{id:4,prenom:'Marie',nom:'Moreau',note:5.0,avis:18,niveau:3,bio:'Monitrice voile, spécialiste sorties découverte.',bateau:'Jeanneau Cap Camarat 9.0 WA',photo:'MM'},etapes:['La Rochelle',"Tour de l'île de Ré",'La Rochelle']},
  {id:5,titre:'Toulon → Saint-Tropez',depart:'Toulon',arrivee:'Saint-Tropez',date_depart:'2026-07-10',date_fin:'2026-07-10',prix_par_personne:95,places_dispo:2,places_total:4,niveau_requis:1,categorie:'journee',description:"Journée côte d'Azur. Baignade et escale à Saint-Tropez.",only_women:false,skipper:{id:5,prenom:'Lucas',nom:'Simon',note:4.6,avis:12,niveau:3,bio:'Passionné de voile côtière méditerranéenne.',bateau:'Bénéteau Flyer 8.8',photo:'LS'},etapes:['Toulon','Porquerolles','Saint-Tropez']},
  {id:6,titre:'Lorient → Belle-Île',depart:'Lorient',arrivee:'Belle-Île',date_depart:'2026-07-15',date_fin:'2026-07-15',prix_par_personne:55,places_dispo:3,places_total:5,niveau_requis:1,categorie:'journee',description:'Journée découverte Belle-Île-en-Mer.',only_women:false,skipper:{id:6,prenom:'Sophie',nom:'Laurent',note:4.8,avis:29,niveau:3,bio:'Native du Morbihan, guide nautique locale.',bateau:'Jeanneau Sun Fast 3300',photo:'SL'},etapes:['Lorient','Belle-Île-en-Mer']},
  {id:7,titre:'Bordeaux → Arcachon',depart:'Bordeaux',arrivee:'Arcachon',date_depart:'2026-08-01',date_fin:'2026-08-03',prix_par_personne:75,places_dispo:2,places_total:4,niveau_requis:2,categorie:'weekend',description:"Weekend sur le bassin d'Arcachon.",only_women:false,skipper:{id:7,prenom:'Antoine',nom:'Petit',note:4.5,avis:8,niveau:3,bio:"Spécialiste navigation Gironde et Bassin d'Arcachon.",bateau:'Dufour 382 GL',photo:'AP'},etapes:['Bordeaux','Arcachon','Île aux Oiseaux']},
]

const niveauLabel = n => ['','Débutant','Initié','Expérimenté','Skipper'][n]||''
const categorieLabel = c => ({traversee:'Traversée',journee:'Journée',weekend:'Weekend',croisiere:'Croisière',regate:'Régate'})[c]||c

export default function TripDetail() {
  const { id } = useParams ? useParams() : {id:'1'}
  const navigate = useNavigate()
  const [showContact, setShowContact] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const trip = MOCK_TRIPS.find(t => t.id === parseInt(id))
  if(!trip) return <div className="td-notfound"><h2>Trajet introuvable</h2><button onClick={() => navigate(-1)}>Retour</button></div>

  function handleSendMessage() {
    if(!message.trim()) return
    setSent(true)
    setTimeout(() => { setShowContact(false); setSent(false); setMessage('') }, 2000)
  }

  return (
    <div className="td-page">
      <div className="td-header">
        <button className="td-back" onClick={() => navigate(-1)}>← Retour</button>
        <span className="td-header-title">{trip.titre}</span>
      </div>
      <div className="td-content">
        <div className="td-main">
          <div className="td-route"><span className="td-dep">{trip.depart}</span><span className="td-arrow">→</span><span className="td-arr">{trip.arrivee}</span></div>
          <div className="td-badges">
            <span className="td-badge">{categorieLabel(trip.categorie)}</span>
            <span className="td-badge">{niveauLabel(trip.niveau_requis)}</span>
            {trip.only_women && <span className="td-badge ow">Only Women</span>}
          </div>
          <div className="td-infos">
            <div className="td-info-item"><span>📅</span><div><div className="td-info-label">Départ</div><div className="td-info-val">{new Date(trip.date_depart).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>
            <div className="td-info-item"><span>🏁</span><div><div className="td-info-label">Arrivée</div><div className="td-info-val">{new Date(trip.date_fin).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>
            <div className="td-info-item"><span>👥</span><div><div className="td-info-label">Places disponibles</div><div className="td-info-val">{trip.places_dispo} / {trip.places_total}</div></div></div>
            <div className="td-info-item"><span>⚓</span><div><div className="td-info-label">Bateau</div><div className="td-info-val">{trip.skipper.bateau}</div></div></div>
          </div>
          <div className="td-section">
            <div className="td-section-title">Étapes</div>
            <div className="td-etapes">
              {trip.etapes.map((e,i) => (
                <div key={i} className="td-etape">
                  <div className={`td-etape-dot ${i===0?'start':i===trip.etapes.length-1?'end':''}`}></div>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="td-section">
            <div className="td-section-title">Description</div>
            <p className="td-desc">{trip.description}</p>
          </div>
        </div>
        <div className="td-sidebar">
          <div className="td-price-card">
            <div className="td-price">{trip.prix_par_personne} €<span>/personne</span></div>
            <div className="td-price-note">Commission WeSail incluse (6%)</div>
            <div className="td-price-net">Le skipper reçoit {(trip.prix_par_personne*0.94).toFixed(0)} €</div>
            <button className="td-contact-btn" onClick={() => setShowContact(true)}>Contacter le skipper</button>
            <div className="td-places-bar"><div className="td-places-fill" style={{width:`${((trip.places_total-trip.places_dispo)/trip.places_total)*100}%`}}></div></div>
            <div className="td-places-txt">{trip.places_dispo} place{trip.places_dispo>1?'s':''} restante{trip.places_dispo>1?'s':''}</div>
          </div>
          <div className="td-skipper-card">
            <div className="td-sk-title">Votre skipper</div>
            <div className="td-sk-info">
              <div className="td-sk-av">{trip.skipper.photo}</div>
              <div><div className="td-sk-name">{trip.skipper.prenom} {trip.skipper.nom}</div><div className="td-sk-meta">★ {trip.skipper.note} · {trip.skipper.avis} avis · {niveauLabel(trip.skipper.niveau)}</div></div>
            </div>
            <p className="td-sk-bio">{trip.skipper.bio}</p>
            <button className="td-profile-btn" onClick={() => navigate(`/profil/${trip.skipper.id}`)}>Voir le profil</button>
          </div>
        </div>
      </div>
      {showContact && (
        <div className="td-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-title">Contacter {trip.skipper.prenom}</div>
            {sent ? <div className="td-sent">✓ Message envoyé !</div> : (
              <>
                <textarea className="td-modal-input" placeholder={`Bonjour ${trip.skipper.prenom}...`} value={message} onChange={e => setMessage(e.target.value)} rows={4}/>
                <div className="td-modal-btns">
                  <button className="td-modal-cancel" onClick={() => setShowContact(false)}>Annuler</button>
                  <button className="td-modal-send" onClick={handleSendMessage}>Envoyer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
