import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-display font-black text-gray-800">
            Detalle de Orden: <span className="text-macro-blue">{order.folioOC}</span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div><span className="text-gray-500 block mb-1">Proveedor</span><span className="font-bold">{order.proveedor}</span></div>
            <div><span className="text-gray-500 block mb-1">CEDI</span><span className="font-bold">{order.cedi}</span></div>
            <div><span className="text-gray-500 block mb-1">Folio SOLPED</span><span className="font-bold">{order.folioSOLPED}</span></div>
            <div><span className="text-gray-500 block mb-1">Estatus</span>
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                order.estatus === 'EN TRÁNSITO' ? 'bg-yellow-100 text-yellow-800' :
                order.estatus === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>{order.estatus}</span>
            </div>
            <div><span className="text-gray-500 block mb-1">Fecha OC</span><span className="font-bold">{format(new Date(order.fechaOC), 'dd/MM/yyyy')}</span></div>
            <div><span className="text-gray-500 block mb-1">Fecha Entrega Estimada</span><span className="font-bold">{format(new Date(order.fechaEntrega), 'dd/MM/yyyy')}</span></div>
            
            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h3 className="font-bold text-gray-800 mb-3">Información de Ingreso</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><span className="text-gray-500 block mb-1">Solicitadas</span><span className="font-bold text-lg">{order.cantidadSolicitada}</span></div>
                <div><span className="text-gray-500 block mb-1">Ingresadas</span><span className="font-bold text-lg text-macro-blue">{order.cantidadIngresada}</span></div>
                <div><span className="text-gray-500 block mb-1">Pendientes</span><span className="font-bold text-lg text-red-500">{order.unidadesPendientes}</span></div>
                
                <div><span className="text-gray-500 block mb-1">Fecha Ingreso Real</span><span className="font-bold">{order.fechaIngreso ? format(new Date(order.fechaIngreso), 'dd/MM/yyyy') : 'N/A'}</span></div>
                <div><span className="text-gray-500 block mb-1">Días de Ingreso</span><span className="font-bold">{order.diasIngreso !== undefined ? order.diasIngreso : 'N/A'}</span></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-800 mb-4">Historial de Cambios</h3>
            <div className="space-y-4">
              {order.historial && order.historial.map((h, i) => (
                <div key={i} className="flex gap-4 text-sm border-l-2 border-gray-200 pl-4 py-1">
                  <div className="w-32 text-gray-500 flex-shrink-0">
                    {format(new Date(h.fechaHora), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{h.usuario} <span className="text-gray-500 font-normal ml-2">({h.accion})</span></div>
                    <div className="text-gray-600 mt-1">{h.detalle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
