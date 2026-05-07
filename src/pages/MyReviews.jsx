import { useState } from 'react'
import './MyReviews.css'

const MOCK_REVIEWS = [
  {id:1,type:'recu',auteur:'Thomas Leroy',av:'TL',avc:'#0f2d52',trajet:'Marseille → Porto-Vecchio',date:'15 juin 2026',note:5,commentaire:'Excellente équipière, très compétente et agréable. Je recommande vivement !'},
  {id:2,type:'recu',auteur:'Claire Dubois',av:'CD',avc:'#7c3aed',trajet:'Brest → Saint-Malo',date:'22 juin 2026',note:4,commentaire:'Bonne navigatrice, ponctuelle et motivée.'},
  {id:3,type:'donne',auteur:'Pierre Bernard',av:'PB',avc:'#0891b2',trajet:'Nice → Ajaccio',date:'5 juil. 2026',note:5,commentaire:'Skipper exceptionnel, très pédagogue. Traversée parfaite !'},
  {id:4,type:'donne',auteur:'Marie Moreau',av:'MM',avc:'#d97706',trajet:'La Rochelle → Île de Ré',date:'30 juin 2026',note:4,commentaire:'Très belle sortie, skippeure professionnelle et sympathique.'},
]

function Stars({ note }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= note ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

export default function MyReviews() {
  const [tab, setTab] = useState('all')

  const filtered = tab === 'all' ? MOCK_REVIEWS :
    tab === 'recus' ? MOCK_REVIEWS.filter(r => r.type === 'recu') :
    MOCK_REVIEWS.filter(r => r.type === 'donne')

  const moyenneRecus = MOCK_REVIEWS.filter(r => r.type === 'recu').reduce((acc,r) => acc + r.note, 0) / MOCK_REVIEWS.filter(r => r.type === 'recu').length

  return (
    <div className="reviews-page">
      <div className="reviews-topbar">
        <span className="reviews-topbar-title">Mes avis</span>
      </div>

      <div className="reviews-content">
        {/* Résumé */}
        <div className="reviews-summary">
          <div className="reviews-summary-note">
            <div className="reviews-summary-val">{moyenneRecus.toFixed(1)}</div>
            <Stars note={Math.round(moyenneRecus)} />
            <div className="reviews-summary-count">{MOCK_REVIEWS.filter(r=>r.type==='recu').length} avis reçus</div>
          </div>
          <div className="reviews-summary-bars">
            {[5,4,3,2,1].map(n => {
              const count = MOCK_REVIEWS.filter(r=>r.type==='recu'&&r.note===n).length
              const total = MOCK_REVIEWS.filter(r=>r.type==='recu').length
              return (
                <div key={n} className="reviews-bar-row">
                  <span>{n}★</span>
                  <div className="reviews-bar"><div className="reviews-bar-fill" style={{width:`${total?count/total*100:0}%`}}></div></div>
                  <span>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="reviews-tabs">
          <button className={`reviews-tab ${tab==='all'?'active':''}`} onClick={() => setTab('all')}>Tous ({MOCK_REVIEWS.length})</button>
          <button className={`reviews-tab ${tab==='recus'?'active':''}`} onClick={() => setTab('recus')}>Reçus ({MOCK_REVIEWS.filter(r=>r.type==='recu').length})</button>
          <button className={`reviews-tab ${tab==='donnes'?'active':''}`} onClick={() => setTab('donnes')}>Donnés ({MOCK_REVIEWS.filter(r=>r.type==='donne').length})</button>
        </div>

        {/* Liste */}
        {filtered.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-card-header">
              <div className="review-av" style={{background:r.avc}}>{r.av}</div>
              <div className="review-card-info">
                <div className="review-card-auteur">{r.auteur}</div>
                <div className="review-card-trajet">{r.trajet}</div>
                <div className="review-card-date">{r.date}</div>
              </div>
              <div className="review-card-right">
                <Stars note={r.note} />
                <span className={`review-type ${r.type}`}>{r.type === 'recu' ? 'Reçu' : 'Donné'}</span>
              </div>
            </div>
            <p className="review-card-comment">"{r.commentaire}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
