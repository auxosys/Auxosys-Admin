import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, ChevronDown, Upload } from "lucide-react";
import { apiClient } from "../../helper/apiClient";
import { toast } from "react-toastify";
import RichTextEditor from "../../Components/RichTextEditor";
import LiveDetailedPreview from "./LiveDetailedPreview";
import { FULL_TIME_CLAUSES, INTERNSHIP_CLAUSES } from "./defaultClauses";

const DEFAULT_VALUES = {
  offerType: "Full-Time", // or "Internship"
  companyName: "Auxosys",
  legalCompanyName: "Auxosys Technologies Pvt. Ltd.",
  companyEmail: "hr@auxosys.com",
  companyWebsite: "www.auxosys.com",
  companyAddress: "Bhubaneswar, Odisha",
  logoUrl: "",

  candidateName: "Pritam Das",
  candidateAddress: "Kalinga Nagar",
  candidateCity: "Bhubaneswar",
  candidateState: "Odisha",
  candidatePin: "751003",

  jobTitle: "Software Developer",
  jobDepartment: "Engineering",
  offerDate: "20 August 2026",
  joiningDate: "01 September 2026",
  workMode: "On-site",
  reportingManager: "Engineering Manager",

  ctcAmount: "600000",
  currency: "INR",

  signatoryName: "HR Manager",
  signatoryDesignation: "Human Resources",
  signatureUrl: "",

  letterTitle: "OFFER LETTER",
  clauses: FULL_TIME_CLAUSES.map(c => ({ ...c })),
  offerIntroduction: `<p>We are delighted to extend this offer for the position of <strong>{{job.title}}</strong> at <strong>{{company.legal_company_name}}</strong> After reviewing your background and experience, we believe you will be a valuable addition to our team.</p>`,
  offerDetails: `<ul><li>Position: {{job.title}}</li><li>Department: {{job.department}}</li><li>Start Date: {{job.joining_date}}</li><li>Work Location: {{job.work_mode}}</li><li>Compensation: {{compensation.annual_ctc}} {{compensation.currency}} annual CTC</li><li>Reporting To: {{job.reporting_manager}}</li></ul>`,
  closingStatement: `<p>We are confident that your skills, dedication, and professionalism will contribute greatly to our organization's continued success. We look forward to working with you and achieving great results together. Please confirm your acceptance of this offer within three (3) days of this letter.</p>`,
  candidateAcknowledgement: `<p>You agree and affirm that the information (personal or otherwise) shared by you at the time of application is accurate and complete, and you have withheld no material information. AUXOSYS is providing this offer of employment based on the preliminary information and documentation provided by you at the application stage. You understand and agree that this offer and your employment with AUXOSYS are subject to additional verification of the facts and materials/documents given to AUXOSYS, as well as any other verification deemed necessary to finalize your candidature. You may also be requested by the Company to supply paperwork and information from time to time throughout your employment; you must do so within the timeframes specified by the Company. Non-delivery of the required documents within the stated time frame will result in termination of employment.</p><p>Please do not hesitate to contact AUXOSYS through the designated communication channel if you have any questions.</p><p>We are confident that your skills and dedication will contribute to our organisation's success, and we look forward to working with you.</p><p>Congratulations on your selection, and welcome to the team!</p><p>Sincerely,</p><p>ACKNOWLEDGED AND AGREED:</p>`,
  titleSize: 16,
  headingSize: 16,
  bodySize: 14.5,
  listSize: 14.5,
  contactSize: 14,
  signatureSize: 65
};

