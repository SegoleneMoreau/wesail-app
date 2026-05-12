import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CityInput from '../components/CityInput'
import './Search.css'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const ZONES = [
  { n: 'Méditerranée', s: '247 annonces', hot: true },
  { n: 'Atlantique', s: '183 annonces' },
  { n: 'Bretagne', s: '96 annonces' },
  { n: 'Corse', s: '74 annonces' },
  { n: 'Manche & Normandie', s: '58 annonces' },
  { n: 'Mer du Nord', s: '31 annonces' },
  { n: 'Antilles · Caraïbes', s: '42 annonces', hot: true },
  { n: 'Polynésie française', s: '19 annonces' },
]

const MOCK_TRIPS = [
  { id: 't1', cat: 'traversee', titre: 'Marseille → Porto-Vecchio', dep: 'Marseille — Vieux-Port', arr: 'Porto-Vecchio', ports: ['Marseille — Vieux-Port', 'Bonifacio', 'Porto-Vecchio'], date: '2026-06-14', dateAff: '14 juin 2026', duree: '3 jours', bateau: 'Jeanneau 40', skipper: 'Thomas L.', av: 'TL', avc: '#185fa5', rating: '4.9', nb: 47, prix: 159, places: '2 places libres', ok: true, ow: false, niv: 2 },
  { id: 't2', cat: 'weekend', titre: 'Marseille → Porquerolles', dep: 'Marseille — Vieux-Port', arr: 'Porquerolles', ports: ['Marseille — Vieux-Port', 'Porquerolles'], date: '2026-06-20', dateAff: '20–22 juin 2026', duree: '2 jours', bateau: 'Dufour 36', skipper: 'Lucie M.', av: 'LM', avc: '#993556', rating: '5.0', nb: 18, prix: 95, places: '3 places libres', ok: true, ow: true, niv: 1 },
  { id: 't3', cat: 'croisiere', titre: 'Marseille → Santorin', dep: 'Marseille — Vieux-Port', arr: 'Santorin', ports: ['Marseille — Vieux-Port', 'Rome — Civitavecchia', 'Athènes — Pirée', 'Santorin'], date: '2026-06-21', dateAff: '21 juin 2026', duree: '14 jours', bateau: 'Sun Odyssey 44', skipper: 'Anne-Marie D.', av: 'AD', avc: '#0f6e56', rating: '4.8', nb: 23, prix: 509, places: '1 place restante', ok: false, ow: false, niv: 3 },
  { id: 't4', cat: 'journee', titre: 'Marseille — Calanques', dep: 'Marseille — Vieux-Port', arr: 'Marseille — Vieux-Port', ports: ['Marseille — Vieux-Port'], date: '2026-06-08', dateAff: '8 juin 2026', duree: '1 journée', bateau: 'Bénéteau 35', skipper: 'Pierre B.', av: 'PB', avc: '#854f0b', rating: '4.7', nb: 61, prix: 48, places: '3 places libres', ok: true, ow: false, niv: 1 },
  { id: 't5', cat: 'traversee', titre: 'Marseille → Ibiza', dep: 'Marseille — Vieux-Port', arr: 'Ibiza', ports: ['Marseille — Vieux-Port', 'Ibiza'], date: '2026-07-01', dateAff: '1 juil. 2026', duree: '4 jours', bateau: 'Oceanis 46', skipper: 'Jean-Christophe R.', av: 'JC', avc: '#534ab7', rating: '4.6', nb: 35, prix: 233, places: '2 places restantes', ok: false, ow: false, niv: 2 },
  { id: 't6', cat: 'regate', titre: 'Régate Spi Ouest-France — La Trinité', dep: 'La Trinité-sur-Mer', arr: 'La Trinité-sur-Mer', ports: ['La Trinité-sur-Mer'], date: '2026-07-15', dateAff: '15 juil. 2026', duree: '3 jours', bateau: 'First 40', skipper: 'Sophie D.', av: 'SD', avc: '#7c3aed', rating: '4.9', nb: 12, prix: 127, places: '2 places libres', ok: true, ow: false, niv: 3 },
  { id: 't7', cat: 'traversee', titre: 'Brest → Saint-Malo', dep: 'Brest', arr: 'Saint-Malo', ports: ['Brest', 'Douarnenez', 'Saint-Malo'], date: '2026-06-20', dateAff: '20 juin 2026', duree: '2 jours', bateau: 'Bénéteau Oceanis 35', skipper: 'Claire D.', av: 'CD', avc: '#7c3aed', rating: '4.7', nb: 23, prix: 89, places: '3 places libres', ok: true, ow: false, niv: 1 },
]

