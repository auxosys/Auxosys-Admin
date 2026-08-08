import React, { useState, useEffect, useCallback } from 'react';
import ColorEngine from './ColorEngine';
import RichTextEditor from '../../Components/RichTextEditor';
import { listSignatures, createCertificate, updateCertificate, getCertificate } from '../../helper/certificatesApi';
import LiveCertificatePreview from './LiveCertificatePreview';

const CERT_TYPES = [
  { value: 'internship', label: 'Internship', defaultTitle: 'Certificate of Completion', defaultEyebrow: 'Certificate of Internship' },
  { value: 'agreement', label: 'Agreement', defaultTitle: 'Letter of Agreement', defaultEyebrow: 'Certificate of Agreement' },
  { value: 'achievement', label: 'Achievement', defaultTitle: 'Certificate of Excellence', defaultEyebrow: 'Certificate of Achievement' },
  { value: 'custom', label: 'Custom / other', defaultTitle: '', defaultEyebrow: '' },
];

const DEFAULT_COLOR = { type: 'solid', colors: ['#14B8A6'], logoColor: 'auto' };

export default function CertificateGenerator({ canWrite = true, editId = null, onGenerated }) {
  const [certType, setCertType] = useState('internship');
  const [customType, setCustomType] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [eyebrow, setEyebrow] = useState(CERT_TYPES[0].defaultEyebrow);
  const [title, setTitle] = useState(CERT_TYPES[0].defaultTitle);
  const [presentedLine, setPresentedLine] = useState('This is proudly presented to');
  const [bodyHtml, setBodyHtml] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [colorConfig, setColorConfig] = useState(DEFAULT_COLOR);

  const [signatures, setSignatures] = useState([]);
  const [selectedSignatureIds, setSelectedSignatureIds] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    listSignatures(true).then(({ signatures }) => setSignatures(signatures)).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      setGenerating(true);
      getCertificate(editId).then((cert) => {
        setCertType(cert.cert_type === 'Custom' ? 'custom' : cert.cert_type);
        if (cert.cert_type === 'Custom') setCustomType(cert.cert_type);
        setRecipientName(cert.recipient_name || '');
        setRecipientEmail(cert.recipient_email || '');
        setEyebrow(cert.fields?.eyebrow || '');
        setTitle(cert.fields?.title || '');
        setPresentedLine(cert.fields?.presentedLine || '');
        setBodyHtml(cert.fields?.bodyHtml || '');
        setEmployeeId(cert.fields?.employeeId || '');
        if (cert.color_config) setColorConfig(cert.color_config);
        if (cert.signatures) setSelectedSignatureIds(cert.signatures.map(s => s.signature_id || s.id));
      }).catch(err => {
        setError('Failed to fetch certificate for editing.');
      }).finally(() => {
        setGenerating(false);
      });
    }
  }, [editId]);

  const handleTypeChange = (value) => {
    setCertType(value);
    const preset = CERT_TYPES.find((t) => t.value === value);
    if (preset) {
      setEyebrow(preset.defaultEyebrow);
      setTitle(preset.defaultTitle);
    }
  };

  const buildPayload = useCallback(() => {
    const chosenSignatures = signatures
      .filter((s) => selectedSignatureIds.includes(s.id))
      .map((s) => ({ name: s.name, designation: s.designation, image_url: s.image_url }));

    return {
      cert_type: certType === 'custom' ? (customType || 'Custom') : certType,
      recipient_name: recipientName || 'Recipient Name',
      recipient_email: recipientEmail || undefined,
      fields: { eyebrow, title, presentedLine, bodyHtml, employeeId },
      color_config: colorConfig,
      signatures: chosenSignatures,
      signature_ids: selectedSignatureIds,
      issue_date: issueDate || undefined,
    };
  }, [certType, customType, recipientName, recipientEmail, eyebrow, title, presentedLine, bodyHtml, employeeId, colorConfig, signatures, selectedSignatureIds, issueDate]);



  const toggleSignature = (id) => {
    setSelectedSignatureIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGenerate = async () => {
    if (!recipientName || !title) {
      setError('Recipient name and title are required.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = editId 
        ? await updateCertificate(editId, buildPayload())
        : await createCertificate(buildPayload());
      setResult(res);
      onGenerated && onGenerated(res.certificate || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="cert-gen">
      <style>{`
        .cert-gen { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        .cg-form { display: flex; flex-direction: column; gap: 18px; }
        .cg-section { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; }
        .cg-section h4 { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.04em; }
        .cg-field { margin-bottom: 12px; }
        .cg-field:last-child { margin-bottom: 0; }
        .cg-field label { display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .cg-field input, .cg-field select, .cg-field textarea {
          width: 100%; border: 1px solid #E2E8F0; border-radius: 8px; padding: 9px 12px; font-size: 13.5px;
          box-sizing: border-box; font-family: inherit;
        }
        .cg-field textarea { resize: vertical; min-height: 90px; }
        .cg-sig-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .cg-sig-chip {
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center;
          font-size: 11.5px; background: #FFFFFF;
        }
        .cg-sig-chip img { height: 28px; margin-bottom: 4px; }
        .cg-sig-chip.selected { border-color: #14B8A6; background: #EAFAF7; }
        .cg-preview-wrap { position: sticky; top: 20px; }
        .cg-preview-frame {
          background: #F1F5F9; border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: center;
          aspect-ratio: 1122 / 793;
        }
        .cg-preview-frame img { width: 100%; height: 100%; object-fit: contain; border-radius: 4px; box-shadow: 0 12px 30px -14px rgba(15,23,42,0.3); }
        .cg-generate-btn {
          width: 100%; margin-top: 14px; padding: 13px; border-radius: 10px; border: none;
          background: #14B8A6; color: #FFFFFF; font-weight: 700; font-size: 14.5px; cursor: pointer;
        }
        .cg-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cg-result { margin-top: 14px; background: #EAFAF7; border: 1px solid #99F0DE; border-radius: 10px; padding: 16px; font-size: 13px; }
        .cg-result a { color: #0C8074; font-weight: 700; }
        .cg-error { color: #DC2626; font-size: 13px; margin-top: 10px; }
      `}</style>

      {canWrite && (
        <div className="cg-form">
          <div className="cg-section">
            <h4>Certificate type &amp; recipient</h4>
          <div className="cg-field">
            <label>Type</label>
            <select value={certType} onChange={(e) => handleTypeChange(e.target.value)}>
              {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {certType === 'custom' && (
            <div className="cg-field">
              <label>Custom type name</label>
              <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="e.g. Masterclass" />
            </div>
          )}
          <div className="cg-field">
            <label>Recipient name</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Ananya Sharma" />
          </div>
          <div className="cg-field">
            <label>Recipient email (optional — for delivery later)</label>
            <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="ananya@example.com" />
          </div>
        </div>

        <div className="cg-section">
          <h4>Content — edit anything</h4>
          <div className="cg-field">
            <label>Eyebrow tag (small label above title)</label>
            <input type="text" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </div>
          <div className="cg-field">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="cg-field">
            <label>Presented line</label>
            <input type="text" value={presentedLine} onChange={(e) => setPresentedLine(e.target.value)} />
          </div>
          <div className="cg-field">
            <label>Employee ID (optional)</label>
            <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. EMP-204" />
          </div>
          <div className="cg-field">
            <label>Issue Date (optional, defaults to today)</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="cg-field">
            <label>Body text</label>
            <div className="mt-2" style={{ maxWidth: '600px' }}>
              <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
            </div>
          </div>
          <div className="cg-field" style={{ marginTop: '16px' }}>
            <label>Logo &amp; Brand Text Color</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setColorConfig({ ...colorConfig, logoColor: 'auto' })}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1.5px solid ${colorConfig.logoColor === 'auto' ? '#14B8A6' : '#E2E8F0'}`, background: colorConfig.logoColor === 'auto' ? '#EAFAF7' : '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >Auto</button>
              <button 
                type="button"
                onClick={() => setColorConfig({ ...colorConfig, logoColor: 'white' })}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1.5px solid ${colorConfig.logoColor === 'white' ? '#14B8A6' : '#E2E8F0'}`, background: colorConfig.logoColor === 'white' ? '#EAFAF7' : '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >White</button>
              <button 
                type="button"
                onClick={() => setColorConfig({ ...colorConfig, logoColor: 'dark' })}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1.5px solid ${colorConfig.logoColor === 'dark' ? '#14B8A6' : '#E2E8F0'}`, background: colorConfig.logoColor === 'dark' ? '#EAFAF7' : '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >Dark (Black)</button>
            </div>
          </div>
        </div>

        <div className="cg-section">
          <h4>Signatures ({selectedSignatureIds.length} selected)</h4>
          {signatures.length === 0 ? (
            <p style={{ fontSize: 12.5, color: '#64748B' }}>No signatures in the library yet — add one from the Signature Library tab.</p>
          ) : (
            <div className="cg-sig-grid">
              {signatures.map((s) => (
                <div
                  key={s.id}
                  className={`cg-sig-chip ${selectedSignatureIds.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleSignature(s.id)}
                >
                  <img src={s.image_url} alt={s.name} />
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
                  <div style={{ color: '#64748B' }}>{s.designation}</div>
                </div>
              ))}
            </div>
          )}
        </div>

          {error && <p className="cg-error">{error}</p>}
        </div>
      )}

      <div className="cg-preview-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gridColumn: canWrite ? 'auto' : '1 / -1' }}>
        {!canWrite && (
          <div className="mb-4 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm w-full font-medium">
            You are viewing the Certificate Engine in Read-Only mode. 
          </div>
        )}
        <div className="cg-preview-frame" style={{ width: '100%', maxWidth: canWrite ? '100%' : '800px' }}>
          <LiveCertificatePreview 
            certType={certType === 'Custom' ? customType : certType}
            recipientName={recipientName}
            certificateNumber="PREVIEW"
            signatures={signatures.filter(s => selectedSignatureIds.includes(s.id)).map(s => ({ name: s.name, designation: s.designation, image_url: s.image_url }))}
            fields={{ eyebrow, title, presentedLine, bodyHtml, employeeId }}
            colorConfig={colorConfig}
          />
        </div>
        
        {canWrite && (
          <>
              <button 
                className="cg-generate-btn" 
                onClick={handleGenerate} 
                disabled={generating || signatures.length === 0}
              >
                {generating ? 'Processing...' : editId ? 'Update Certificate' : 'Generate Secure Certificate'}
              </button>

            <div className="cg-section" style={{ marginTop: '32px', width: '100%' }}>
              <h4 style={{ textAlign: 'center' }}>Panel color</h4>
              <ColorEngine value={colorConfig} onChange={setColorConfig} />
            </div>
          </>
        )}

        {result && (
          <div className="cg-result">
            <div><strong>Certificate #{result.certificate.certificate_number}</strong> generated.</div>
            <div style={{ marginTop: 6 }}>
              <a href={result.certificate.pdf_url} target="_blank" rel="noreferrer">Download PDF</a>
              {' · '}
              <a href={result.verify_url} target="_blank" rel="noreferrer">View verification page</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
