import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Messages.css'

function hasPhone(txt) {
  const clean = txt.replace(/[\s.\-()]/g, '')
  if (/(?:\+|00)\d{7,15}/.test(clean)) return true
  if (/0[67]\d{8}/.test(clean)) return true
  if (/\d{10}/.test(clean)) return true
  return false
}

function nowTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function ResaBanner({ booking, isSkipper, onAccept, onRefuse }) {
  if (!booking) return null
  return (
    <div className="resa-banner">
      <div className="rb-title">⛵ Réservation</div>
      <div className="rb-annonce">
        <div className="rb-icon">⛵</div>
        <div>
          <div className="rb-ann-title">{booking.trips?.titre || 'Trajet'}</div>
          <div className="rb-ann-meta">
            {booking.trips?.date_depart ? new Date(booking.trips.date_depart).toLocaleDateString('fr-FR') : '—'}
            {booking.trips?.prix_par_personne ? ` · ${booking.trips.prix_par_personne} €/pers.` : ''}
          </div>
        </div>
      </div>
      <div className="rb-status">
        {booking.statut === 'en_attente' && (
          <>
            <span className="rs-pill rs-attente">⏳ En attente de confirmation</span>
            {isSkipper ? (
              <div className="rb-actions">
                <button className="rb-btn rb-accept" onClick={onAccept}>✓ Accepter</button>
                <button className="rb-btn rb-refuse" onClick={onRefuse}>✕ Refuser</button>
              </div>
            ) : (
              <div className="rb-note">En attente de confirmation du skipper</div>
            )}
          </>
        )}
        {booking.statut === 'accepte' && (
          <>
            <span className="rs-pill rs-ok">✓ Acceptée</span>
            {!isSkipper ? (
              <button className="rb-btn rb-pay">💳 Payer ma place ({booking.trips?.prix_par_personne} €)</button>
            ) : (
              <div className="rb-note">En attente du paiement de l'équipier</div>
            )}
          </>
        )}
        {booking.statut === 'paye' && (
          <>
            <span className="rs-pill rs-paye">💳 Payée — place confirmée</span>
            <div className="rb-contact">
              <div className="rb-contact-title">📞 Coordonnées partagées</div>
              <div className="rb-contact-phone">Disponibles dans votre profil</div>
            </div>
          </>
        )}
        {booking.statut === 'refuse' && (
          <span className="rs-pill rs-refuse">✕ Refusée</span>
        )}
      </div>
    </div>
  )
}