function Section({ title, defaultOpen = true, children }) {
  return (
    <details
      className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 bg-slate-50 text-sm font-bold text-slate-900 select-none">
        {title}
        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 border-t border-slate-200 p-4">
        {children}
      </div>
    </details>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

const processSignatureImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const totalPixels = canvas.width * canvas.height;
        const histogram = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
          const luma = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
          histogram[luma]++;
        }

        let sum = 0;
        for (let i = 0; i < 256; i++) sum += i * histogram[i];

        let sumB = 0, wB = 0, wF = 0, varMax = 0, otsuThreshold = 0;
        for (let i = 0; i < 256; i++) {
          wB += histogram[i];
          if (wB === 0) continue;
          wF = totalPixels - wB;
          if (wF === 0) break;
          sumB += i * histogram[i];
          const mB = sumB / wB;
          const mF = (sum - sumB) / wF;
          const varBetween = wB * wF * (mB - mF) * (mB - mF);
          if (varBetween > varMax) {
            varMax = varBetween;
            otsuThreshold = i;
          }
        }

        const threshold = otsuThreshold * 0.9;
        const inkColor = [15, 23, 42];

        let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const luma = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];

            if (luma >= threshold) {
              data[idx+3] = 0;
            } else {
              const darkness = threshold - luma;
              const alpha = Math.min(255, Math.round((darkness / (threshold * 0.4)) * 255));
              data[idx+3] = alpha;
              data[idx] = inkColor[0];
              data[idx+1] = inkColor[1];
              data[idx+2] = inkColor[2];

              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX < minX || maxY < minY) {
          resolve(e.target.result); // Fallback to original
          return;
        }

        ctx.putImageData(imageData, 0, 0);

        const pad = 14;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(canvas.width - cropX, maxX - minX + pad * 2);
        const cropH = Math.min(canvas.height - cropY, maxY - minY + pad * 2);

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        cropCanvas.getContext("2d").drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        resolve(cropCanvas.toDataURL("image/png", 1.0));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

function ImageField({ label, value, onChange, hint }) {
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processedDataUrl = await processSignatureImage(file);
    onChange(processedDataUrl);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 w-full transition-colors"
        >
          <Upload className="h-4 w-4 text-slate-500" />
          {value ? "Change Signature Image" : "Upload Signature Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="self-start text-[12px] mt-1 font-semibold text-red-600 hover:underline"
        >
          Remove image
        </button>
      )}
    </Field>
  );
}

function SizeSlider({ label, id, value, onChange, min = 10, max = 52 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-[12px] font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {value}px
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
      />
    </div>
  );
}

