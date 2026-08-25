import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OrderFormModal from '../orders/OrderFormModal';
import logoMacropay from '../../assets/logo-macropay.png';

export default function AppLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNewOrder={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      
      {isModalOpen && (
        <OrderFormModal onClose={() => setIsModalOpen(false)} />
      )}
      
      {/* Logo fijo en la parte inferior derecha */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none opacity-80 drop-shadow-md">
        <img 
          src={logoMacropay} 
          alt="Macropay Logo" 
          className="h-10 md:h-14 object-contain"
        />
      </div>
    </div>
  );
}
