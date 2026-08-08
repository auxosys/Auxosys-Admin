import React, { useState } from 'react';
import { Award, PenTool, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import CertificateGenerator from './CertificateGenerator';
import SignatureLibrary from './SignatureLibrary';
import GeneratedCertificatesList from './GeneratedCertificatesList';
import { useAuth } from '../../context/AuthContext';

export default function CertificatesModule() {
  const { hasAccess, hasPermission, profile } = useAuth();
  
  const canViewList = hasAccess('certificates_issued') || profile?.permissions?.some(p => p.module === 'certificates_issued');
  const canGenerate = hasAccess('certificates_generate') || profile?.permissions?.some(p => p.module === 'certificates_generate');
  
  const canWriteGenerate = profile?.role === 'Superadmin' || 
                           profile?.email === 'admin@auxosys.com' ||
                           profile?.permissions?.some(p => p.module === 'certificates_generate' && p.access?.includes('Write')) ||
                           hasPermission('certificates_generate', 'Read & Write');

  const tabs = [];
  if (canViewList) tabs.push({ id: 'list', label: 'Issued Certificates', icon: Award });
  if (canGenerate) tabs.push({ id: 'generator', label: 'Generator', icon: LayoutTemplate });
  if (canWriteGenerate) tabs.push({ id: 'signatures', label: 'Signature Library', icon: PenTool });

  const [activeTab, setActiveTab] = useState(canViewList ? 'list' : canGenerate ? 'generator' : 'signatures');
  const [editCertificateId, setEditCertificateId] = useState(null);

  const handleEditCertificate = (id) => {
    setEditCertificateId(id);
    setActiveTab('generator');
  };

  const navigate = useNavigate();

  if (tabs.length === 0) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#132242] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Certificate Engine</h1>
            <p className="text-sm text-gray-500 mt-1">Generate and manage official certificates with QR verification.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tabs Content */}
        <div className="mt-6">
          {activeTab === 'list' && (
            <GeneratedCertificatesList canRevoke={canWriteGenerate} onEdit={handleEditCertificate} />
          )}
          {activeTab === 'generator' && (
            <CertificateGenerator 
              canWrite={canWriteGenerate} 
              editId={editCertificateId}
              onGenerated={() => {
                setEditCertificateId(null);
                setActiveTab('list');
              }} 
            />
          )}
          {activeTab === 'signatures' && <SignatureLibrary />}
        </div>

      </div>
    </div>
  );
}
