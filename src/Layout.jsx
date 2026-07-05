import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Components/SideNavbar';
import useAdminNotifications from "./hooks/useAdminNotifications";

const Layout = () => {
  useAdminNotifications();

  return (
    <div 

  className="flex h-screen" 

  style={{ 

    background: 

      "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 28%)," + 

      "radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 24%)," + 

      "linear-gradient(180deg,#f6fbff 0%,#eef6ff 100%)" 

  }} 

> 
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pb-8 pt-2">
          {/* This acts as a placeholder for whichever page is active */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
