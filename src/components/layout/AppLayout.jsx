import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OrderFormModal from '../orders/OrderFormModal';

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
    </div>
  );
}
