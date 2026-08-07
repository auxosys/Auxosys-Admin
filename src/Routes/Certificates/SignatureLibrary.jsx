import React, { useState, useEffect, useCallback } from 'react';
import { listSignatures, uploadSignature, reprocessSignature, deleteSignature } from '../../helper/certificatesApi';

export default function SignatureLibrary() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editingSig, setEditingSig] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { signatures } = await listSignatures(true);
      setSignatures(signatures);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteSignature(deleteConfirmId);
    setDeleteConfirmId(null);
    load();
  };

  return (
    <div className="sig-lib">
      <style>{`
        .sig-lib-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .sig-lib-head h2 { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0; }
        .sig-lib-add {
          background: #0F172A; color: #FFFFFF; border: none; border-radius: 8px;
          padding: 10px 18px; font-size: 13.5px; font-weight: 600; cursor: pointer;
        }
        .sig-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .sig-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; }
        .sig-preview {
          height: 90px; background: #F8FAFC repeating-conic-gradient(#EEF2F7 0% 25%, transparent 0% 50%) 0 0/16px 16px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
        }
        .sig-preview img { max-height: 70px; max-width: 90%; }
        .sig-name { font-size: 14px; font-weight: 700; color: #0F172A; }
        .sig-role { font-size: 12px; color: #64748B; margin-bottom: 10px; }
        .sig-actions { display: flex; gap: 8px; }
        .sig-actions button {
          flex: 1; font-size: 12px; padding: 6px; border-radius: 6px; border: 1px solid #E2E8F0;
          background: #F8FAFC; cursor: pointer; color: #475569;
        }
        .sig-actions button.danger { color: #DC2626; border-color: #FCA5A5; background: #FEF2F2; }
        .sig-empty { text-align: center; padding: 60px 20px; color: #64748B; font-size: 14px; }
        
        /* Modal Styles */
        .sig-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .sig-modal { background: #FFFFFF; border-radius: 14px; padding: 28px; width: 420px; max-width: 92vw; }
        .sig-modal h3 { font-size: 17px; font-weight: 700; color: #0F172A; margin: 0 0 18px; }
        .sig-field { margin-bottom: 14px; }
        .sig-field label { display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .sig-field input[type="text"] {
          width: 100%; border: 1px solid #E2E8F0; border-radius: 8px; padding: 9px 12px; font-size: 13.5px; box-sizing: border-box;
        }
        .sig-drop {
          display: block; border: 1.5px dashed #CBD5E1; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer;
          background: #F8FAFC; margin-bottom: 14px; box-sizing: border-box;
        }
        .sig-drop img { max-height: 80px; max-width: 100%; }
        .sig-drop p { font-size: 12.5px; color: #64748B; margin: 0; }
        .sig-modal-actions { display: flex; gap: 10px; margin-top: 8px; }
        .sig-modal-actions button {
          flex: 1; padding: 11px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none;
        }
        .sig-btn-cancel { background: #F1F5F9; color: #475569; }
        .sig-btn-submit { background: #0F172A; color: #FFFFFF; }
        .sig-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="sig-lib-head">
        <h2>Signature Library</h2>
        <button className="sig-lib-add" onClick={() => { setEditingSig(null); setShowUpload(true); }}>+ Add signature</button>
      </div>

      {error && <p style={{ color: '#DC2626', fontSize: 13 }}>{error}</p>}
      {loading ? (
        <p style={{ color: '#64748B', fontSize: 14 }}>Loading…</p>
      ) : signatures.length === 0 ? (
        <div className="sig-empty">No signatures yet. Add one to reuse it across every certificate.</div>
      ) : (
        <div className="sig-grid">
          {signatures.map((sig) => (
            <div className="sig-card" key={sig.id}>
              <div className="sig-preview"><img src={sig.image_url} alt={sig.name} /></div>
              <div className="sig-name">{sig.name}</div>
              <div className="sig-role">{sig.designation}{sig.department ? ` · ${sig.department}` : ''}</div>
              <div className="sig-actions">
                <button onClick={() => { setEditingSig(sig); setShowUpload(true); }}>Reprocess</button>
                <button className="danger" onClick={() => setDeleteConfirmId(sig.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && <UploadModal editingSig={editingSig} onClose={() => { setShowUpload(false); setEditingSig(null); }} onDone={() => { setShowUpload(false); setEditingSig(null); load(); }} />}
      
      {deleteConfirmId && (
        <div className="sig-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="sig-modal" onClick={(e) => e.stopPropagation()} style={{ width: '360px' }}>
            <h3 style={{ marginBottom: '8px' }}>Delete signature?</h3>
            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 20px', lineHeight: '1.5' }}>
              Remove this signature from the library? Certificates already issued with it will keep their copy.
            </p>
            <div className="sig-modal-actions">
              <button className="sig-btn-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="sig-btn-submit" style={{ background: '#DC2626' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({ editingSig, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(editingSig ? editingSig.image_url : null);
  const [name, setName] = useState(editingSig ? editingSig.name : '');
  const [designation, setDesignation] = useState(editingSig ? editingSig.designation : '');
  const [department, setDepartment] = useState(editingSig && editingSig.department ? editingSig.department : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSig && !file) return;
    if (!name || !designation) return;
    setBusy(true);
    setError(null);
    try {
      if (editingSig && !file) {
        // Just reprocess or update details
        await reprocessSignature(editingSig.id, { name, designation, department });
      } else {
        await uploadSignature({ file, name, designation, department });
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sig-modal-overlay" onClick={onClose}>
      <div className="sig-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editingSig ? 'Reprocess signature' : 'Add signature'}</h3>
        <form onSubmit={handleSubmit}>
          <label className="sig-drop" htmlFor="sig-file-input">
            {preview ? <img src={preview} alt="preview" /> : (
              <p>Click to upload a photo of the signature<br/>(dark ink on light paper works best)</p>
            )}
            {editingSig && <p style={{ marginTop: '8px' }}>Click to upload a new image instead</p>}
          </label>
          <input
            id="sig-file-input" type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          <div className="sig-field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pritam Das" required />
          </div>
          <div className="sig-field">
            <label>Designation</label>
            <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Founder & CEO" required />
          </div>
          <div className="sig-field">
            <label>Department (optional)</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Leadership" />
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 12.5 }}>{error}</p>}

          <div className="sig-modal-actions">
            <button type="button" className="sig-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="sig-btn-submit" disabled={busy || (!editingSig && !file)}>
              {busy ? 'Processing…' : editingSig ? 'Update & reprocess' : 'Upload & process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
