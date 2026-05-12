import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Messages.css'

// Détection numéros de téléphone
function hasPhone(txt) {
  const clean = txt.replace(/[\s.\-()]/g, '')
  if (/(?:\+|00)\d{7,15}/.test(clean)) return true
  if (/0[67]\d{8}/.test(clean)) return true
  if (/\d{10}/.test(clean)) return true
  if (/\b\d[\d\s.\-]{8,}\d\b/.test(txt)) return true
  return false
}

function nowTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const REPLIES = [
  'Ok, parfait !', 'Merci pour les informations.', 'Super, ça me convient.',
  'À très bientôt ⛵', 'Entendu, je prends note.', 'Très bien, je confirme.',
]

const MOCK_CONVS = [
  {
    id: 1, type: 'resa', unread: 2, nom: 'Thomas Leroy', av: 'TL', avc: '#185fa5',
    online: true, preview: 'Super, je valide votre demande !', time: '14h32',
    role: 'equipier', blocked: false, reported: false,
    annonce: { titre: 'Marseille → Porto-Vecchio', date: '14 juin 2026', prix: '159 €/pers.' },
    resaStatus: 'accepted', paye: false,
    msgs: [
      { id: 1, from: 'other', txt: 'Bonjour ! Je suis intéressé par votre trajet Marseille → Porto-Vecchio le 14 juin.', time: '09h12' },
      { id: 2, from: 'me', txt: 'Bonjour Thomas ! Oui bien sûr, j\'ai encore 2 places disponibles. Quel est votre niveau de navigation ?', time: '09h45' },
      { id: 3, from: 'other', txt: 'Niveau 2, j\'ai fait quelques régates et des traversées côtières. Très motivé !', time: '10h02' },
      { id: 4, from: 'me', txt: 'Parfait, ça correspond bien. Je vous envoie la demande de réservation.', time: '10h15' },
      { id: 5, from: 'other', txt: 'Super, je valide votre demande !', time: '14h32' },
    ]
  },
  {
    id: 2, type: 'resa', unread: 0, nom: 'Claire Dubois', av: 'CD', avc: '#7c3aed',
    online: false, preview: 'Quand est-ce que vous confirmez ?', time: 'hier',
    role: 'skipper', blocked: false, reported: false,
    annonce: { titre: 'Brest → Saint-Malo', date: '20 juin 2026', prix: '89 €/pers.' },
    resaStatus: 'pending', paye: false,
    msgs: [
      { id: 1, from: 'other', txt: 'Bonjour ! Je souhaite rejoindre votre trajet Brest → Saint-Malo.', time: 'hier 10h' },
      { id: 2, from: 'other', txt: 'Quand est-ce que vous confirmez ?', time: 'hier 11h' },
    ]
  },
  {
    id: 3, type: 'libre', unread: 0, nom: 'Pierre Bernard', av: 'PB', avc: '#0891b2',
    online: false, preview: 'Merci pour les infos sur l\'escale !', time: 'lun',
    role: 'skipper', blocked: false, reported: false,
    annonce: null, resaStatus: null, paye: false,
    msgs: [
      { id: 1, from: 'other', txt: 'Quelques infos sur l\'escale à Bonifacio ?', time: 'lun 09h' },
      { id: 2, from: 'me', txt: 'On s\'arrête environ 4h, temps de visiter la citadelle.', time: 'lun 09h30' },
      { id: 3, from: 'other', txt: 'Merci pour les infos sur l\'escale !', time: 'lun 10h' },
    ]
  },
  {
    id: 4, type: 'resa', unread: 0, nom: 'Marie Moreau', av: 'MM', avc: '#d97706',
    online: true, preview: 'Place confirmée ✓', time: 'dim',
    role: 'equipier', blocked: false, reported: false,
    annonce: { titre: 'La Rochelle → Île de Ré', date: '28 juin 2026', prix: '65 €/pers.' },
    resaStatus: 'paid', paye: true,
    msgs: [
      { id: 1, from: 'other', txt: 'Bonjour, votre place est confirmée et payée !', time: 'dim 15h' },
      { id: 2, from: 'me', txt: 'Merci ! À vendredi au port.', time: 'dim 15h30' },
      { id: 3, from: 'other', txt: 'Place confirmée ✓', time: 'dim 16h' },
    ]
  },
]

