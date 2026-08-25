import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, List, Settings } from 'lucide-react';

import logoMacropay from '../../assets/logo-macropay.png';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Seguimiento', path: '/tracking', icon: List },
  ];

  return (
    <aside className="w-64 bg-macro-blue text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="mb-6 bg-white/10 p-2 rounded inline-block backdrop-blur-sm">
          <img 
            src={logoMacropay} 
            alt="Macropay Logo" 
            className="h-8 object-contain"
          />
        </div>
        <h1 className="text-2xl font-display font-black text-macro-yellow leading-tight">
          CRONOGRAMA<br/>DE LLEGADAS
        </h1>
        <p className="text-xs text-blue-200 mt-2 font-sans">
          Control y seguimiento de órdenes de compra
        </p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-macro-yellow text-macro-blue font-bold' 
                  : 'hover:bg-blue-800 text-blue-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-blue-800">
        <button className="flex items-center gap-3 px-4 py-2 text-blue-200 hover:text-white w-full mb-4">
          <Settings size={20} />
          <span>Configuración</span>
        </button>
        <div className="text-[11px] text-blue-400/60 text-center px-2 pb-2 leading-relaxed">
          &copy; {new Date().getFullYear()} Derechos de autor<br />
          Limhi Emmanuel Aban Cabrera
        </div>
      </div>
    </aside>
  );
}
