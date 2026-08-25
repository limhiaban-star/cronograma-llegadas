import { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orders } = useOrderStore();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

  const dateFormat = "MMMM yyyy";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      
      // Filtrar ordenes para este dia
      const dayOrders = orders.filter(o => isSameDay(new Date(o.fechaEntrega), cloneDay));
      
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
            {dayOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`text-xs p-1.5 rounded cursor-pointer truncate shadow-sm font-medium ${
                  order.estatus === 'EN TRÁNSITO' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                  order.estatus === 'ENTREGADO' ? 'bg-green-100 text-green-800 border border-green-300' :
                  'bg-red-100 text-red-800 border border-red-300'
                }`}
                title={`${order.folioOC} - ${order.proveedor} (${order.cedi})`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    order.estatus === 'EN TRÁNSITO' ? 'bg-yellow-500' :
                    order.estatus === 'ENTREGADO' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {order.folioOC}
                </div>
                <div className="text-[10px] opacity-80">{order.proveedor} - {order.cantidadSolicitada} u.</div>
              </div>
            ))}
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
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
