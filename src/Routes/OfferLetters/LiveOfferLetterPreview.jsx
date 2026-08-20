import React from 'react';

const replaceVars = (text, data) => {
  if (!text) return "";

  const valueMap = {
    'job.title': data.jobTitle,
    'company.legal_company_name': data.legalCompanyName,
    'job.department': data.jobDepartment,
    'job.joining_date': data.joiningDate,
    'job.work_mode': data.workMode,
    'compensation.annual_ctc': data.ctcAmount,
    'compensation.currency': data.currency,
    'job.reporting_manager': data.reportingManager
  };

  // Remove any block element (li, p, div) that contains a mustache variable which is empty
  let processedText = text.replace(/<(li|p|div)[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
    const vars = match.match(/\{\{([^}]+)\}\}/g);
    if (vars) {
      for (let v of vars) {
        const varName = v.replace(/[{}]/g, '').trim();
        if (valueMap.hasOwnProperty(varName) && !valueMap[varName]) {
          return ""; // Omit the entire block
        }
      }
    }
    return match;
  });

  return processedText
    .replace(/\{\{job\.title\}\}/g, data.jobTitle || "")
    .replace(/\{\{company\.legal_company_name\}\}/g, data.legalCompanyName || "")
    .replace(/\{\{job\.department\}\}/g, data.jobDepartment || "")
    .replace(/\{\{job\.joining_date\}\}/g, data.joiningDate || "")
    .replace(/\{\{job\.work_mode\}\}/g, data.workMode || "")
    .replace(/\{\{compensation\.annual_ctc\}\}/g, data.ctcAmount || "")
    .replace(/\{\{compensation\.currency\}\}/g, data.currency || "")
    .replace(/\{\{job\.reporting_manager\}\}/g, data.reportingManager || "");
};

