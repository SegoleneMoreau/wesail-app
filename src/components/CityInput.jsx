import { useState, useRef, useEffect } from 'react'
import './CityInput.css'

// Ports marins français pour compléter l'API
const PORTS = [
  'Marseille — Vieux-Port','Marseille — Pointe-Rouge','Toulon — Port','Bandol',
  'Sanary-sur-Mer','La Ciotat','Cassis','Carry-le-Rouet','Martigues',
  'Saint-Tropez','Sainte-Maxime','Fréjus','Saint-Raphaël','Cannes — Vieux-Port',
  'Antibes — Port Vauban','Nice — Port Lympia','Menton','Villefranche-sur-Mer',
  'Sète','Cap d\'Agde','Palavas-les-Flots','Gruissan','Port-la-Nouvelle','Port-Vendres',
  'Collioure','Bordeaux — Port de la Lune','Arcachon','Bayonne','La Rochelle — Port des Minimes',
  'Rochefort','Royan','Les Sables-d\'Olonne','Saint-Nazaire','Pornichet',
  'La Baule','Le Croisic','Noirmoutier','Brest — Port de Commerce','Camaret-sur-Mer',
  'Douarnenez','Audierne','Concarneau','Lorient','Vannes','La Trinité-sur-Mer',
  'Quiberon','Belle-Île','Saint-Malo','Dinard','Granville','Cherbourg',
  'Paimpol','Roscoff','Le Havre','Fécamp','Dieppe','Caen — Ouistreham',
  'Honfleur','Deauville','Ajaccio','Bastia','Porto-Vecchio','Bonifacio',
  'Propriano','Calvi','Fort-de-France — Martinique','Pointe-à-Pitre — Guadeloupe',
  'Saint-Martin','Saint-Barthélemy','Papeete — Tahiti','Bora Bora','Moorea',
]

function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function CityInput({
  value,
  onChange,
  placeholder = 'Ville ou port...',
  className = '',
  showPortsFirst = false,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    onChange(val)
    setSelected(false)

    if (val.length < 2) {
      setSuggestions([])
      setShow(false)
      return
    }

    // Ports locaux filtrés en priorité
    const localPorts = PORTS
      .filter(p => norm(p).includes(norm(val)))
      .map(p => ({ label: p, type: 'port', icon: '⚓' }))

    // Debounce pour l'API
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(val)}&fields=nom,codesPostaux,codeDepartement&boost=population&limit=8`
        )
        const data = await res.json()
        const cities = data
          .filter(c => !localPorts.some(p => norm(p.label).includes(norm(c.nom))))
          .map(c => ({
            label: `${c.nom}${c.codeDepartement ? ' (' + c.codeDepartement + ')' : ''}`,
            nom: c.nom,
            type: 'ville',
            icon: '📍'
          }))

        // Ports en premier si demandé, sinon villes en premier
        const all = showPortsFirst
          ? [...localPorts.slice(0, 4), ...cities.slice(0, 5)]
          : [...localPorts.slice(0, 3), ...cities.slice(0, 6)]

        setSuggestions(all.slice(0, 8))
        setShow(all.length > 0)
      } catch (err) {
        // Fallback sur ports locaux seulement
        setSuggestions(localPorts.slice(0, 6))
        setShow(localPorts.length > 0)
      }
      setLoading(false)
    }, 200)
  }

  function handleSelect(item) {
    onChange(item.label)
    setSuggestions([])
    setShow(false)
    setSelected(true)
    inputRef.current?.blur()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setShow(false) }
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0])
      e.preventDefault()
    }
  }

  return (
    <div className={`city-input-wrap ${className}`} ref={wrapRef}>
      <div className="city-input-field">
        <span className="city-input-icon">
          {selected ? '✓' : loading ? '⟳' : '📍'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setShow(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`city-input ${selected ? 'valid' : ''}`}
          autoComplete="off"
        />
        {value && (
          <button className="city-input-clear" onClick={() => { onChange(''); setSuggestions([]); setShow(false); setSelected(false) }}>✕</button>
        )}
      </div>

      {show && suggestions.length > 0 && (
        <div className="city-suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className={`city-suggestion ${s.type}`} onMouseDown={() => handleSelect(s)}>
              <span className="city-sug-icon">{s.icon}</span>
              <span className="city-sug-label">{s.label}</span>
              <span className="city-sug-type">{s.type === 'port' ? 'Port' : 'Ville'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}