const MOCK_VOYAGEURS = [
  { id: 'v1', cat: 'traversee', titre: 'Cherche une traversée en Méditerranée — Juin/Juillet', zone: 'Méditerranée', dep: 'Marseille', date: '2026-06-01', dateAff: 'Juin – Juillet 2026', duree: '1–2 semaines', niv: '2 · Initié', niv_n: 2, nom: 'Sophie B.', av: 'SB', avc: '#185fa5', rating: '4.8', nb: 12, ow: false, desc: 'Passionnée de voile, je cherche une traversée cet été. Expérience sur Bénéteau 35, habituée des manœuvres.' },
  { id: 'v2', cat: 'croisiere', titre: 'Cherche une croisière Grèce ou Croatie — Août', zone: 'Grèce & Égée', dep: 'Athènes', date: '2026-08-01', dateAff: 'Août 2026', duree: '2 semaines', niv: '3 · Expérimenté', niv_n: 3, nom: 'Marc L.', av: 'ML', avc: '#0f6e56', rating: '4.9', nb: 28, ow: false, desc: '5000 milles au compteur. Cherche croisière Grèce ou Croatie. Quarts de nuit, mécanique de base.' },
  { id: 'v3', cat: 'weekend', titre: 'Cherche un week-end voile Côte d\'Azur — Only Women', zone: 'Côte d\'Azur', dep: 'Nice', date: '2026-07-01', dateAff: 'Juillet 2026', duree: 'Week-end', niv: '1 · Débutante', niv_n: 1, nom: 'Claire D.', av: 'CD', avc: '#993556', rating: null, nb: 0, ow: true, desc: 'Débutante motivée, cherche week-end voile entre femmes sur la Côte d\'Azur.' },
  { id: 'v4', cat: 'traversee', titre: 'Cherche une traversée Atlantique — Automne', zone: 'Atlantique', dep: 'La Rochelle', date: '2026-10-01', dateAff: 'Octobre 2026', duree: '3–4 semaines', niv: '3 · Expérimenté', niv_n: 3, nom: 'Julien R.', av: 'JR', avc: '#534ab7', rating: '4.7', nb: 8, ow: false, desc: 'Cherche traversée Atlantique automne 2026. Expérience hauturière, transatlantique déjà effectué.' },
]

const MOCK_CONVOYEURS = [
  { id: 'c1', titre: 'Convoyage La Rochelle → Marseille', dep: 'La Rochelle — Port des Minimes', arr: 'Marseille — Vieux-Port', date: '2026-07-01', dateAff: 'Juil. 2026', bateau: 'Oceanis 45 — 14m', proprio: 'Jean-Pierre M.', av: 'JP', avc: '#854f0b', budgetMin: 800, budgetMax: 1200, proOnly: true, comp: ['Navigation hauturière', 'Météo marine', 'Mécanique diesel'] },
  { id: 'c2', titre: 'Convoyage Marseille → Fort-de-France', dep: 'Marseille — Vieux-Port', arr: 'Fort-de-France — Martinique', date: '2026-09-01', dateAff: 'Sept. 2026', bateau: 'Jeanneau 54 — 16m', proprio: 'Isabelle T.', av: 'IT', avc: '#0f6e56', budgetMin: 3500, budgetMax: 5000, proOnly: true, comp: ['Navigation hauturière', 'Navigation de nuit', 'Radio VHF / SRC'] },
  { id: 'c3', titre: 'Convoyage Nice → Dubrovnik', dep: 'Nice', arr: 'Dubrovnik', date: '2026-06-15', dateAff: 'Juin 2026', bateau: 'Bénéteau 40 — 12m', proprio: 'Robert K.', av: 'RK', avc: '#534ab7', budgetMin: 600, budgetMax: 900, proOnly: false, comp: ['Manœuvres en port', 'Météo marine'] },
]

