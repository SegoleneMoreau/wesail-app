import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CityInput from '../components/CityInput'
import './NewTrip.css'


const ZONES = [
  'Méditerranée','Atlantique','Bretagne','Manche & Normandie','Mer du Nord',
  'Corse','Sardaigne','Grèce & Égée','Antilles · Caraïbes','Polynésie française',
  'Açores','Canaries',
]

const CATEGORIES = [
  { v: 'traversee', l: 'Traversée', color: '#e8f0f9', tc: '#185fa5' },
  { v: 'journee', l: 'Sortie journée', color: '#faeeda', tc: '#ef9f27' },
  { v: 'weekend', l: 'Week-end', color: '#eaf3de', tc: '#639922' },
  { v: 'croisiere', l: 'Croisière', color: '#e1f5ee', tc: '#1d9e75' },
  { v: 'regate', l: 'Régate', color: '#eeedfe', tc: '#7f77dd' },
]

const NIVEAUX = [
  { v: 1, l: 'Débutant', s: 'Quelques sorties en mer' },
  { v: 2, l: 'Initié', s: 'Navigations côtières' },
  { v: 3, l: 'Expérimenté', s: 'Traversées et navigation hauturière' },
  { v: 4, l: 'Skipper', s: 'Skipper confirmé, compétences avancées' },
]

const MOCK_BATEAUX = [
  { id: 1, nom: 'Libertad', detail: 'Jeanneau Sun Odyssey 40 · 2018 · 12m' },
  { id: 2, nom: 'Mistral II', detail: 'Bénéteau Océanis 35 · 2014 · 10.5m' },
]

const COMPETENCES = [
  'Navigation hauturière','Météo marine','Navigation de nuit','Mécanique diesel',
  'Radio VHF / SRC','Manœuvres en port','Sécurité & sauvetage','Électronique de bord','Gréement & voilerie'
]

const CERTIFICATIONS = [
  'Permis côtier','Permis hauturier','Certificat General Radioélectricien (CRO/GOC)',
  'STCW / Certificat de marin','Brevet de chef de bord',
]


function Toggle({ value, onChange, label, sub }) {
  return (
    <div className="nt-toggle-row">
      <div className="nt-toggle-text">
        <div className="nt-toggle-label">{label}</div>
        {sub && <div className="nt-toggle-sub">{sub}</div>}
      </div>
      <button className={'nt-toggle' + (value ? ' on' : '')} onClick={() => onChange(!value)}>
        <div className="nt-toggle-thumb"></div>
      </button>
    </div>
  )
}