function ResaBanner({ conv, onAccept, onRefuse }) {
  if (!conv.annonce) return null
  const isSk = conv.role === 'skipper'

  return (
    <div className="resa-banner">
      <div className="rb-title">⛵ Réservation</div>
      <div className="rb-annonce">
        <div className="rb-icon">⛵</div>
        <div>
          <div className="rb-ann-title">{conv.annonce.titre}</div>
          <div className="rb-ann-meta">{conv.annonce.date} · {conv.annonce.prix}</div>
        </div>
      </div>
      <div className="rb-status">
        {conv.resaStatus === 'pending' && (
          <>
            <span className="rs-pill rs-attente">⏳ En attente de confirmation</span>
            {isSk ? (
              <div className="rb-actions">
                <button className="rb-btn rb-accept" onClick={() => onAccept(conv.id)}>✓ Accepter</button>
                <button className="rb-btn rb-refuse" onClick={() => onRefuse(conv.id)}>✕ Refuser</button>
              </div>
            ) : (
              <div className="rb-note">En attente de confirmation du skipper</div>
            )}
          </>
        )}
        {conv.resaStatus === 'accepted' && !conv.paye && (
          <>
            <span className="rs-pill rs-ok">✓ Acceptée</span>
            {!isSk ? (
              <button className="rb-btn rb-pay">💳 Payer ma place ({conv.annonce.prix})</button>
            ) : (
              <div className="rb-note">En attente du paiement de l'équipier</div>
            )}
          </>
        )}
        {conv.resaStatus === 'paid' && (
          <>
            <span className="rs-pill rs-paye">💳 Payée — place confirmée</span>
            <div className="rb-contact">
              <div className="rb-contact-title">📞 Coordonnées de contact</div>
              <div className="rb-contact-phone">+33 6 12 34 56 78</div>
            </div>
          </>
        )}
        {conv.resaStatus === 'refused' && (
          <span className="rs-pill rs-refuse">✕ Refusée</span>
        )}
      </div>
    </div>
  )
}