const CAT_COLORS = { traversee: '#4a8fd4', journee: '#f59e0b', weekend: '#22c55e', croisiere: '#06b6d4', regate: '#6366f1' }
const CAT_LABELS = { traversee: 'Traversée', journee: 'Sortie journée', weekend: 'Week-end', croisiere: 'Croisière', regate: 'Régate' }
const NIV_LABELS = ['', 'Débutant', 'Initié', 'Expérimenté', 'Skipper']

function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') }

export default function Search() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('t')
  const [filter, setFilter] = useState('all')
  const [dep, setDep] = useState('')
  const [arr, setArr] = useState('')
  const [date, setDate] = useState('')
  const [searched, setSearched] = useState(false)
  const [realTrips, setRealTrips] = useState([])

  useEffect(() => {
    supabase.from('trips')
      .select('*, users:skipper_id(prenom, nom)')
      .eq('statut', 'actif')
      .order('date_depart', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const formatted = data.map(t => ({
            id: 't' + t.id,
            cat: t.categorie || 'traversee',
            titre: t.titre,
            dep: t.depart,
            arr: t.arrivee,
            ports: [t.depart, t.arrivee],
            date: t.date_depart?.slice(0, 10),
            dateAff: t.date_depart ? new Date(t.date_depart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
            duree: '—',
            bateau: '—',
            skipper: t.users ? `${t.users.prenom} ${t.users.nom[0]}.` : 'Skipper',
            av: t.users ? `${t.users.prenom[0]}${t.users.nom[0]}` : 'SK',
            avc: '#185fa5',
            rating: null,
            nb: 0,
            prix: t.prix_par_personne,
            places: `${t.places_dispo} place${t.places_dispo > 1 ? 's' : ''} libre${t.places_dispo > 1 ? 's' : ''}`,
            ok: t.places_dispo > 0,
            ow: t.only_women,
            niv: t.niveau_requis,
          }))
          setRealTrips(formatted)
        }
      })
  }, [])

  function doSearch() { setSearched(true) }
  function clearSearch() { setDep(''); setArr(''); setDate(''); setSearched(false); setFilter('all') }

  function getFiltered() {
    const trips = realTrips.length > 0 ? realTrips : MOCK_TRIPS
let src = tab === 't' ? trips : tab === 'v' ? MOCK_VOYAGEURS : MOCK_CONVOYEURS
    return src.filter(a => {
      if (filter === 'places' && !a.ok) return false
      if (filter === 'ow' && !a.ow) return false
      if (filter === 'pro' && !a.proOnly) return false
      if (filter === 'ouvert' && a.proOnly) return false
      if (['traversee', 'journee', 'weekend', 'croisiere', 'regate'].includes(filter) && a.cat !== filter) return false
      if (dep) {
        const qd = norm(dep)
        const match = norm(a.dep).includes(qd) || norm(a.arr || '').includes(qd) ||
          (a.ports && a.ports.some(p => norm(p).includes(qd))) || norm(a.zone || '').includes(qd)
        if (!match) return false
      }
      if (arr) {
        const qa = norm(arr)
        const match = norm(a.arr || '').includes(qa) ||
          (a.ports && a.ports.some(p => norm(p).includes(qa))) || norm(a.zone || '').includes(qa)
        if (!match) return false
      }
      if (date && a.date && a.date < date) return false
      return true
    })
  }

  const filtered = getFiltered()
  const showZones = !searched && !dep && !arr && !date
  const PILLS_T = [
    { id: 'traversee', label: 'Traversée', dot: '#4a8fd4' },
    { id: 'journee', label: 'Sortie journée', dot: '#f59e0b' },
    { id: 'weekend', label: 'Week-end', dot: '#22c55e' },
    { id: 'croisiere', label: 'Croisière', dot: '#06b6d4' },
    { id: 'regate', label: 'Régate', dot: '#6366f1' },
    { id: 'sep' },
    { id: 'places', label: 'Places libres' },
    { id: 'ow', label: 'Only Women', ow: true },
  ]
  const PILLS_V = [
    { id: 'traversee', label: 'Traversée', dot: '#4a8fd4' },
    { id: 'weekend', label: 'Week-end', dot: '#22c55e' },
    { id: 'croisiere', label: 'Croisière', dot: '#06b6d4' },
    { id: 'ow', label: 'Only Women', ow: true },
  ]
  const PILLS_C = [
    { id: 'pro', label: 'Skipper pro requis' },
    { id: 'ouvert', label: 'Ouvert à tous' },
  ]
  const pills = tab === 't' ? PILLS_T : tab === 'v' ? PILLS_V : PILLS_C

  return (
    <div className="search-page">
      <div className="search-topbar">
        <span className="search-topbar-title">Trouver un trajet / bateau</span>
      </div>

      {/* Barre de recherche avec autocomplétion */}
      <div className="search-bar">
        <CityInput value={dep} onChange={setDep} placeholder="Port de départ..." className="dark" showPortsFirst />
        <span className="sb-sep">→</span>
        <CityInput value={arr} onChange={setArr} placeholder="Destination..." className="dark" showPortsFirst />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="sb-date" />
        <button onClick={doSearch} className="sb-btn">🔍 Rechercher</button>
      </div>

      {/* Onglets */}
      <div className="search-tabs">
        <button className={`search-tab ${tab === 't' ? 'active' : ''}`} onClick={() => { setTab('t'); setFilter('all') }}>
          ⛵ Trajets disponibles <span className="tab-cnt">{MOCK_TRIPS.length}</span>
        </button>
        <button className={`search-tab ${tab === 'v' ? 'active' : ''}`} onClick={() => { setTab('v'); setFilter('all') }}>
          👤 Voyageurs <span className="tab-cnt">{MOCK_VOYAGEURS.length}</span>
        </button>
        <button className={`search-tab ${tab === 'c' ? 'active' : ''}`} onClick={() => { setTab('c'); setFilter('all') }}>
          🚢 Bateaux à convoyer <span className="tab-cnt">{MOCK_CONVOYEURS.length}</span>
        </button>
      </div>

      {/* Pills */}
      <div className="search-pills">
        <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous</button>
        {pills.map(p => {
          if (p.id === 'sep') return <div key="sep" className="pill-sep"></div>
          return (
            <button key={p.id} className={`pill ${filter === p.id ? 'active' : ''} ${p.ow ? 'ow' : ''}`} onClick={() => setFilter(p.id)}>
              {p.dot && <span className="pill-dot" style={{ background: p.dot }}></span>}
              {p.label}
            </button>
          )
        })}
        <div className="search-count">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</div>
      </div>

      {/* Contenu */}
      <div className="search-content">
        {showZones && (
          <div className="zones-section">
            <div className="zones-title">Zones populaires</div>
            <div className="zones-grid">
              {ZONES.map(z => (
                <div key={z.n} className="zone-card" onClick={() => { setDep(z.n); setSearched(true) }}>
                  <div className="zone-icon">⛵</div>
                  <div>
                    <div className="zone-name">{z.n} {z.hot && <span className="zone-hot">🔥</span>}</div>
                    <div className="zone-sub">{z.s}</div>
                  </div>
                  <span className="zone-arr">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(searched || dep || arr || date || filter !== 'all') && (
          <>
            {filtered.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div>Aucune annonce ne correspond</div>
                <div className="no-results-sub">Essayez d'autres critères ou élargissez la zone</div>
                <button className="no-results-btn" onClick={clearSearch}>Effacer les filtres</button>
              </div>
            ) : (
              <div className="results-grid">
                {tab === 't' && filtered.map(t => (
                  <div key={t.id} className="trip-card" onClick={() => navigate(`/trip/${t.id.replace('t', '')}`)}>
                    <div className="trip-card-head">
                      <div className="trip-card-title">{t.titre}</div>
                      <div className="trip-card-price">{t.prix} €<span>/pers.</span></div>
                    </div>
                    <div className="trip-card-badges">
                      <span className="trip-badge" style={{ background: CAT_COLORS[t.cat] + '22', color: CAT_COLORS[t.cat] }}>{CAT_LABELS[t.cat]}</span>
                      {t.ow && <span className="trip-badge ow">Only Women</span>}
                      <span className="trip-badge niv">{NIV_LABELS[t.niv]}</span>
                    </div>
                    <div className="trip-card-ports">
                      {t.ports.map((p, i) => (
                        <span key={i}><span className="port-tag">{p}</span>{i < t.ports.length - 1 && <span className="port-arr"> → </span>}</span>
                      ))}
                    </div>
                    <div className="trip-card-meta">
                      <span>📅 {t.dateAff}</span>
                      <span>⏱ {t.duree}</span>
                      <span className={t.ok ? 'places-ok' : 'places-ko'}>👥 {t.places}</span>
                    </div>
                    <div className="trip-card-footer">
                      <div className="trip-skipper">
                        <div className="trip-av" style={{ background: t.avc }}>{t.av}</div>
                        <span>{t.skipper}</span>
                        {t.rating && <span className="trip-rating">★ {t.rating} ({t.nb})</span>}
                      </div>
                      <span className="trip-bateau">⛵ {t.bateau}</span>
                    </div>
                  </div>
                ))}

                {tab === 'v' && filtered.map(v => (
                  <div key={v.id} className="voyageur-card">
                    <div className="voy-card-head">
                      <div className="voy-av" style={{ background: v.avc }}>{v.av}</div>
                      <div><div className="voy-nom">{v.nom}</div><div className="voy-niv">{v.niv}</div></div>
                      {v.rating && <div className="voy-rating">★ {v.rating} · {v.nb} avis</div>}
                      {v.ow && <span className="trip-badge ow">Only Women</span>}
                    </div>
                    <div className="voy-titre">{v.titre}</div>
                    <div className="voy-desc">{v.desc}</div>
                    <div className="voy-meta">
                      <span>📅 {v.dateAff}</span>
                      <span>⏱ {v.duree}</span>
                      {v.zone && <span>📍 {v.zone}</span>}
                    </div>
                    <button className="voy-contact-btn" onClick={() => navigate('/messages')}>Contacter</button>
                  </div>
                ))}

                {tab === 'c' && filtered.map(c => (
                  <div key={c.id} className="conv-card">
                    <div className="conv-card-head">
                      <div className="conv-titre">{c.titre}</div>
                      <div className="conv-budget">{c.budgetMin}–{c.budgetMax} €</div>
                    </div>
                    <div className="conv-route">
                      <span className="conv-dep">{c.dep}</span>
                      <span className="conv-arr-arrow"> → </span>
                      <span className="conv-arr">{c.arr}</span>
                    </div>
                    <div className="conv-meta">
                      <span>📅 {c.dateAff}</span>
                      <span>⛵ {c.bateau}</span>
                      <span className={c.proOnly ? 'badge-pro' : 'badge-open'}>{c.proOnly ? 'Skipper pro requis' : 'Ouvert à tous'}</span>
                    </div>
                    {c.comp.length > 0 && (
                      <div className="conv-comp">{c.comp.map(cp => <span key={cp} className="conv-comp-tag">{cp}</span>)}</div>
                    )}
                    <div className="conv-proprio">
                      <div className="trip-av" style={{ background: c.avc }}>{c.av}</div>
                      <span>{c.proprio}</span>
                    </div>
                    <button className="voy-contact-btn" onClick={() => navigate('/messages')}>Postuler</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}