export default function NewTrip() {
  const navigate = useNavigate()
  const [type, setType] = useState(null)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const [f1, setF1] = useState({
    categorie: 'traversee', bateau_id: null, depart: '', arrivee: '', zone: '',
    date_depart: '', date_fin: '', flexible: false, places: '2',
    gratuit: false, frais_bateau: '', frais_vie: '',
    niveau: 1, only_women: false, description: ''
  })

  const [f2, setF2] = useState({
    eq_depart: '', eq_arrivee: '', eq_zone: '', eq_date: '', eq_duree: '',
    eq_niveau: 1, eq_description: ''
  })

  const [f3, setF3] = useState({
    bateau_id: null, depart: '', arrivee: '', date: '', flexible: false, delai: '',
    pro_only: true, exp_min: '', milles_min: '', budget_min: '', budget_max: '',
    competences: [], certifications: [], description: ''
  })

  function u1(k, v) { setF1(f => ({ ...f, [k]: v })) }
  function u2(k, v) { setF2(f => ({ ...f, [k]: v })) }
  function u3(k, v) { setF3(f => ({ ...f, [k]: v })) }

  function toggleTag(key, val, setter) {
    setter(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  const totalFrais = (parseFloat(f1.frais_bateau) || 0) + (parseFloat(f1.frais_vie) || 0)
  const nbPersonnes = parseInt(f1.places) + 1
  const prixPP = f1.gratuit ? 0 : (totalFrais > 0 ? Math.ceil(totalFrais / nbPersonnes) : '')

  async function handleSubmit() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const tripData = {
    skipper_id: user.id,
    titre: type === 1 ? `${f1.depart} → ${f1.arrivee}` : type === 2 ? f2.eq_description.slice(0, 50) : `${f3.depart} → ${f3.arrivee}`,
    depart: type === 1 ? f1.depart : type === 2 ? f2.eq_depart : f3.depart,
    arrivee: type === 1 ? f1.arrivee : type === 2 ? f2.eq_arrivee : f3.arrivee,
    date_depart: type === 1 ? f1.date_depart : type === 2 ? f2.eq_date : f3.date,
    places_total: type === 1 ? parseInt(f1.places) : 1,
    places_dispo: type === 1 ? parseInt(f1.places) : 1,
    prix_par_personne: type === 1 ? (parseFloat(prixPP) || 0) : 0,
    niveau_requis: type === 1 ? f1.niveau : type === 2 ? f2.eq_niveau : 1,
    categorie: type === 1 ? f1.categorie : type === 2 ? 'equipier' : 'convoyage',
    description: type === 1 ? f1.description : type === 2 ? f2.eq_description : f3.description,
    only_women: type === 1 ? f1.only_women : false,
  }

  const { error } = await supabase.from('trips').insert(tripData)
if (error) {
  console.error(error)
  alert('Erreur : ' + error.message)
  return
}

  setSubmitted(true)
  setTimeout(() => navigate('/trajets'), 2000)
}

  if (submitted) return (
    <div className="nt-success">
      <div className="nt-success-icon">✓</div>
      <h2>Annonce publiée !</h2>
      <p>Votre annonce est maintenant visible.</p>
    </div>
  )

  if (!type) return (
    <div className="nt-page">
      <div className="nt-header">
        <button className="nt-back" onClick={() => navigate('/')}>← Annuler</button>
        <span className="nt-header-title">Déposer une annonce</span>
        <span></span>
      </div>
      <div className="nt-content">
        <div className="nt-type-intro">
          <h1>Quelle annonce souhaitez-vous déposer ?</h1>
          <p>Choisissez votre situation. Les 3 types sont indexés dans Trouver un trajet et mis en relation automatiquement.</p>
        </div>
        <div className="nt-type-cards">
          <div className="nt-type-card" onClick={() => { setType(1); setStep(1) }}>
            <span className="nt-type-num">1</span>
            <div className="nt-type-icon" style={{ background: '#e8f0f9' }}>⛵</div>
            <div>
              <div className="nt-type-title">Je propose un trajet</div>
              <div className="nt-type-sub">Je suis skipper avec mon bateau. Je cherche des équipiers ou passagers pour partager les frais.</div>
            </div>
          </div>
          <div className="nt-type-card" onClick={() => setType(2)}>
            <span className="nt-type-num">2</span>
            <div className="nt-type-icon" style={{ background: '#e1f5ee' }}>👤</div>
            <div>
              <div className="nt-type-title">Je cherche un trajet</div>
              <div className="nt-type-sub">Je suis voyageur. Je cherche un skipper et un bateau pour ma prochaine aventure.</div>
            </div>
          </div>
          <div className="nt-type-card" onClick={() => setType(3)}>
            <span className="nt-type-num">3</span>
            <div className="nt-type-icon" style={{ background: '#faeeda' }}>🚢</div>
            <div>
              <div className="nt-type-title">Je cherche un convoyeur</div>
              <div className="nt-type-sub">Je suis propriétaire et j'ai besoin d'un skipper professionnel pour déplacer mon bateau.</div>
            </div>
          </div>
        </div>
        <div className="nt-info-note">Les 3 types sont indexés et mis en relation automatiquement par le moteur WeSail.</div>
      </div>
    </div>
  )

  if (type === 1) return (
    <div className="nt-page">
      <div className="nt-header">
        <button className="nt-back" onClick={() => step > 1 ? setStep(s => s - 1) : setType(null)}>
          {step > 1 ? '← Retour' : '← Changer'}
        </button>
        <span className="nt-header-title">Je propose un trajet</span>
        <span className="nt-step">{step}/3</span>
      </div>
      <div className="nt-progress"><div className="nt-progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div></div>
      <div className="nt-content">

        {step === 1 && (
          <div className="nt-section">
            <h2 className="nt-title">Le trajet</h2>
            <div className="nt-field">
              <label>Type de navigation *</label>
              <div className="nt-cat-grid">
                {CATEGORIES.map(c => (
                  <button key={c.v}
                    className={'nt-cat-btn' + (f1.categorie === c.v ? ' active' : '')}
                    style={f1.categorie === c.v ? { background: c.color, borderColor: c.tc, color: c.tc } : {}}
                    onClick={() => u1('categorie', c.v)}>{c.l}</button>
                ))}
              </div>
            </div>
            <div className="nt-field">
              <label>Mon bateau</label>
              <div className="nt-boat-list">
                {MOCK_BATEAUX.map(b => (
                  <button key={b.id} className={'nt-boat-btn' + (f1.bateau_id === b.id ? ' active' : '')} onClick={() => u1('bateau_id', b.id)}>
                    <div className="nt-boat-nom">⛵ {b.nom}</div>
                    <div className="nt-boat-detail">{b.detail}</div>
                  </button>
                ))}
                <button className="nt-boat-btn add" onClick={() => navigate('/bateaux')}>+ Ajouter un bateau</button>
              </div>
            </div>
            <div className="nt-field">
              <label>Port de départ *</label>
              <CityInput value={f1.depart} onChange={v => u1('depart', v)} placeholder="ex: Marseille — Vieux-Port" showPortsFirst />
            </div>
            <div className="nt-field">
              <label>Destination *</label>
              <CityInput value={f1.arrivee} onChange={v => u1('arrivee', v)} placeholder="ex: Porto-Vecchio" showPortsFirst />
            </div>
            <div className="nt-field">
              <label>Zone géographique</label>
              <select value={f1.zone} onChange={e => u1('zone', e.target.value)}>
                <option value="">Sélectionnez une zone</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="nt-row">
              <div className="nt-field">
                <label>Date de départ *</label>
                <input type="date" value={f1.date_depart} onChange={e => u1('date_depart', e.target.value)} />
              </div>
              <div className="nt-field">
                <label>Date d'arrivée</label>
                <input type="date" value={f1.date_fin} onChange={e => u1('date_fin', e.target.value)} />
              </div>
            </div>
            <Toggle value={f1.flexible} onChange={v => u1('flexible', v)}
              label="Flexible sur la date"
              sub="La date peut changer selon les conditions météo" />
            <button className="nt-next" disabled={!f1.depart || !f1.arrivee || !f1.date_depart} onClick={() => setStep(2)}>Suivant →</button>
          </div>
        )}

        {step === 2 && (
          <div className="nt-section">
            <h2 className="nt-title">Places et Frais</h2>
            <div className="nt-field">
              <label>Nombre de places disponibles *</label>
              <div className="nt-counter">
                <button onClick={() => u1('places', Math.max(1, parseInt(f1.places) - 1).toString())}>−</button>
                <span>{f1.places}</span>
                <button onClick={() => u1('places', Math.min(12, parseInt(f1.places) + 1).toString())}>+</button>
              </div>
            </div>

            <div className="nt-frais-section">
              <div className="nt-sub-title">Partage des frais</div>
              <div className="nt-gratuit-row" onClick={() => u1('gratuit', !f1.gratuit)}>
                <div className={'nt-checkbox-icon' + (f1.gratuit ? ' checked' : '')}>{f1.gratuit && '✓'}</div>
                <div>
                  <div className="nt-gratuit-label">Pas de frais engagés pour ce trajet</div>
                  <div className="nt-gratuit-sub">Le total sera automatiquement mis à 0 €</div>
                </div>
              </div>
              {!f1.gratuit && (
                <>
                  <div className="nt-row">
                    <div className="nt-field">
                      <label>Frais bateau (€) <span className="nt-hint">carburant, ports...</span></label>
                      <input type="number" value={f1.frais_bateau} onChange={e => u1('frais_bateau', e.target.value)} placeholder="0" min="0" />
                    </div>
                    <div className="nt-field">
                      <label>Frais de vie (€) <span className="nt-hint">hygiène, alimentation...</span></label>
                      <input type="number" value={f1.frais_vie} onChange={e => u1('frais_vie', e.target.value)} placeholder="0" min="0" />
                    </div>
                  </div>
                  {totalFrais > 0 && (
                    <div className="nt-frais-total">
                      <div>
                        <div className="nt-frais-label">Total des frais</div>
                        <div className="nt-frais-sub">Répartis entre {nbPersonnes} personnes (vous + {f1.places} équipier{parseInt(f1.places) > 1 ? 's' : ''})</div>
                      </div>
                      <div className="nt-frais-right">
                        <div className="nt-frais-val">{totalFrais} €</div>
                        <div className="nt-frais-pp">{prixPP} € / pers.</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="nt-field">
              <label>Niveau requis</label>
              <div className="nt-niveau-list">
                {NIVEAUX.map(n => (
                  <button key={n.v} className={'nt-niveau-btn' + (f1.niveau === n.v ? ' active' : '')} onClick={() => u1('niveau', n.v)}>
                    <div className="nt-niveau-label">{n.l}</div>
                    <div className="nt-niveau-sub">{n.s}</div>
                  </button>
                ))}
              </div>
            </div>
            <Toggle value={f1.only_women} onChange={v => u1('only_women', v)}
              label="Réserver cette sortie aux femmes 🚺"
              sub="Seules les femmes pourront s'inscrire" />
            <button className="nt-next" onClick={() => setStep(3)}>Suivant →</button>
          </div>
        )}

        {step === 3 && (
          <div className="nt-section">
            <h2 className="nt-title">Description</h2>
            <div className="nt-field">
              <label>Décrivez votre trajet *</label>
              <textarea value={f1.description} onChange={e => u1('description', e.target.value)}
                placeholder="Décrivez le trajet, les conditions, l'ambiance souhaitée, ce que vous attendez des équipiers..." rows={6} />
              <div className="nt-chars">{f1.description.length}/1000</div>
            </div>
            <div className="nt-recap">
              <div className="nt-recap-title">Récapitulatif</div>
              <div className="nt-recap-row"><span>Type</span><span>{CATEGORIES.find(c => c.v === f1.categorie)?.l}</span></div>
              <div className="nt-recap-row"><span>Trajet</span><span>{f1.depart} → {f1.arrivee}</span></div>
              <div className="nt-recap-row"><span>Départ</span><span>{f1.date_depart ? new Date(f1.date_depart).toLocaleDateString('fr-FR') : '—'}</span></div>
              <div className="nt-recap-row"><span>Places</span><span>{f1.places}</span></div>
              <div className="nt-recap-row"><span>Prix</span><span>{f1.gratuit ? 'Gratuit' : prixPP ? prixPP + ' €/pers.' : '—'}</span></div>
              {f1.only_women && <div className="nt-recap-row"><span>Mode</span><span>Only Women 🚺</span></div>}
            </div>
            <button className="nt-next" disabled={!f1.description} onClick={handleSubmit}>🚀 Publier l'annonce</button>
          </div>
        )}
      </div>
    </div>
  )

  if (type === 2) return (
    <div className="nt-page">
      <div className="nt-header">
        <button className="nt-back" onClick={() => setType(null)}>← Changer</button>
        <span className="nt-header-title">Je cherche un trajet</span>
        <span></span>
      </div>
      <div className="nt-content">
        <div className="nt-section">
          <h2 className="nt-title">Ma recherche</h2>
          <div className="nt-field">
            <label>Port de départ souhaité</label>
            <CityInput value={f2.eq_depart} onChange={v => u2('eq_depart', v)} placeholder="ex: Marseille" showPortsFirst />
          </div>
          <div className="nt-field">
            <label>Destination souhaitée</label>
            <CityInput value={f2.eq_arrivee} onChange={v => u2('eq_arrivee', v)} placeholder="ex: Corse" showPortsFirst />
          </div>
          <div className="nt-field">
            <label>Zone géographique</label>
            <select value={f2.eq_zone} onChange={e => u2('eq_zone', e.target.value)}>
              <option value="">Toutes les zones</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="nt-row">
            <div className="nt-field">
              <label>Date souhaitée</label>
              <input type="date" value={f2.eq_date} onChange={e => u2('eq_date', e.target.value)} />
            </div>
            <div className="nt-field">
              <label>Durée</label>
              <select value={f2.eq_duree} onChange={e => u2('eq_duree', e.target.value)}>
                <option value="">Peu importe</option>
                <option>Journée</option>
                <option>Week-end</option>
                <option>1 semaine</option>
                <option>2 semaines</option>
                <option>1 mois+</option>
              </select>
            </div>
          </div>
          <div className="nt-field">
            <label>Mon niveau de voile</label>
            <div className="nt-niveau-list">
              {NIVEAUX.map(n => (
                <button key={n.v} className={'nt-niveau-btn' + (f2.eq_niveau === n.v ? ' active' : '')} onClick={() => u2('eq_niveau', n.v)}>
                  <div className="nt-niveau-label">{n.l}</div>
                  <div className="nt-niveau-sub">{n.s}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="nt-field">
            <label>Présentez-vous *</label>
            <textarea value={f2.eq_description} onChange={e => u2('eq_description', e.target.value)}
              placeholder="Parlez de vous, votre expérience nautique, ce que vous cherchez..." rows={5} />
          </div>
          <button className="nt-next" disabled={!f2.eq_description} onClick={handleSubmit}>🚀 Publier ma recherche</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="nt-page">
      <div className="nt-header">
        <button className="nt-back" onClick={() => setType(null)}>← Changer</button>
        <span className="nt-header-title">Je cherche un convoyeur</span>
        <span></span>
      </div>
      <div className="nt-content">
        <div className="nt-section">
          <div className="nt-conv-banner">
            <div className="nt-conv-banner-icon">🚢</div>
            <div>
              <div className="nt-conv-banner-title">Mission de convoyage professionnel</div>
              <div className="nt-conv-banner-sub">Vous confiez votre bateau à un skipper professionnel. Le skipper proposera son prix en réponse à votre annonce.</div>
            </div>
          </div>

          <div className="nt-field">
            <label>Bateau à convoyer *</label>
            <div className="nt-boat-list">
              {MOCK_BATEAUX.map(b => (
                <button key={b.id} className={'nt-boat-btn' + (f3.bateau_id === b.id ? ' active' : '')} onClick={() => u3('bateau_id', b.id)}>
                  <div className="nt-boat-nom">⛵ {b.nom}</div>
                  <div className="nt-boat-detail">{b.detail}</div>
                </button>
              ))}
              <button className="nt-boat-btn add" onClick={() => navigate('/bateaux')}>+ Ajouter un bateau</button>
            </div>
          </div>

          <div className="nt-field">
            <label>Port de départ (où est le bateau) *</label>
            <CityInput value={f3.depart} onChange={v => u3('depart', v)} placeholder="ex: La Rochelle — Port des Minimes" showPortsFirst />
          </div>
          <div className="nt-field">
            <label>Port d'arrivée souhaité *</label>
            <CityInput value={f3.arrivee} onChange={v => u3('arrivee', v)} placeholder="ex: Marseille — Vieux-Port" showPortsFirst />
          </div>
          <div className="nt-field">
            <label>Date de départ souhaitée *</label>
            <input type="date" value={f3.date} onChange={e => u3('date', e.target.value)} />
          </div>
          <Toggle value={f3.flexible} onChange={v => u3('flexible', v)}
            label="Flexible sur la date"
            sub="La date peut changer selon les conditions météo" />
          {f3.flexible && (
            <div className="nt-field">
              <label>Délai maximum acceptable</label>
              <select value={f3.delai} onChange={e => u3('delai', e.target.value)}>
                <option value="">Dès que possible</option>
                <option>Sous 1 semaine</option>
                <option>Sous 2 semaines</option>
                <option>Sous 1 mois</option>
                <option>Date très flexible</option>
              </select>
            </div>
          )}

          <div className="nt-sub-title">Profil du skipper recherché</div>
          <div className="nt-info-note">Par défaut, votre annonce est diffusée uniquement aux skippers professionnels (niveau 4).</div>

          <div className="nt-gratuit-row" onClick={() => u3('pro_only', !f3.pro_only)}>
            <div className={'nt-checkbox-icon' + (!f3.pro_only ? ' checked' : '')}>{!f3.pro_only && '✓'}</div>
            <div>
              <div className="nt-gratuit-label">J'accepte un skipper non professionnel</div>
              <div className="nt-gratuit-sub">Mon annonce sera diffusée à tous les membres WeSail</div>
            </div>
          </div>

          <div className={f3.pro_only ? 'nt-note-pro' : 'nt-note-all'}>
            {f3.pro_only
              ? <>Annonce réservée aux <strong>skippers professionnels (niveau 4)</strong></>
              : <>Annonce ouverte à <strong>tous les membres WeSail</strong></>
            }
          </div>

          <div className="nt-row">
            <div className="nt-field">
              <label>Années d'expérience min. <span className="nt-hint">facultatif</span></label>
              <input type="number" value={f3.exp_min} onChange={e => u3('exp_min', e.target.value)} placeholder="ex: 5" min="0" />
            </div>
            <div className="nt-field">
              <label>Milles parcourus min. <span className="nt-hint">facultatif</span></label>
              <input type="number" value={f3.milles_min} onChange={e => u3('milles_min', e.target.value)} placeholder="ex: 5000" min="0" />
            </div>
          </div>

          <div className="nt-field">
            <label>Compétences souhaitées</label>
            <div className="nt-tags">
              {COMPETENCES.map(c => (
                <button key={c} className={'nt-tag' + (f3.competences.includes(c) ? ' active' : '')}
                  onClick={() => toggleTag('competences', c, setF3)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="nt-field">
            <label>Certifications requises</label>
            <div className="nt-certifs">
              {CERTIFICATIONS.map(c => (
                <label key={c} className={'nt-certif' + (f3.certifications.includes(c) ? ' checked' : '')}>
                  <input type="checkbox" checked={f3.certifications.includes(c)}
                    onChange={() => toggleTag('certifications', c, setF3)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="nt-row">
            <div className="nt-field">
              <label>Budget minimum (€) <span className="nt-hint">facultatif</span></label>
              <input type="number" value={f3.budget_min} onChange={e => u3('budget_min', e.target.value)} placeholder="ex: 500" min="0" />
            </div>
            <div className="nt-field">
              <label>Budget maximum (€) <span className="nt-hint">facultatif</span></label>
              <input type="number" value={f3.budget_max} onChange={e => u3('budget_max', e.target.value)} placeholder="ex: 1500" min="0" />
            </div>
          </div>
          {f3.budget_min && f3.budget_max && (
            <div className="nt-info-note">Fourchette : {f3.budget_min} € — {f3.budget_max} €. Les skippers verront cette fourchette avant de postuler.</div>
          )}
          <div className="nt-field">
            <label>Description *</label>
            <textarea value={f3.description} onChange={e => u3('description', e.target.value)}
              placeholder="Décrivez votre bateau, le trajet, vos attentes pour le convoyeur..." rows={5} />
          </div>

          <button className="nt-next"
            disabled={!f3.depart || !f3.arrivee || !f3.date || !f3.description}
            onClick={handleSubmit}>🚀 Publier ma demande</button>
        </div>
      </div>
    </div>
  )
}