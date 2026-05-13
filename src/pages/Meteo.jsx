import { useState, useEffect, useRef } from 'react'
import './Meteo.css'

const PORTS = [
  { name: 'Marseille', lat: 43.296, lng: 5.381, region: 'Méditerranée' },
  { name: 'Toulon', lat: 43.124, lng: 5.928, region: 'Méditerranée' },
  { name: 'Nice', lat: 43.696, lng: 7.271, region: 'Méditerranée' },
  { name: 'Antibes', lat: 43.584, lng: 7.128, region: 'Méditerranée' },
  { name: 'Ajaccio', lat: 41.919, lng: 8.738, region: 'Corse' },
  { name: 'Bastia', lat: 42.702, lng: 9.451, region: 'Corse' },
  { name: 'Porto-Vecchio', lat: 41.590, lng: 9.279, region: 'Corse' },
  { name: 'Brest', lat: 48.390, lng: -4.486, region: 'Bretagne' },
  { name: 'Lorient', lat: 47.748, lng: -3.366, region: 'Bretagne' },
  { name: 'La Rochelle', lat: 46.160, lng: -1.151, region: 'Atlantique' },
  { name: 'Bordeaux', lat: 44.837, lng: -0.579, region: 'Atlantique' },
  { name: 'Saint-Malo', lat: 48.649, lng: -2.026, region: 'Manche' },
  { name: 'Cherbourg', lat: 49.634, lng: -1.622, region: 'Manche' },
  { name: 'Le Havre', lat: 49.494, lng: 0.107, region: 'Manche' },
]

const LAYERS = [
  { id: 'wind', label: '💨 Vent', color: '#185fa5' },
  { id: 'waves', label: '🌊 Vagues', color: '#0891b2' },
  { id: 'rain', label: '🌧 Pluie', color: '#7c3aed' },
  { id: 'temp', label: '🌡 Température', color: '#d97706' },
  { id: 'pressure', label: '📊 Pression', color: '#0f6e56' },
]

export default function Meteo() {
  const [selectedPort, setSelectedPort] = useState(PORTS[0])
  const [activeLayer, setActiveLayer] = useState('wind')
  const [search, setSearch] = useState('')
  const iframeRef = useRef(null)

  const filteredPorts = PORTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.region.toLowerCase().includes(search.toLowerCase())
  )

  // URL Windy embed avec les paramètres
  const windyUrl = `https://embed.windy.com/embed2.html?lat=${selectedPort.lat}&lon=${selectedPort.lng}&detailLat=${selectedPort.lat}&detailLon=${selectedPort.lng}&width=650&height=450&zoom=8&level=surface&overlay=${activeLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`

  return (
    <div className="meteo-page">
      <div className="meteo-topbar">
        <span className="meteo-topbar-title">Météo Marine</span>
      </div>

      <div className="meteo-layout">
        {/* Sidebar ports */}
        <div className="meteo-sidebar">
          <div className="meteo-search-wrap">
            <input
              className="meteo-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un port..."
            />
          </div>
          <div className="meteo-ports-list">
            {filteredPorts.map(p => (
              <button
                key={p.name}
                className={`meteo-port-btn ${selectedPort.name === p.name ? 'active' : ''}`}
                onClick={() => setSelectedPort(p)}
              >
                <div className="meteo-port-name">📍 {p.name}</div>
                <div className="meteo-port-region">{p.region}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Carte et couches */}
        <div className="meteo-main">
          {/* Couches */}
          <div className="meteo-layers">
            {LAYERS.map(l => (
              <button
                key={l.id}
                className={`meteo-layer-btn ${activeLayer === l.id ? 'active' : ''}`}
                style={activeLayer === l.id ? { background: l.color + '22', borderColor: l.color, color: l.color } : {}}
                onClick={() => setActiveLayer(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Carte Windy */}
          <div className="meteo-map-wrap">
            <iframe
              ref={iframeRef}
              key={`${selectedPort.name}-${activeLayer}`}
              src={windyUrl}
              className="meteo-windy-iframe"
              frameBorder="0"
              title={`Météo ${selectedPort.name}`}
              allowFullScreen
            />
          </div>

          {/* Info port sélectionné */}
          <div className="meteo-port-info">
            <div className="meteo-port-info-name">📍 {selectedPort.name}</div>
            <div className="meteo-port-info-region">{selectedPort.region}</div>
            <div className="meteo-port-info-coords">{selectedPort.lat.toFixed(3)}°N · {selectedPort.lng.toFixed(3)}°{selectedPort.lng >= 0 ? 'E' : 'W'}</div>
            <a
              className="meteo-windy-link"
              href={`https://www.windy.com/${selectedPort.lat}/${selectedPort.lng}?${activeLayer}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir dans Windy ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}