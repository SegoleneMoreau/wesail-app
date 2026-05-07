import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Messages.css'

const MOCK_CONVS = [
  { id:1, av:'TL', avc:'#0f2d52', nom:'Thomas Leroy', online:true, last:'Super, je valide votre demande !', time:'14h32', unread:1, statut:'accepte', trajet:'Marseille → Porto-Vecchio' },
  { id:2, av:'CD', avc:'#7c3aed', nom:'Claire Dubois', online:false, last:'Quand est-ce que vous confirmez ?', time:'hier', unread:0, statut:'en_attente', trajet:'Brest → Saint-Malo' },
  { id:3, av:'PB', avc:'#0891b2', nom:'Pierre Bernard', online:false, last:"Merci pour les infos sur l'escale !", time:'lun', unread:0, statut:null, trajet:'Nice → Ajaccio' },
  { id:4, av:'MM', avc:'#d97706', nom:'Marie Moreau', online:true, last:'On se voit au port vendredi ?', time:'dim', unread:0, statut:null, trajet:'La Rochelle → Île de Ré' },
]

const MOCK_MESSAGES = {
  1:[{id:1,mine:false,text:'Bonjour ! Je suis intéressé par votre trajet Marseille → Porto-Vecchio.',time:'14h20'},{id:2,mine:true,text:'Bonjour Thomas, avec plaisir ! Quel est votre niveau de voile ?',time:'14h25'},{id:3,mine:false,text:"Niveau 2, j'ai déjà fait quelques sorties en Méditerranée.",time:'14h28'},{id:4,mine:false,text:'Super, je valide votre demande !',time:'14h32'}],
  2:[{id:1,mine:true,text:'Bonjour Claire, je suis disponible pour le trajet Brest → Saint-Malo.',time:'hier 10h'},{id:2,mine:false,text:'Quand est-ce que vous confirmez ?',time:'hier 11h'}],
  3:[{id:1,mine:false,text:"Quelques infos sur l'escale à Bonifacio ?",time:'lun 09h'},{id:2,mine:true,text:'On arrête 4h, temps de visiter la citadelle.',time:'lun 09h30'},{id:3,mine:false,text:"Merci pour les infos sur l'escale !",time:'lun 10h'}],
  4:[{id:1,mine:false,text:'Tout est confirmé pour vendredi ?',time:'dim 15h'},{id:2,mine:true,text:'Oui, rendez-vous au port à 9h !',time:'dim 15h30'},{id:3,mine:false,text:'On se voit au port vendredi ?',time:'dim 16h'}],
}

export default function Messages() {
  const navigate = useNavigate()
  const [activeConv, setActiveConv] = useState(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)

  function sendMessage() {
    if (!input.trim() || !activeConv) return
    setMessages(m => ({...m, [activeConv.id]: [...(m[activeConv.id]||[]), {id:Date.now(),mine:true,text:input,time:'maintenant'}]}))
    setInput('')
  }

  return (
    <div className="msg-page">
      <div className="msg-header">
        <button className="msg-back" onClick={() => activeConv ? setActiveConv(null) : navigate('/')}>←</button>
        <span className="msg-header-title">{activeConv ? activeConv.nom : 'Messages'}</span>
        {activeConv && <span className="msg-header-sub">{activeConv.trajet}</span>}
      </div>

      <div className="msg-layout">
        <div className={`msg-list ${activeConv ? 'mobile-hidden' : ''}`}>
          <div className="msg-list-head"><input className="msg-search" placeholder="Rechercher..." /></div>
          {MOCK_CONVS.map(c => (
            <div key={c.id} className={`msg-conv ${activeConv?.id===c.id?'active':''} ${c.unread?'unread':''}`} onClick={() => setActiveConv(c)}>
              <div className="msg-av-wrap">
                <div className="msg-av" style={{background:c.avc}}>{c.av}</div>
                {c.online && <div className="msg-online"></div>}
              </div>
              <div className="msg-conv-body">
                <div className="msg-conv-top">
                  <span className="msg-conv-name">{c.nom}</span>
                  <span className="msg-conv-time">{c.time}</span>
                </div>
                <div className="msg-conv-last">{c.last}</div>
                {c.statut && <div className="msg-conv-statut" style={{color:c.statut==='accepte'?'#0f6e56':'#d97706'}}>{c.statut==='accepte'?'✓ Acceptée':'En attente'}</div>}
              </div>
              {c.unread > 0 && <div className="msg-badge">{c.unread}</div>}
            </div>
          ))}
        </div>

        <div className={`msg-chat ${!activeConv ? 'mobile-hidden' : ''}`}>
          {!activeConv ? (
            <div className="msg-empty"><div className="msg-empty-icon">💬</div><p>Sélectionnez une conversation</p></div>
          ) : (
            <>
              <div className="msg-messages">
                {(messages[activeConv.id]||[]).map(m => (
                  <div key={m.id} className={`msg-bubble-wrap ${m.mine?'mine':''}`}>
                    {!m.mine && <div className="msg-bubble-av" style={{background:activeConv.avc}}>{activeConv.av}</div>}
                    <div className={`msg-bubble ${m.mine?'mine':''}`}>
                      <p>{m.text}</p>
                      <span className="msg-time">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              {activeConv.statut === 'accepte' && (
                <div className="msg-booking">
                  <span>✓ Demande acceptée</span>
                  <button className="msg-pay-btn">Payer ma place</button>
                </div>
              )}
              <div className="msg-input-wrap">
                <textarea className="msg-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Votre message..." rows={1} />
                <button className="msg-send" onClick={sendMessage}>→</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
