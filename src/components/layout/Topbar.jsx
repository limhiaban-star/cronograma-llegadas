import { Bell, User, Plus, LogOut, LogIn, Cloud } from 'lucide-react';
import { useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import LoginModal from '../auth/LoginModal';

export default function Topbar({ onNewOrder }) {
  const { orders } = useOrderStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  
  // Alertas basicas: OCs retrasadas
  const delayedCount = orders.filter(o => o.diasIngreso > 3 || (o.estatus === 'EN TRANSITO' && new Date(o.fechaEntrega) < new Date())).length;

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-display text-gray-800">Panel de Control</h2>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <Cloud size={14} />
            <span>Nube Activa</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <button 
              onClick={onNewOrder}
              className="bg-macro-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Nueva Orden de Compra
            </button>
          )}
          
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
            <div className="text-sm mr-2">
              <p className="font-semibold text-gray-700">{isAuthenticated ? user : 'Invitado'}</p>
              <p className="text-gray-500 text-xs">{isAuthenticated ? 'Comprador' : 'Solo lectura'}</p>
            </div>
            
            {isAuthenticated ? (
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Cerrar sesion">
                <LogOut size={18} />
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="flex items-center gap-1 text-macro-blue font-medium text-sm hover:underline ml-2">
                <LogIn size={16} />
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