export default function Messages() {
  const navigate = useNavigate()
  const [convs, setConvs] = useState(MOCK_CONVS)
  const [activeId, setActiveId] = useState(null)
  const [tab, setTab] = useState('all')
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [phoneWarning, setPhoneWarning] = useState(false)
  const messagesEndRef = useRef(null)

  const activeConv = convs.find(c => c.id === activeId)

  const filteredConvs = convs.filter(c => {
    if (tab === 'resa' && c.type !== 'resa') return false
    if (tab === 'libre' && c.type !== 'libre') return false
    if (search && !c.nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.msgs])

  function openConv(id) {
    setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c))
    setActiveId(id)
    setPhoneWarning(false)
  }

  function sendMessage() {
    if (!input.trim() || !activeConv) return
    if (hasPhone(input)) {
      setPhoneWarning(true)
      setTimeout(() => setPhoneWarning(false), 3000)
      return
    }
    const newMsg = { id: Date.now(), from: 'me', txt: input, time: nowTime() }
    setConvs(cs => cs.map(c => c.id === activeId
      ? { ...c, msgs: [...c.msgs, newMsg], preview: input }
      : c
    ))
    setInput('')
    // Réponse simulée
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const reply = { id: Date.now() + 1, from: 'other', txt: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: nowTime() }
        setConvs(cs => cs.map(c => c.id === activeId ? { ...c, msgs: [...c.msgs, reply] } : c))
      }, 1500 + Math.random() * 1000)
    }
  }

  function acceptResa(id) {
    setConvs(cs => cs.map(c => c.id === id ? { ...c, resaStatus: 'accepted' } : c))
  }

  function refuseResa(id) {
    setConvs(cs => cs.map(c => c.id === id ? { ...c, resaStatus: 'refused' } : c))
  }

  const statut = c => {
    if (!c.annonce) return null
    if (c.resaStatus === 'pending') return <span className="ci-badge badge-attente">En attente</span>
    if (c.resaStatus === 'accepted') return <span className="ci-badge badge-ok">Acceptée</span>
    if (c.resaStatus === 'paid') return <span className="ci-badge badge-paye">Payé</span>
    if (c.resaStatus === 'refused') return <span className="ci-badge badge-refuse">Refusée</span>
    return null
  }

  return (
    <div className="msg-page">
      <div className="msg-header">
        <button className="msg-back" onClick={() => activeConv ? setActiveId(null) : navigate('/')}>←</button>
        <span className="msg-header-title">{activeConv ? activeConv.nom : 'Messages'}</span>
        {activeConv && <span className="msg-header-sub">{activeConv.annonce?.titre || 'Message libre'}</span>}
      </div>

      <div className="msg-layout">
        {/* Liste conversations */}
        <div className={`msg-list ${activeConv ? 'mobile-hidden' : ''}`}>
          {/* Tabs */}
          <div className="msg-tabs">
            <button className={`msg-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
              Tous <span className="msg-tab-cnt">{convs.length}</span>
            </button>
            <button className={`msg-tab ${tab === 'resa' ? 'active' : ''}`} onClick={() => setTab('resa')}>
              Réservations <span className="msg-tab-cnt">{convs.filter(c => c.type === 'resa').length}</span>
            </button>
            <button className={`msg-tab ${tab === 'libre' ? 'active' : ''}`} onClick={() => setTab('libre')}>
              Libres <span className="msg-tab-cnt">{convs.filter(c => c.type === 'libre').length}</span>
            </button>
          </div>

          {/* Recherche */}
          <div className="msg-search-wrap">
            <input className="msg-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Conversations */}
          {filteredConvs.map(c => (
            <div key={c.id} className={`msg-conv ${activeId === c.id ? 'active' : ''} ${c.unread ? 'unread' : ''}`} onClick={() => openConv(c.id)}>
              <div className="msg-av-wrap">
                <div className="msg-av" style={{ background: c.avc }}>{c.av}</div>
                {c.online && <div className="msg-online"></div>}
              </div>
              <div className="msg-conv-body">
                <div className="msg-conv-top">
                  <span className="msg-conv-name">{c.nom}</span>
                  <span className="msg-conv-time">{c.time}</span>
                </div>
                <div className="msg-conv-last">{c.preview}</div>
                {statut(c)}
              </div>
              {c.unread > 0 && <div className="msg-badge">{c.unread}</div>}
            </div>
          ))}
        </div>

        {/* Zone chat */}
        <div className={`msg-chat ${!activeConv ? 'mobile-hidden' : ''}`}>
          {!activeConv ? (
            <div className="msg-empty">
              <div className="msg-empty-icon">💬</div>
              <p>Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Banner réservation */}
              <ResaBanner conv={activeConv} onAccept={acceptResa} onRefuse={refuseResa} />

              {/* Alerte téléphone */}
              {phoneWarning && (
                <div className="msg-phone-warning">
                  ⛔ Coordonnées non autorisées — Elles seront partagées automatiquement après réservation et paiement
                </div>
              )}

              {/* Messages */}
              <div className="msg-messages">
                {activeConv.blocked ? (
                  <div className="msg-locked">🔒 Vous avez bloqué cet utilisateur.</div>
                ) : activeConv.reported ? (
                  <div className="msg-locked">⚠️ Conversation suspendue — signalement en cours d'examen.</div>
                ) : (
                  activeConv.msgs.map(m => (
                    <div key={m.id} className={`msg-bubble-wrap ${m.from === 'me' ? 'mine' : ''}`}>
                      {m.from !== 'me' && (
                        <div className="msg-bubble-av" style={{ background: activeConv.avc }}>{activeConv.av}</div>
                      )}
                      <div className={`msg-bubble ${m.from === 'me' ? 'mine' : ''}`}>
                        <p>{m.txt}</p>
                        <span className="msg-time">{m.time}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!activeConv.blocked && !activeConv.reported && (
                <div className="msg-input-wrap">
                  <textarea
                    className={`msg-input ${phoneWarning ? 'phone-error' : ''}`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Votre message..."
                    rows={1}
                  />
                  <button className="msg-send" onClick={sendMessage}>→</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}