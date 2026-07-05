import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { 
  ZoomIn, ZoomOut, Maximize, Minimize, 
  ChevronLeft, ChevronRight, Download, ExternalLink, File
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ResumeViewer = ({ applicant }) => {
  const [activeTab, setActiveTab] = useState("cover_letter");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeDocumentUrl, setActiveDocumentUrl] = useState(null);

  const containerRef = useRef(null);

  const hasCoverLetter = !!applicant?.cover_letter_url;
  const hasResume = !!applicant?.resume_url;

  useEffect(() => {
    // Default tab logic
    if (hasCoverLetter) {
      setActiveTab("cover_letter");
    } else if (hasResume) {
      setActiveTab("resume");
    }
  }, [applicant, hasCoverLetter, hasResume]);

  useEffect(() => {
    if (activeTab === "resume" && hasResume) {
      setActiveDocumentUrl(applicant.resume_url);
    } else if (activeTab === "cover_letter" && hasCoverLetter) {
      setActiveDocumentUrl(applicant.cover_letter_url);
    } else {
      setActiveDocumentUrl(null);
    }
  }, [activeTab, hasResume, hasCoverLetter, applicant]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const fitToWidth = () => setScale(1.0); // Reset scale (relies on container CSS)

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      if (!activeDocumentUrl) throw new Error("No document URL");
      const response = await fetch(activeDocumentUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const extension = activeDocumentUrl ? activeDocumentUrl.split('.').pop() : 'pdf';
      const safeFirstName = applicant.firstName ? applicant.firstName.replace(/\s+/g, '_') : 'Applicant';
      const safeLastName = applicant.lastName ? applicant.lastName.replace(/\s+/g, '_') : '';
      const docType = activeTab === "cover_letter" ? "CoverLetter" : "Resume";
      const fileName = `${safeFirstName}_${safeLastName}_${docType}.${extension}`.replace(/_+/g, '_');
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      if (activeDocumentUrl) window.open(activeDocumentUrl, "_blank");
    }
  };

  const fileConfig = React.useMemo(() => {
    if (!activeDocumentUrl) return null;
    return {
      url: activeDocumentUrl
    };
  }, [activeDocumentUrl]);

  if (!hasCoverLetter && !hasResume) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-200">
        <div className="text-center text-gray-500">
          <File size={48} className="mx-auto mb-3 opacity-20" />
          <p>No Cover Letter or Resume provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative" ref={containerRef}>
      {/* Tabs Header (Hidden in Fullscreen) */}
      {!isFullScreen && (
        <div className="flex border-b border-gray-200 mb-4 px-2">
          {hasCoverLetter && (
            <button
              onClick={() => setActiveTab("cover_letter")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "cover_letter"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Cover Letter
            </button>
          )}
          {hasResume && (
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "resume"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Resume
            </button>
          )}
        </div>
      )}

      {/* Viewers */}
      <div className={`flex-1 bg-gray-50/50 rounded-xl border border-gray-200 shadow-inner overflow-hidden flex flex-col relative ${isFullScreen ? 'h-screen w-screen absolute inset-0 z-50 bg-gray-100 rounded-none' : ''}`}>
        
        {/* UNIFIED PDF VIEWER */}
        {(activeTab === "resume" && hasResume) || (activeTab === "cover_letter" && hasCoverLetter) ? (
          <div className="flex flex-col h-full w-full">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm sticky top-0 z-10">
              
              <div className="flex items-center gap-2">
                <button onClick={zoomOut} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Zoom Out"><ZoomOut size={16} /></button>
                <span className="text-xs font-semibold text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={zoomIn} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Zoom In"><ZoomIn size={16} /></button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button onClick={fitToWidth} className="text-xs font-medium text-gray-600 hover:bg-gray-100 px-2 py-1.5 rounded">Reset</button>
              </div>

              {numPages && (
                <div className="flex items-center gap-3">
                  <button onClick={previousPage} disabled={pageNumber <= 1} className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button onClick={nextPage} disabled={pageNumber >= numPages} className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {activeDocumentUrl && (
                  <>
                    <a href={activeDocumentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Open in New Tab"><ExternalLink size={16} /></a>
                    <button type="button" onClick={handleDownload} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Download"><Download size={16} /></button>
                  </>
                )}
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button onClick={toggleFullScreen} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title={isFullScreen ? "Minimize" : "Full Screen"}>
                  {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </div>

            {/* Document Details Strip */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span><strong>Uploaded:</strong> {new Date(applicant.created_at).toLocaleDateString()}</span>
              {activeDocumentUrl && <span><strong>File:</strong> {activeDocumentUrl.split('/').pop().replace(/^\d+-/, '')}</span>}
            </div>

            {/* Canvas Container */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-gray-400/20 p-4 sm:p-8 flex justify-center">
              {!activeDocumentUrl && (
                <div className="text-gray-500 mt-10">Preparing PDF...</div>
              )}
              {activeDocumentUrl && fileConfig && (
                <Document
                  file={fileConfig}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="text-gray-500">Loading Document...</div>}
                  error={<div className="text-red-500">Failed to load PDF. Please download it instead.</div>}
                  className="pdf-document"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg border border-gray-300"
                    width={containerRef.current ? Math.min(containerRef.current.clientWidth - 40, 800) : 800}
                  />
                </Document>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResumeViewer;