export default function Messages() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [convs, setConvs] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('all')
  const [phoneWarning, setPhoneWarning] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
      if (user) loadConversations(user.id)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations(userId) {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, statut, montant, created_at,
        trips:trip_id(id, titre, date_depart, prix_par_personne, skipper_id),
        equip:equip_id(id, prenom, nom)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      const myBookings = data.filter(b =>
        b.equip?.id === userId || b.trips?.skipper_id === userId
      )

      const formatted = await Promise.all(myBookings.map(async b => {
        const isSkipper = b.trips?.skipper_id === userId
        let otherUser = isSkipper ? b.equip : null

        if (!isSkipper && b.trips?.skipper_id) {
          const { data: sk } = await supabase
            .from('users')
            .select('id, prenom, nom')
            .eq('id', b.trips.skipper_id)
            .single()
          if (sk) otherUser = sk
        }

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('contenu, created_at')
          .eq('booking_id', b.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('booking_id', b.id)
          .eq('lu', false)
          .neq('sender_id', userId)

        return {
          id: b.id,
          booking: b,
          isSkipper,
          otherUser,
          nom: otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Utilisateur',
          av: otherUser ? `${otherUser.prenom[0]}${otherUser.nom[0]}` : 'U',
          avc: '#185fa5',
          preview: lastMsg?.contenu || (b.statut === 'en_attente' ? 'Nouvelle demande de réservation' : 'Réservation'),
          time: lastMsg?.created_at
            ? new Date(lastMsg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : new Date(b.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          unread: count || 0,
          type: 'resa',
        }
      }))
      setConvs(formatted)
    }
    setLoading(false)
  }

  async function openConv(conv) {
    setActiveConv(conv)
    await supabase.from('messages')
      .update({ lu: true })
      .eq('booking_id', conv.id)
      .neq('sender_id', currentUser.id)

    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(prenom, nom)')
      .eq('booking_id', conv.id)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        from: m.sender_id === currentUser.id ? 'me' : 'other',
        txt: m.contenu,
        time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        av: m.sender ? `${m.sender.prenom[0]}${m.sender.nom[0]}` : 'U',
      })))
    }
    setConvs(cs => cs.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
  }

  async function sendMessage() {
    if (!input.trim() || !activeConv || !currentUser) return
    if (hasPhone(input)) {
      setPhoneWarning(true)
      setTimeout(() => setPhoneWarning(false), 3000)
      return
    }

    const { data, error } = await supabase.from('messages').insert({
      booking_id: activeConv.id,
      sender_id: currentUser.id,
      contenu: input,
    }).select().single()

    if (error) { console.error(error); return }

    const newMsg = {
      id: data.id,
      from: 'me',
      txt: input,
      time: nowTime(),
      av: currentUser?.email?.[0]?.toUpperCase() || 'M',
    }
    setMessages(ms => [...ms, newMsg])
    setConvs(cs => cs.map(c => c.id === activeConv.id ? { ...c, preview: input } : c))
    setInput('')
  }

  async function handleAccept() {
    await supabase.from('bookings').update({ statut: 'accepte' }).eq('id', activeConv.id)
    const updated = { ...activeConv, booking: { ...activeConv.booking, statut: 'accepte' } }
    setActiveConv(updated)
    setConvs(cs => cs.map(c => c.id === activeConv.id ? updated : c))
  }

  async function handleRefuse() {
    await supabase.from('bookings').update({ statut: 'refuse' }).eq('id', activeConv.id)
    const updated = { ...activeConv, booking: { ...activeConv.booking, statut: 'refuse' } }
    setActiveConv(updated)
    setConvs(cs => cs.map(c => c.id === activeConv.id ? updated : c))
  }

  const filteredConvs = convs.filter(c => {
    if (tab === 'resa') return c.type === 'resa'
    if (tab === 'libre') return c.type === 'libre'
    return true
  })

  return (
    <div className="msg-page">
      <div className="msg-header">
        <button className="msg-back" onClick={() => activeConv ? setActiveConv(null) : navigate('/')}>←</button>
        <span className="msg-header-title">{activeConv ? activeConv.nom : 'Messages'}</span>
        {activeConv && <span className="msg-header-sub">{activeConv.booking?.trips?.titre || ''}</span>}
      </div>

      <div className="msg-layout">
        <div className={`msg-list ${activeConv ? 'mobile-hidden' : ''}`}>
          <div className="msg-tabs">
            <button className={`msg-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
              Tous <span className="msg-tab-cnt">{convs.length}</span>
            </button>
            <button className={`msg-tab ${tab === 'resa' ? 'active' : ''}`} onClick={() => setTab('resa')}>
              Réservations <span className="msg-tab-cnt">{convs.filter(c => c.type === 'resa').length}</span>
            </button>
            <button className={`msg-tab ${tab === 'libre' ? 'active' : ''}`} onClick={() => setTab('libre')}>
              Libres <span className="msg-tab-cnt">0</span>
            </button>
          </div>

          {loading && <div className="msg-loading">Chargement...</div>}

          {!loading && filteredConvs.length === 0 && (
            <div className="msg-empty-list">
              <div style={{ fontSize: 40, textAlign: 'center', padding: '40px 20px' }}>💬</div>
              <p style={{ textAlign: 'center', color: '#6b7e94', fontSize: 14 }}>Aucune conversation</p>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#b0bfcc', padding: '0 20px' }}>
                Vos réservations apparaîtront ici
              </p>
            </div>
          )}

          {filteredConvs.map(c => (
            <div key={c.id}
              className={`msg-conv ${activeConv?.id === c.id ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
              onClick={() => openConv(c)}>
              <div className="msg-av-wrap">
                <div className="msg-av" style={{ background: c.avc }}>{c.av}</div>
              </div>
              <div className="msg-conv-body">
                <div className="msg-conv-top">
                  <span className="msg-conv-name">{c.nom}</span>
                  <span className="msg-conv-time">{c.time}</span>
                </div>
                <div className="msg-conv-last">{c.preview}</div>
                <span className={`ci-badge badge-${c.booking?.statut === 'en_attente' ? 'attente' : c.booking?.statut === 'accepte' ? 'ok' : c.booking?.statut === 'paye' ? 'paye' : 'refuse'}`}>
                  {c.booking?.statut === 'en_attente' ? 'En attente'
                    : c.booking?.statut === 'accepte' ? 'Acceptée'
                    : c.booking?.statut === 'paye' ? 'Payé'
                    : c.booking?.statut === 'refuse' ? 'Refusée' : ''}
                </span>
              </div>
              {c.unread > 0 && <div className="msg-badge">{c.unread}</div>}
            </div>
          ))}
        </div>

        <div className={`msg-chat ${!activeConv ? 'mobile-hidden' : ''}`}>
          {!activeConv ? (
            <div className="msg-empty">
              <div className="msg-empty-icon">💬</div>
              <p>Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              <ResaBanner
                booking={activeConv.booking}
                isSkipper={activeConv.isSkipper}
                onAccept={handleAccept}
                onRefuse={handleRefuse}
              />

              {phoneWarning && (
                <div className="msg-phone-warning">
                  ⛔ Coordonnées non autorisées — Elles seront partagées après réservation et paiement
                </div>
              )}

              <div className="msg-messages">
                {messages.length === 0 && (
                  <div className="msg-no-messages">Démarrez la conversation !</div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`msg-bubble-wrap ${m.from === 'me' ? 'mine' : ''}`}>
                    {m.from !== 'me' && (
                      <div className="msg-bubble-av" style={{ background: activeConv.avc }}>{activeConv.av}</div>
                    )}
                    <div className={`msg-bubble ${m.from === 'me' ? 'mine' : ''}`}>
                      <p>{m.txt}</p>
                      <span className="msg-time">{m.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  )
}