export default function LiveOfferLetterPreview({ formState }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial scale (safeguard)
    setScale(Math.min(containerRef.current.offsetWidth / 794, containerRef.current.offsetHeight / 1123));

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Calculate scale to fit BOTH width and height constraints
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        const scaleX = width / 794;
        const scaleY = height / 1123;
        
        // Use the smaller scale so the A4 aspect ratio fully fits within the container
        setScale(Math.min(scaleX, scaleY));
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract all the fields from formState
  const {
    companyName,
    legalCompanyName,
    companyEmail,
    companyWebsite,
    companyAddress,
    logoUrl,
    candidateName,
    candidateAddress,
    candidateCity,
    candidateState,
    candidatePin,
    offerDate,
    signatoryName,
    signatoryDesignation,
    signatureUrl,
    offerIntroduction,
    offerDetails,
    closingStatement,
    letterTitle,
    titleSize,
    headingSize,
    bodySize,
    listSize,
    contactSize,
    signatureSize
  } = formState;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 794 * scale, height: 1123 * scale }}>
        <div 
          className="ol-preview-container shadow-lg"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '794px', height: '1123px',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            background: '#ffffff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
            color: '#101828',
            borderRadius: '4px'
          }}
        >
          {/* Watermark */}
          {/* Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '680px', height: '680px', opacity: 0.15, pointerEvents: 'none', zIndex: 1 }}>

            <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(100,103)">
                <path d="M -56 -7 A 58 58 0 1 1 43 45" fill="none" stroke="#081826" strokeWidth="1.2" opacity="0.5" />
                <line x1="-6" y1="-42" x2="36" y2="16" stroke="#081826" strokeWidth="5.2" strokeLinecap="round" />
                <line x1="36" y1="16" x2="-33" y2="29" stroke="#081826" strokeWidth="5.2" strokeLinecap="round" />
                <line x1="-33" y1="29" x2="-6" y2="-42" stroke="#081826" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                <circle cx="-6" cy="-42" r="10" fill="#081826" />
                <circle cx="36" cy="16" r="14.5" fill="#081826" />
                <circle cx="-33" cy="29" r="7.3" fill="#081826" />
                <circle cx="43" cy="45" r="3.6" fill="#081826" />
              </g>
            </svg>

          </div>

          {/* Corner Decors */}
          <div style={{ position: 'absolute', width: 300, height: 300, top: -2, left: -2, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 460, height: 460, top: -230, left: -230, background: 'radial-gradient(circle at 65% 35%, #223349 0%, #101828 60%, #0b1119 100%)' }}></div>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 375, height: 375, top: -150, left: -188, background: 'linear-gradient(135deg, #20B2AA 0%, #2fd0c7 100%)' }}></div>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 320, height: 320, top: -132, left: -162, background: 'radial-gradient(circle at 60% 30%, #26374f 0%, #101828 65%, #0b1119 100%)' }}></div>
          </div>

          <div style={{ position: 'absolute', width: 300, height: 300, bottom: -2, right: -2, overflow: 'hidden', pointerEvents: 'none', zIndex: 3, transform: 'rotate(180deg)' }}>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 460, height: 460, top: -230, left: -230, background: 'radial-gradient(circle at 65% 35%, #223349 0%, #101828 60%, #0b1119 100%)' }}></div>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 375, height: 375, top: -150, left: -188, background: 'linear-gradient(135deg, #20B2AA 0%, #2fd0c7 100%)' }}></div>
            <div style={{ position: 'absolute', borderRadius: '50%', width: 320, height: 320, top: -132, left: -162, background: 'radial-gradient(circle at 60% 30%, #26374f 0%, #101828 65%, #0b1119 100%)' }}></div>
          </div>

          {/* Header */}
          <div style={{ position: 'relative', zIndex: 2, padding: '44px 44px 26px 44px', minHeight: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: -44 }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ height: 56, objectFit: 'contain' }} />
              ) : (
                <>
                  <svg viewBox="0 0 200 200" style={{ width: 56, height: 56, flex: 'none' }} xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(100,103)">
                      <path d="M -56 -7 A 58 58 0 1 1 43 45" fill="none" stroke="#F8FAFC" strokeWidth="1.2" opacity="0.5"/>
                      <line x1="-6" y1="-42" x2="36" y2="16" stroke="#F8FAFC" strokeWidth="5.2" strokeLinecap="round"/>
                      <line x1="36" y1="16" x2="-33" y2="29" stroke="#F8FAFC" strokeWidth="5.2" strokeLinecap="round"/>
                      <line x1="-33" y1="29" x2="-6" y2="-42" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                      <circle cx="-6" cy="-42" r="10" fill="#F8FAFC"/>
                      <circle cx="36" cy="16" r="14.5" fill="#F8FAFC"/>
                      <circle cx="-33" cy="29" r="7.3" fill="#F8FAFC"/>
                      <circle cx="43" cy="45" r="3.6" fill="#F8FAFC"/>
                    </g>
                  </svg>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 19, lineHeight: 1.2 }}>{companyName}</div>
                </>
              )}
            </div>

            <div style={{ position: 'absolute', right: 44, top: 44, textAlign: 'right', color: '#101828', fontSize: contactSize, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{legalCompanyName}</div>
              {companyAddress}<br/>
              {companyWebsite}, {companyEmail}
            </div>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, padding: '10px 44px 0 44px', flex: 1, color: '#101828' }}>
            <div style={{ fontSize: titleSize, fontWeight: 800, color: '#101828', letterSpacing: 0.3, margin: '-36px 0 28px 0', textAlign: 'center' }}>
              {letterTitle}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: headingSize }}>To:</div>
                <div style={{ fontSize: bodySize, lineHeight: 1.6, marginTop: 2 }}>
                  {candidateName}<br/>
                  {candidateAddress && <>{candidateAddress}<br/></>}
                  {candidateCity && <>{candidateCity}, {candidateState} {candidatePin}</>}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: headingSize, whiteSpace: 'nowrap' }}>{offerDate}</div>
            </div>

            <div style={{ fontWeight: 700, fontSize: headingSize, marginTop: 26 }}>Dear {candidateName},</div>

            <div 
              style={{ fontSize: bodySize, lineHeight: 1.65, marginTop: 18, textAlign: 'justify' }}
              dangerouslySetInnerHTML={{ __html: replaceVars(offerIntroduction, formState) }}
            />

            <div style={{ fontSize: listSize, marginTop: 22, fontWeight: 600 }}>Offer Details</div>
            
            <div 
              className="ol-details-list"
              style={{ fontSize: listSize, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: replaceVars(offerDetails, formState) }}
            />

            <div 
              style={{ fontSize: bodySize, lineHeight: 1.65, marginTop: 18, textAlign: 'justify' }}
              dangerouslySetInnerHTML={{ __html: replaceVars(closingStatement, formState) }}
            />
          </div>

          {/* Footer */}
          <div style={{ height: 210, position: 'relative', zIndex: 2 }}>
            <div style={{ position: 'absolute', bottom: 60, left: 44, fontSize: contactSize, lineHeight: 1.6 }}>
              <div style={{ fontSize: 15 }}>Sincerely,</div>
              {signatureUrl ? (
                <img src={signatureUrl} alt="Signature" style={{ maxHeight: signatureSize, margin: '8px 0 6px -4px', display: 'block' }} />
              ) : (
                <svg viewBox="0 0 200 90" fill="none" style={{ display: 'block', width: 150, height: signatureSize, margin: '8px 0 6px -4px' }}>
                  <path d="M15 55 C 25 20, 40 20, 45 45 C 48 60, 55 40, 65 35 C 78 28, 78 55, 90 45 C 100 38, 105 25, 120 35 C 135 45, 150 30, 165 40"
                        stroke="#101828" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{signatoryName}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{signatoryDesignation}, {companyName}</div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 34, left: 44, width: 420, height: 4, background: '#20B2AA', borderRadius: 2, zIndex: 2 }}></div>
          </div>

        </div>
      </div>
      
      {/* Required CSS for list styling because dangerouslySetInnerHTML handles the HTML tags */}
      <style>{`
        .ol-details-list ul { margin: 10px 0 0 0; padding-left: 20px; }
        .ol-details-list li { margin-bottom: 4px; }
        .ol-details-list p { margin: 0 0 4px 0; }
        .ol-details-list li p { margin: 0; }
      `}</style>
    </div>
  );
}
