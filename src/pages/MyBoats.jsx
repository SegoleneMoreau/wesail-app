import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './MyBoats.css'

const TYPES = ['Voilier', 'Catamaran', 'Moteur', 'Semi-rigide', 'Autre']

export default function MyBoats() {
  const [boats, setBoats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [editBoat, setEditBoat] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ nom: '', type: 'Voilier', marque: '', modele: '', longueur_m: '', couchages: '', port_attache: '' })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadBoats(user.id) }
    })
  }, [])

  async function loadBoats(uid) {
    setLoading(true)
    const { data } = await supabase.from('boats').select('*').eq('owner_id', uid).order('created_at', { ascending: false })
    setBoats(data || [])
    setLoading(false)
  }

  function openNew() {
    setForm({ nom: '', type: 'Voilier', marque: '', modele: '', longueur_m: '', couchages: '', port_attache: '' })
    setEditBoat(null)
    setShowNew(true)
  }

  function openEdit(boat) {
    setForm({
      nom: boat.nom || '',
      type: boat.type || 'Voilier',
      marque: boat.marque || '',
      modele: boat.modele || '',
      longueur_m: boat.longueur_m || '',
      couchages: boat.couchages || '',
      port_attache: boat.port_attache || '',
    })
    setEditBoat(boat)
    setShowNew(true)
  }

  async function saveBoat() {
    if (!form.nom) return
    setSaving(true)
    const payload = {
      nom: form.nom,
      type: form.type,
      marque: form.marque || null,
      modele: form.modele || null,
      longueur_m: form.longueur_m ? parseFloat(form.longueur_m) : null,
      couchages: form.couchages ? parseInt(form.couchages) : 0,
      port_attache: form.port_attache || null,
      owner_id: userId,
    }

    if (editBoat) {
      const { data } = await supabase.from('boats').update(payload).eq('id', editBoat.id).select().single()
      if (data) setBoats(bs => bs.map(b => b.id === editBoat.id ? data : b))
    } else {
      const { data } = await supabase.from('boats').insert(payload).select().single()
      if (data) setBoats(bs => [data, ...bs])
    }
    setSaving(false)
    setShowNew(false)
    setEditBoat(null)
  }

  async function deleteBoat(id) {
    await supabase.from('boats').delete().eq('id', id)
    setBoats(bs => bs.filter(b => b.id !== id))
    setDeleteId(null)
  }

  function u(k, v) { setForm(f => ({ ...f, [k]: v })) }

  return (
    <div className="boats-page">
      <div className="boats-topbar">
        <span className="boats-topbar-title">Mes bateaux</span>
        <button className="boats-new-btn" onClick={openNew}>+ Ajouter</button>
      </div>

      <div className="boats-content">
        {loading && <div className="boats-loading">Chargement...</div>}

        {!loading && boats.length === 0 && (
          <div className="boats-empty">
            <div className="boats-empty-icon">⛵</div>
            <p>Vous n'avez pas encore ajouté de bateau.</p>
            <button className="boats-empty-btn" onClick={openNew}>Ajouter mon premier bateau</button>
          </div>
        )}

        {boats.map(b => (
          <div key={b.id} className="boat-card">
            <div className="boat-card-header">
              <div className="boat-icon">⛵</div>
              <div className="boat-card-info">
                <div className="boat-nom">{b.nom}</div>
                <div className="boat-type">{b.type}{b.marque ? ` · ${b.marque}` : ''}{b.modele ? ` ${b.modele}` : ''}</div>
              </div>
              <div className="boat-card-actions">
                <button className="boat-btn-edit" onClick={() => openEdit(b)}>✏️</button>
                <button className="boat-btn-del" onClick={() => setDeleteId(b.id)}>🗑</button>
              </div>
            </div>
            <div className="boat-card-details">
              {b.longueur_m && <span>📏 {b.longueur_m}m</span>}
              {b.couchages > 0 && <span>🛏 {b.couchages} couchages</span>}
              {b.port_attache && <span>📍 {b.port_attache}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal ajout/édition */}
      {showNew && (
        <div className="boats-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="boats-modal" onClick={e => e.stopPropagation()}>
            <div className="boats-modal-title">{editBoat ? 'Modifier le bateau' : 'Ajouter un bateau'}</div>
            <div className="boats-modal-field"><label>Nom du bateau *</label>
              <input value={form.nom} onChange={e => u('nom', e.target.value)} placeholder="ex: Libertad" />
            </div>
            <div className="boats-modal-field"><label>Type</label>
              <select value={form.type} onChange={e => u('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="boats-modal-row">
              <div className="boats-modal-field"><label>Marque</label>
                <input value={form.marque} onChange={e => u('marque', e.target.value)} placeholder="ex: Jeanneau" />
              </div>
              <div className="boats-modal-field"><label>Modèle</label>
                <input value={form.modele} onChange={e => u('modele', e.target.value)} placeholder="ex: Sun Odyssey 40" />
              </div>
            </div>
            <div className="boats-modal-row">
              <div className="boats-modal-field"><label>Longueur (m)</label>
                <input type="number" value={form.longueur_m} onChange={e => u('longueur_m', e.target.value)} placeholder="ex: 12" />
              </div>
              <div className="boats-modal-field"><label>Couchages</label>
                <input type="number" value={form.couchages} onChange={e => u('couchages', e.target.value)} placeholder="ex: 4" />
              </div>
            </div>
            <div className="boats-modal-field"><label>Port d'attache</label>
              <input value={form.port_attache} onChange={e => u('port_attache', e.target.value)} placeholder="ex: Marseille — Vieux-Port" />
            </div>
            <div className="boats-modal-btns">
              <button className="boats-modal-cancel" onClick={() => setShowNew(false)}>Annuler</button>
              <button className="boats-modal-save" disabled={!form.nom || saving} onClick={saveBoat}>
                {saving ? 'Enregistrement...' : editBoat ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteId && (
        <div className="boats-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="boats-modal" onClick={e => e.stopPropagation()}>
            <div className="boats-modal-title">Supprimer ce bateau ?</div>
            <p style={{ fontSize: 14, color: '#6b7e94', margin: '0 0 16px' }}>Cette action est irréversible.</p>
            <div className="boats-modal-btns">
              <button className="boats-modal-cancel" onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="boats-modal-save" style={{ background: '#ef4444' }} onClick={() => deleteBoat(deleteId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}