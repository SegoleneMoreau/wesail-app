import { useState } from 'react'
import './Meteo.css'

const PORTS = [
  {id:1,nom:'Marseille',zone:'med',lat:43.296,lng:5.381,vent:15,direction:'NW',vagues:0.8,temp:18,meteo:'☀️'},
  {id:2,nom:'Nice',zone:'med',lat:43.695,lng:7.271,vent:8,direction:'SE',vagues:0.3,temp:20,meteo:'⛅'},
  {id:3,nom:'Toulon',zone:'med',lat:43.124,lng:5.928,vent:12,direction:'W',vagues:0.5,temp:19,meteo:'☀️'},
  {id:4,nom:'Ajaccio',zone:'cors',lat:41.919,lng:8.738,vent:20,direction:'NW',vagues:1.2,temp:17,meteo:'🌬️'},
  {id:5,nom:'Brest',zone:'bre',lat:48.390,lng:-4.486,vent:25,direction:'SW',vagues:2.1,temp:12,meteo:'🌧️'},
  {id:6,nom:'Saint-Malo',zone:'bre',lat:48.649,lng:-2.025,vent:18,direction:'W',vagues:1.5,temp:13,meteo:'⛅'},
  {id:7,nom:'La Rochelle',zone:'atl',lat:46.160,lng:-1.151,vent:14,direction:'NW',vagues:0.9,temp:15,meteo:'⛅'},
  {id:8,nom:'Bordeaux',zone:'atl',lat:44.837,lng:-0.580,vent:10,direction:'NE',vagues:0.4,temp:16,meteo:'☀️'},
  {id:9,nom:'Lorient',zone:'bre',lat:47.748,lng:-3.360,vent:22,direction:'SW',vagues:1.8,temp:13,meteo:'🌧️'},
  {id:10,nom:'Cherbourg',zone:'man',lat:49.635,lng:-1.616,vent:30,direction:'W',vagues:2.5,temp:11,meteo:'⛈️'},
]

const ZONES = [
  {id:'all',label:'Tous'},
  {id:'med',label:'Méditerranée'},
  {id:'cors',label:'Corse'},
  {id:'atl',label:'Atlantique'},
  {id:'bre',label:'Bretagne'},
  {id:'man',label:'Manche'},
]

function ventColor(v) {
  if(v < 10) return '#0f6e56'
  if(v < 20) return '#d97706'
  if(v < 30) return '#ef4444'
  return '#7c3aed'
}

function ventLabel(v) {
  if(v < 10) return 'Calme'
  if(v < 20) return 'Brise'
  if(v < 30) return 'Frais'
  return 'Fort'
}

export default function Meteo() {
  const [activeZone, setActiveZone] = useState('all')
  const [activePort, setActivePort] = useState(null)

  const filtered = activeZone === 'all' ? PORTS : PORTS.filter(p => p.zone === activeZone)
  const port = activePort ? PORTS.find(p => p.id === activePort) : null

  return (
    <div className="meteo-page">
      <div className="meteo-topbar">
        <span className="meteo-topbar-title">Cartes & Météo marines</span>
      </div>

      <div className="meteo-content">
        {/* Zones */}
        <div className="meteo-zones">
          {ZONES.map(z => (
            <button key={z.id} className={`meteo-zone ${activeZone===z.id?'active':''}`} onClick={() => setActiveZone(z.id)}>
              {z.label}
            </button>
          ))}
        </div>

        {/* Carte placeholder */}
        <div className="meteo-map">
          <div className="meteo-map-placeholder">
            <div className="meteo-map-icon">🗺️</div>
            <div className="meteo-map-text">Carte marine interactive</div>
            <div className="meteo-map-sub">Leaflet + OpenSeaMap — disponible en production</div>
          </div>
          {/* Pins des ports */}
          <div className="meteo-pins">
            {filtered.map(p => (
              <button key={p.id} className={`meteo-pin ${activePort===p.id?'active':''}`} onClick={() => setActivePort(p.id === activePort ? null : p.id)}>
                <span>{p.meteo}</span>
                <span className="meteo-pin-nom">{p.nom}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Détail port sélectionné */}
        {port && (
          <div className="meteo-detail">
            <div className="meteo-detail-header">
              <span className="meteo-detail-icon">{port.meteo}</span>
              <div>
                <div className="meteo-detail-nom">{port.nom}</div>
                <div className="meteo-detail-zone">{port.zone.toUpperCase()}</div>
              </div>
              <button className="meteo-detail-close" onClick={() => setActivePort(null)}>✕</button>
            </div>
            <div className="meteo-detail-grid">
              <div className="meteo-stat">
                <div className="meteo-stat-val" style={{color:ventColor(port.vent)}}>{port.vent} kts</div>
                <div className="meteo-stat-label">Vent</div>
                <div className="meteo-stat-sub">{ventLabel(port.vent)} · {port.direction}</div>
              </div>
              <div className="meteo-stat">
                <div className="meteo-stat-val">{port.vagues}m</div>
                <div className="meteo-stat-label">Vagues</div>
                <div className="meteo-stat-sub">Hauteur significative</div>
              </div>
              <div className="meteo-stat">
                <div className="meteo-stat-val">{port.temp}°C</div>
                <div className="meteo-stat-label">Température</div>
                <div className="meteo-stat-sub">Air</div>
              </div>
            </div>
          </div>
        )}

        {/* Liste ports */}
        <div className="meteo-list">
          <div className="meteo-list-title">Conditions par port</div>
          {filtered.map(p => (
            <div key={p.id} className={`meteo-row ${activePort===p.id?'active':''}`} onClick={() => setActivePort(p.id === activePort ? null : p.id)}>
              <div className="meteo-row-left">
                <span className="meteo-row-icon">{p.meteo}</span>
                <div>
                  <div className="meteo-row-nom">{p.nom}</div>
                  <div className="meteo-row-sub">{ventLabel(p.vent)} · {p.direction}</div>
                </div>
              </div>
              <div className="meteo-row-right">
                <div className="meteo-row-vent" style={{color:ventColor(p.vent)}}>{p.vent} kts</div>
                <div className="meteo-row-vagues">{p.vagues}m</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
