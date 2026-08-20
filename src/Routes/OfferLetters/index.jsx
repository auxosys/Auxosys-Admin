import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FileStack, ArrowRight } from "lucide-react";

const OfferLetters = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Offer Letters</h1>
        <p className="text-sm text-slate-500 mt-1">Select an offer letter template to generate.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        {/* Single Page Card (Active) */}
        <div 
          onClick={() => navigate('/offer-letters/new')}
          className="group cursor-pointer bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-teal-500 transition-all flex flex-col"
        >
          <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Single-Page Offer Letter</h2>
          <p className="text-sm text-slate-500 flex-1 mb-6">
            A concise, highly visual one-page summary template. Perfect for quick offers with straightforward terms.
          </p>
          <div className="flex items-center text-sm font-semibold text-teal-600">
            Generate Now <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Detailed Page Card */}
        <div 
          onClick={() => navigate('/offer-letters/detailed/new')}
          className="group cursor-pointer bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-400 transition-all flex flex-col relative overflow-hidden"
        >
          <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <FileStack size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Detailed Offer Letter</h2>
          <p className="text-sm text-slate-500 flex-1 mb-6">
            A comprehensive multi-page document including full legal terms, conditions, and extensive clauses.
          </p>
          <div className="flex items-center text-sm font-semibold text-slate-600">
            Generate Now <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfferLetters;
