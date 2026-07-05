import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './Layout';

import Dashboard from './Routes/DashboardHome';
import Contact from './Routes/Contact';
import Careers from './Routes/Careers';
import Newsroom from './Routes/Newsroom';
import CreateNewsroom from './Routes/CreateNewsroom';
import EditNewsroom from './Routes/EditNewsroom';

import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './Routes/ProtectedRoute';
import Settings from './Routes/Settings';
import Profile from './Routes/Profile';
import Subscriptions from './Routes/Subscriptions';
import SEO from './Routes/SEO';
import AccessControl from './Routes/AccessControl';
import LegalPages from './Routes/LegalPages';
import LegalPageForm from './Routes/LegalPageForm';

/* CAREERS */
import PostJob from './Routes/PostJob';
import EditJob from './Routes/EditJob';
import CareerApplicants from './Routes/CareerApplicants';

const RoleRoute = ({ moduleName, children }) => {
  const { hasAccess, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-gray-500">Verifying permissions...</div>;
  if (!hasAccess(moduleName)) return <Navigate to="/" replace />;
  return children;
};

const SuperAdminRoute = ({ children }) => {
  const { profile, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-gray-500">Verifying permissions...</div>;
  if (!profile || (profile.email !== "ausosys@gmail.com" && profile.email !== "auxosys@gmail.com")) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          {/* PUBLIC */}
          <Route path="/login" element={<AdminLogin />} />

          {/* PROTECTED ADMIN AREA */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Admin Pages */}
            <Route path="contact" element={<RoleRoute moduleName="contact"><Contact /></RoleRoute>} />
            <Route path="careers" element={<RoleRoute moduleName="careers"><Careers /></RoleRoute>} />

            {/* NEWSROOM */}
            <Route path="newsroom" element={<RoleRoute moduleName="newsroom"><Newsroom /></RoleRoute>} />
            <Route path="newsroom/new" element={<RoleRoute moduleName="newsroom"><CreateNewsroom /></RoleRoute>} />
            <Route path="newsroom/edit/:id" element={<RoleRoute moduleName="newsroom"><EditNewsroom /></RoleRoute>} />

            {/* CAREERS */}
            <Route path="careers/new" element={<RoleRoute moduleName="careers"><PostJob /></RoleRoute>} />
            <Route path="careers/edit/:id" element={<RoleRoute moduleName="careers"><EditJob /></RoleRoute>} />
            <Route path="careers/applications/:jobId" element={<RoleRoute moduleName="careers"><CareerApplicants /></RoleRoute>} />

            <Route path="subscriptions" element={<RoleRoute moduleName="subscriptions"><Subscriptions /></RoleRoute>} />

            {/* SEO & Legal & Access Control & Settings (Superadmin ONLY) */}
            <Route path="seo" element={<SuperAdminRoute><SEO /></SuperAdminRoute>} />
            <Route path="legal-pages" element={<SuperAdminRoute><LegalPages /></SuperAdminRoute>} />
            <Route path="legal/new" element={<SuperAdminRoute><LegalPageForm /></SuperAdminRoute>} />
            <Route path="legal/edit/:id" element={<SuperAdminRoute><LegalPageForm /></SuperAdminRoute>} />
            <Route path="settings" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />
            <Route path="access-control" element={<SuperAdminRoute><AccessControl /></SuperAdminRoute>} />
            
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