function OfferLetterForm({
  initialValues = {},
  onChange = () => {},
}) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });

  const update = (key) => (val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    onChange(next);
  };

  const updateEvt = (key) => (e) => update(key)(e.target.value);

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const nextClauses = type === "Full-Time" 
      ? FULL_TIME_CLAUSES.map(c => ({ ...c })) 
      : INTERNSHIP_CLAUSES.map(c => ({ ...c }));
    
    const next = { ...values, offerType: type, clauses: nextClauses };
    setValues(next);
    onChange(next);
  };

  const toggleClause = (id) => {
    const nextClauses = values.clauses.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    update("clauses")(nextClauses);
  };

  const updateClauseContent = (id, newContent) => {
    const nextClauses = values.clauses.map(c => 
      c.id === id ? { ...c, content: newContent } : c
    );
    update("clauses")(nextClauses);
  };

  const resetSizes = () => {
    setValues((prev) => ({
      ...prev,
      titleSize: 16,
      headingSize: 16,
      bodySize: 14.5,
      listSize: 14.5,
      contactSize: 14,
      signatureSize: 65,
    }));
    onChange({
      ...values,
      titleSize: 16,
      headingSize: 16,
      bodySize: 14.5,
      listSize: 14.5,
      contactSize: 14,
      signatureSize: 65,
    });
  };

  // Trigger initial onChange to bubble up defaults
  useEffect(() => {
    onChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Detailed Offer Letter Details</h2>
      <p className="mb-5 text-xs text-slate-500">
        Fill in the fields below to generate a multi-page offer letter.
      </p>

      <div className="flex flex-col gap-3.5">
        
        <Section title="Offer Letter Type" defaultOpen={true}>
           <Field label="Select Employment Type">
            <select className={inputClass} value={values.offerType} onChange={handleTypeChange}>
              <option value="Full-Time">Full-Time Employment</option>
              <option value="Internship">Internship</option>
            </select>
          </Field>
        </Section>

        <Section title="Company">
          <Field label="Letter Title">
            <input className={inputClass} value={values.letterTitle} onChange={updateEvt("letterTitle")} />
          </Field>
          <Field label="Company name (short)">
            <input className={inputClass} value={values.companyName} onChange={updateEvt("companyName")} />
          </Field>
          <Field label="Legal company name">
            <input className={inputClass} value={values.legalCompanyName} onChange={updateEvt("legalCompanyName")} />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={values.companyEmail} onChange={updateEvt("companyEmail")} />
          </Field>
          <Field label="Website">
            <input className={inputClass} value={values.companyWebsite} onChange={updateEvt("companyWebsite")} />
          </Field>
          <Field label="Registered address">
            <input className={inputClass} value={values.companyAddress} onChange={updateEvt("companyAddress")} />
          </Field>
        </Section>

        <Section title="Candidate">
          <Field label="Full name">
            <input className={inputClass} value={values.candidateName} onChange={updateEvt("candidateName")} />
          </Field>
          <Field label="Address line (optional)">
            <input className={inputClass} value={values.candidateAddress} onChange={updateEvt("candidateAddress")} />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="City (optional)">
              <input className={inputClass} value={values.candidateCity} onChange={updateEvt("candidateCity")} />
            </Field>
            <Field label="State">
              <input className={inputClass} value={values.candidateState} onChange={updateEvt("candidateState")} />
            </Field>
          </div>
          <Field label="PIN / ZIP">
            <input className={inputClass} value={values.candidatePin} onChange={updateEvt("candidatePin")} />
          </Field>
        </Section>

        <Section title="Offer details">
          <Field label="Job title">
            <input className={inputClass} value={values.jobTitle} onChange={updateEvt("jobTitle")} />
          </Field>
          <Field label="Department (optional)">
            <input className={inputClass} value={values.jobDepartment} onChange={updateEvt("jobDepartment")} />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Letter date">
              <input className={inputClass} value={values.offerDate} onChange={updateEvt("offerDate")} />
            </Field>
            <Field label="Start date">
              <input className={inputClass} value={values.joiningDate} onChange={updateEvt("joiningDate")} />
            </Field>
          </div>
          <Field label="Work location">
            <input className={inputClass} value={values.workMode} onChange={updateEvt("workMode")} />
          </Field>
          <Field label="Reporting to (optional)">
            <input className={inputClass} value={values.reportingManager} onChange={updateEvt("reportingManager")} />
          </Field>
        </Section>

        <Section title={values.offerType === "Internship" ? "Stipend" : "Compensation"}>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label={values.offerType === "Internship" ? "Stipend / CTC" : "Annual CTC"}>
              <input
                type="number"
                min="0"
                step="1000"
                className={inputClass}
                value={values.ctcAmount}
                onChange={updateEvt("ctcAmount")}
              />
            </Field>
            <Field label="Currency">
              <select className={inputClass} value={values.currency} onChange={updateEvt("currency")}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Signatory">
          <Field label="Name">
            <input className={inputClass} value={values.signatoryName} onChange={updateEvt("signatoryName")} />
          </Field>
          <Field label="Designation">
            <input className={inputClass} value={values.signatoryDesignation} onChange={updateEvt("signatoryDesignation")} />
          </Field>
          <ImageField
            label="Signature image (optional)"
            hint="Leave blank to use the default signature mark. Upload a signature on a white background, and it will automatically be made transparent."
            value={values.signatureUrl}
            onChange={update("signatureUrl")}
          />
        </Section>

        <Section title="Offer Content">
          <Field label="Offer Introduction">
            <div className="border border-slate-200 rounded-lg overflow-hidden mt-1">
              <RichTextEditor value={values.offerIntroduction} onChange={update("offerIntroduction")} />
            </div>
          </Field>
          <div className="mt-4">
            <Field label="Offer Details (List)">
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-1">
                <RichTextEditor value={values.offerDetails} onChange={update("offerDetails")} />
              </div>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Closing Statement">
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-1">
                <RichTextEditor value={values.closingStatement} onChange={update("closingStatement")} />
              </div>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Candidate Acknowledgement">
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-1">
                <RichTextEditor value={values.candidateAcknowledgement} onChange={update("candidateAcknowledgement")} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Clauses & Terms" defaultOpen={false}>
          <p className="text-xs text-slate-500 mb-4">
            Select the clauses to include in this offer letter. You can edit the contents of each clause directly.
          </p>
          <div className="flex flex-col gap-3">
            {values.clauses.map((clause, index) => (
              <div key={clause.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="flex items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={clause.isActive}
                    onChange={() => toggleClause(clause.id)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="ml-3 font-semibold text-sm text-slate-800">{clause.title}</span>
                </div>
                {clause.isActive && (
                  <div className="p-4">
                    <RichTextEditor 
                      value={clause.content} 
                      onChange={(content) => updateClauseContent(clause.id, content)} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Sizes & Dimensions" defaultOpen={false}>
          <SizeSlider label="Signature image height" min={20} max={120} value={values.signatureSize} onChange={update("signatureSize")} />
          <SizeSlider label='Heading "JOB OFFER LETTER"' min={12} max={52} value={values.titleSize} onChange={update("titleSize")} />
          <SizeSlider label="Labels & names" min={12} max={22} value={values.headingSize} onChange={update("headingSize")} />
          <SizeSlider label="Body paragraphs" min={11} max={19} value={values.bodySize} onChange={update("bodySize")} />
          <SizeSlider label="Offer detail list" min={11} max={19} value={values.listSize} onChange={update("listSize")} />
          <SizeSlider label="Contact / footer text" min={10} max={18} value={values.contactSize} onChange={update("contactSize")} />
          
          <button 
            type="button" 
            onClick={resetSizes}
            className="mt-2 self-start text-[12px] font-semibold text-slate-500 hover:text-teal-600 underline underline-offset-2"
          >
            Reset to defaults
          </button>
        </Section>

      </div>
    </div>
  );
}

const GenerateDetailedOffer = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formState, setFormState] = useState(DEFAULT_VALUES);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const payload = {
        candidate: { 
          name: formState.candidateName, 
          email: "", 
          address: formState.candidateAddress, 
          city: formState.candidateCity, 
          state: formState.candidateState, 
          pin: formState.candidatePin 
        },
        job: { 
          title: formState.jobTitle, 
          department: formState.jobDepartment, 
          employment_type: formState.offerType, 
          work_mode: formState.workMode, 
          joining_date: formState.joiningDate,
          reporting_manager: formState.reportingManager
        },
        compensation: { 
          currency: formState.currency, 
          annual_ctc: formState.ctcAmount, 
          monthly_gross: "", 
          custom_components: [] 
        },
        company: {
          company_name: formState.companyName,
          legal_company_name: formState.legalCompanyName,
          registered_address: formState.companyAddress,
          cin: "",
          website: formState.companyWebsite,
          email: formState.companyEmail,
          logo_url: formState.logoUrl
        },
        signatory: {
          name: formState.signatoryName,
          designation: formState.signatoryDesignation,
          signature_url: formState.signatureUrl
        },
        letterTitle: formState.letterTitle,
        offerDate: formState.offerDate,
        offerIntroduction: formState.offerIntroduction,
        offerDetails: formState.offerDetails,
        closingStatement: formState.closingStatement,
        candidateAcknowledgement: formState.candidateAcknowledgement,
        clauses: formState.clauses.filter(c => c.isActive),
        templateType: "detailed_page",
        titleSize: formState.titleSize,
        headingSize: formState.headingSize,
        bodySize: formState.bodySize,
        listSize: formState.listSize,
        contactSize: formState.contactSize,
        signatureSize: formState.signatureSize
      };

      const response = await apiClient.post("/api/offer-letters/generate-pdf", payload, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formState.offerType}_Offer_Letter_${payload.candidate.name || 'Candidate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success("Offer Letter downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] overflow-hidden px-2">
      <div className="flex items-center justify-between gap-4 mb-6 pt-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/offer-letters")} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Generate Detailed Offer</h1>
            <p className="text-sm text-slate-500">Multi-Page Legal Template</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {isGenerating ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Left Form (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6" style={{ minWidth: 0 }}>
          <div className="max-w-3xl mx-auto lg:mx-0">
            <OfferLetterForm onChange={setFormState} />
          </div>
        </div>

        {/* Right Preview (Scrollable Multi-page Preview) */}
        <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 shrink-0 z-10 sticky top-0 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 text-sm">Live Preview</h3>
            <span className="text-xs text-slate-500">Scroll to view pages</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex flex-col gap-6 items-center relative">
            <LiveDetailedPreview formState={formState} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDetailedOffer;
