import React from 'react';

const replaceVars = (text, data) => {
  if (!text) return "";
  return text
    .replace(/\{\{job\.title\}\}/g, data.jobTitle || "")
    .replace(/\{\{company\.legal_company_name\}\}/g, data.legalCompanyName || "")
    .replace(/\{\{job\.department\}\}/g, data.jobDepartment || "")
    .replace(/\{\{job\.joining_date\}\}/g, data.joiningDate || "")
    .replace(/\{\{job\.work_mode\}\}/g, data.workMode || "")
    .replace(/\{\{compensation\.annual_ctc\}\}/g, data.ctcAmount || "")
    .replace(/\{\{compensation\.currency\}\}/g, data.currency || "")
    .replace(/\{\{job\.reporting_manager\}\}/g, data.reportingManager || "");
};

export default function LiveDetailedPreview({ formState }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Calculate initial scale to fit width
    setScale(Math.min(containerRef.current.offsetWidth / 780, 1));

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setScale(Math.min(width / 780, 1));
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const {
    companyName,
    legalCompanyName,
    companyEmail,
    companyWebsite,
    companyAddress,
    candidateName,
    candidateAddress,
    candidateCity,
    candidateState,
    candidatePin,
    offerDate,
    signatoryName,
    signatoryDesignation,
    signatureUrl,
    letterTitle,
    clauses
  } = formState;

  const activeClauses = (clauses || []).filter(c => c.isActive);

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 780 * scale, height: 'auto', minHeight: 1123 * scale }}>
        <div 
          className="ol-preview-container shadow-lg"
          style={{
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            width: '780px',
            minHeight: '1123px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#232a33',
            lineHeight: 1.55,
            fontSize: '13.5px',
            borderRadius: '4px',
            padding: '60px 58px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            borderBottom: '3px solid #1f4b6e', 
            paddingBottom: '14px', 
            marginBottom: '22px'
          }}>
            <div style={{ fontFamily: '-apple-system, sans-serif' }}>
              <b style={{ fontSize: '19px', color: '#1f4b6e', letterSpacing: '0.4px' }}>{companyName}</b>
              <div style={{ fontSize: '10.5px', color: '#6b7480', marginTop: '2px', maxWidth: '260px' }}>{legalCompanyName}</div>
              <div style={{ fontSize: '10.5px', color: '#6b7480', marginTop: '2px', maxWidth: '260px' }}>{companyAddress}</div>
              <div style={{ fontSize: '10.5px', color: '#6b7480', marginTop: '2px', maxWidth: '260px' }}>
                {companyWebsite} {companyEmail ? `· ${companyEmail}` : ""}
              </div>
            </div>
            <div style={{ fontFamily: '-apple-system, sans-serif', textAlign: 'right', fontSize: '10px', color: '#9aa1ab', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Offer Letter
              <b style={{ display: 'block', fontSize: '14px', color: '#1c2430', letterSpacing: '0', marginTop: '3px' }}>{letterTitle}</b>
            </div>
          </div>

          {/* Date & To */}
          <div style={{ fontSize: '12.5px', color: '#5a6472', marginBottom: '16px', fontFamily: '-apple-system, sans-serif' }}>
            {offerDate}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <b style={{ fontSize: '15px' }}>{candidateName}</b>
            <div style={{ fontSize: '12.5px', color: '#5a6472' }}>
              {candidateAddress && <>{candidateAddress}<br/></>}
              {candidateCity && <>{candidateCity}, {candidateState} {candidatePin}</>}
            </div>
          </div>

          <p>Dear {candidateName.split(" ")[0]},</p>
          <p style={{ color: '#1f4b6e', fontWeight: 700, fontSize: '15px', margin: '14px 0 6px' }}>Congratulations!</p>
          <p>We are delighted to extend to you an offer to join <b>{legalCompanyName}</b>, a company committed to innovation, integrity, and excellence. Your skills and enthusiasm made a strong impression on our team, and this letter sets out the terms of your engagement &mdash; this document constitutes a binding agreement upon your acceptance.</p>

          {/* Clauses */}
          <div className="ol-clauses" style={{ marginTop: '22px' }}>
            {activeClauses.map((clause, index) => (
              <div key={clause.id}>
                <h3 style={{ fontSize: '14.5px', color: '#1f4b6e', borderBottom: '1px solid #dde2e8', paddingBottom: '5px', margin: '22px 0 10px', fontFamily: '-apple-system, sans-serif' }}>
                  {clause.title}
                </h3>
                <div 
                  className="clause-content"
                  style={{ textAlign: 'justify' }}
                  dangerouslySetInnerHTML={{ __html: replaceVars(clause.content, formState) }} 
                />
              </div>
            ))}
          </div>

          {/* Accept Box */}
          <div style={{ border: '1px solid #dde2e8', borderRadius: '8px', padding: '14px 16px', marginTop: '18px', background: '#fbfbfc' }}>
            <b>Candidate Acceptance</b>
            <p style={{ margin: '8px 0 0' }}>I accept the terms and conditions described in this offer letter.</p>
            <div style={{ borderBottom: '1px solid #c8ccd2', height: '22px', marginTop: '14px' }}></div>
            <div style={{ fontSize: '10.5px', color: '#8b93a0', marginTop: '2px' }}>Candidate Signature &nbsp;&nbsp;&nbsp;&nbsp; Date</div>
          </div>

          {/* Signature Block */}
          <div style={{ marginTop: '26px', fontSize: '13px', position: 'relative' }}>
            Sincerely,
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature" style={{ height: '52px', display: 'block', margin: '10px 0 2px' }} />
            ) : (
              <div style={{ borderBottom: '1px solid #232a33', width: '220px', margin: '34px 0 6px' }}></div>
            )}
            <b>{signatoryName}</b><br/>
            {signatoryDesignation}<br/>
            {companyName}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #dde2e8', fontSize: '9.5px', color: '#9aa1ab', fontFamily: '-apple-system, sans-serif' }}>
            {legalCompanyName}<br/>
            {companyAddress} &middot; {companyWebsite} {companyEmail ? `&middot; ${companyEmail}` : ""}
          </div>

        </div>
      </div>
      
      <style>{`
        .clause-content p { margin: 0 0 10px 0; }
        .clause-content p:last-child { margin-bottom: 0; }
        .clause-content ul { margin: 8px 0 12px 0; padding-left: 20px; }
        .clause-content li { margin-bottom: 6px; }
      `}</style>
    </div>
  );
}
