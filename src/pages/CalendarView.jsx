import { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import OrderFormModal from '../components/orders/OrderFormModal';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const { orders } = useOrderStore();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

  const dateFormat = "MMMM yyyy";
  const formatHorario = (horario) => {
    if (!horario) return '';
    if (typeof horario === 'string') return horario;
    if (Array.isArray(horario) && horario.length > 0) {
      if (horario.length === 1) return horario[0];
      const sorted = [...horario].sort((a, b) => a.localeCompare(b));
      const first = sorted[0].split(' - ')[0];
      const last = sorted[sorted.length - 1].split(' - ')[1];
      return `${first} - ${last}`;
    }
    return '';
  };

  const days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      
      // Filtrar ordenes para este dia
      const dayOrders = orders
        .filter(o => isSameDay(new Date(o.fechaEntrega), cloneDay))
        .sort((a, b) => {
          const hA = Array.isArray(a.horaEntrega) ? a.horaEntrega[0] : (a.horaEntrega || '');
          const hB = Array.isArray(b.horaEntrega) ? b.horaEntrega[0] : (b.horaEntrega || '');
          return hA.localeCompare(hB);
        });
      
      days.push(
        <div
          key={day}
          className={`min-h-[120px] p-2 border border-gray-200 bg-white ${
            !isSameMonth(day, monthStart) ? "text-gray-400 bg-gray-50" : "text-gray-800"
          } ${isSameDay(day, new Date()) ? "border-macro-blue border-2" : ""}`}
        >
          <div className="flex justify-end">
            <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-macro-blue text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
              {formattedDate}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {dayOrders.map((order) => {
              
              const getProviderClass = (prov) => {
                switch (prov) {
                  case 'Bodesa': return 'bg-blue-100 text-blue-800 border-blue-300';
                  case 'Veloci': return 'bg-red-100 text-red-800 border-red-300';
                  case 'Bajaj': return 'bg-orange-100 text-orange-800 border-orange-300';
                  case 'Carabela': return 'bg-amber-100 text-amber-800 border-amber-300';
                  case 'Kiwo': return 'bg-green-100 text-green-800 border-green-300';
                  case 'Yadea': return 'bg-purple-100 text-purple-800 border-purple-300';
                  case 'Moto Colt': return 'bg-slate-200 text-slate-800 border-slate-400';
                  default: return 'bg-gray-100 text-gray-800 border-gray-300';
                }
              };
              
              return (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`text-xs p-1.5 rounded cursor-pointer shadow-sm font-medium border ${getProviderClass(order.proveedor)}`}
                  title={`${order.folioOC} - ${order.proveedor} (${order.cedi})`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 font-bold">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        order.estatus === 'EN TRÁNSITO' ? 'bg-yellow-500' :
                        order.estatus === 'ENTREGADO' ? 'bg-green-500' : 'bg-red-500'
                      }`} title={order.estatus}></div>
                      <span className="truncate">{order.folioOC}</span>
                    </div>
                    {(order.horaEntrega && order.horaEntrega.length > 0) && (
                      <div className="text-[10px] text-gray-700 bg-white/50 px-1 py-0.5 rounded truncate">
                        🕐 {formatHorario(order.horaEntrega)}
                      </div>
                    )}
                    <div className="text-[10px] opacity-80 truncate">{order.proveedor} - {order.cantidadSolicitada} u.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="text-macro-blue" size={28} />
          <h1 className="text-2xl font-display font-black text-gray-800 capitalize">
            {format(currentDate, dateFormat, { locale: es })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 font-medium">
            Hoy
          </button>
          <div className="flex bg-gray-100 rounded-md border border-gray-200">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-l-md"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-r-md border-l border-gray-200"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 py-3 text-center text-sm font-bold text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-x border-b border-gray-200 rounded-b-lg flex-1">
        {days}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={(order) => {
            setSelectedOrder(null);
            setEditingOrder(order);
          }}
        />
      )}
      {editingOrder && (
        <OrderFormModal 
          orderToEdit={editingOrder} 
          onClose={() => setEditingOrder(null)} 
        />
      )}
    </div>
  );
}
