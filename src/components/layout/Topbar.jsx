import { Bell, User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';

export default function Topbar({ onNewOrder }) {
  const { orders } = useOrderStore();
  
  // Alertas básicas: OCs retrasadas
  const delayedCount = orders.filter(o => o.diasIngreso > 3 || (o.estatus === 'EN TRÁNSITO' && new Date(o.fechaEntrega) < new Date())).length;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-display text-gray-800">Panel de Control</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onNewOrder}
          className="bg-macro-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Nueva Orden de Compra
        </button>
        
        <div className="relative cursor-pointer">
          <Bell size={24} className="text-gray-500 hover:text-gray-700" />
          {delayedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {delayedCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
          <div className="bg-gray-100 p-2 rounded-full">
            <User size={20} className="text-gray-600" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-700">Limhi Aban</p>
            <p className="text-gray-500 text-xs">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
