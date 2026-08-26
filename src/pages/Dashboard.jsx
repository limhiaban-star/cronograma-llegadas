import { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { Package, Truck, XCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const PROVEEDORES = ['Bodesa', 'Veloci', 'Bajaj', 'Carabela', 'Kiwo', 'Yadea', 'Moto Colt'];
const CEDIS = [
  'CEDI MERIDA', 'CEDI TUXTLA GUTIÉRREZ', 'CEDI VILLAHERMOSA', 'CEDI OAXACA',
  'CEDI EDOMEX', 'CEDI GUADALAJARA', 'CEDI MERIDA MOTOS', 'CEDI SAN LUIS POTOSÍ',
  'CEDI CULIACÁN', 'CEDI SALTILLO', 'CEDI TIJUANA'
];

const MESES = [
  { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
];

const AÑOS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];

export default function Dashboard() {
  const { orders } = useOrderStore();
  const [filterProveedor, setFilterProveedor] = useState('');
  const [filterCedi, setFilterCedi] = useState('');
  const [filterMesOC, setFilterMesOC] = useState('');
  const [filterMesEntrega, setFilterMesEntrega] = useState('');
  const [filterMesIngreso, setFilterMesIngreso] = useState('');
  const [filterAño, setFilterAño] = useState('');
  
  const filteredOrders = orders.filter(o => {
    const matchesProveedor = filterProveedor ? o.proveedor === filterProveedor : true;
    const matchesCedi = filterCedi ? o.cedi === filterCedi : true;
    
    const mesOC = o.fechaOC ? o.fechaOC.substring(5, 7) : '';
    const matchesMesOC = filterMesOC ? mesOC === filterMesOC : true;
    
    const mesEntrega = o.fechaEntrega ? o.fechaEntrega.substring(5, 7) : '';
    const matchesMesEntrega = filterMesEntrega ? mesEntrega === filterMesEntrega : true;
    
    const mesIngreso = o.fechaIngreso ? o.fechaIngreso.substring(5, 7) : '';
    const matchesMesIngreso = filterMesIngreso ? mesIngreso === filterMesIngreso : true;
    
    const añoOC = o.fechaOC ? o.fechaOC.substring(0, 4) : '';
    const añoEntrega = o.fechaEntrega ? o.fechaEntrega.substring(0, 4) : '';
    const añoIngreso = o.fechaIngreso ? o.fechaIngreso.substring(0, 4) : '';
    const matchesAño = filterAño ? (añoOC === filterAño || añoEntrega === filterAño || añoIngreso === filterAño) : true;
    
    return matchesProveedor && matchesCedi && matchesMesOC && matchesMesEntrega && matchesMesIngreso && matchesAño;
  });

  const inTransit = filteredOrders.filter(o => o.estatus === 'EN TRÁNSITO').length;
  const delivered = filteredOrders.filter(o => o.estatus === 'ENTREGADO').length;
  const cancelled = filteredOrders.filter(o => o.estatus === 'CANCELADO').length;
  
  const unidadesSolicitadas = filteredOrders.reduce((acc, curr) => acc + Number(curr.cantidadSolicitada || 0), 0);
  const unidadesIngresadas = filteredOrders.reduce((acc, curr) => acc + Number(curr.cantidadIngresada || 0), 0);
  const unidadesPendientes = filteredOrders.reduce((acc, curr) => acc + Number(curr.unidadesPendientes || 0), 0);
  
  // Tiempo promedio de ingreso
  const ordenesConIngreso = filteredOrders.filter(o => o.estatus === 'ENTREGADO' && o.diasIngreso !== undefined);
  const promedioDias = ordenesConIngreso.length > 0 
    ? (ordenesConIngreso.reduce((acc, curr) => acc + curr.diasIngreso, 0) / ordenesConIngreso.length).toFixed(1)
    : 0;

  // Cumplimiento
  const aTiempo = filteredOrders.filter(o => o.estatus === 'ENTREGADO' && o.diasIngreso <= 1).length;
  const totalEntregadas = filteredOrders.filter(o => o.estatus === 'ENTREGADO').length;
  const porcentajeCumplimiento = totalEntregadas > 0
    ? Math.round((aTiempo / totalEntregadas) * 100)
    : 100;

  const kpis = [
    { title: 'Órdenes en tránsito', value: inTransit, icon: Truck, color: 'bg-macro-yellow text-gray-800' },
    { title: 'Órdenes entregadas', value: delivered, icon: CheckCircle, color: 'bg-macro-green text-white' },
    { title: 'Órdenes canceladas', value: cancelled, icon: XCircle, color: 'bg-red-500 text-white' },
    { title: 'Unidades solicitadas', value: unidadesSolicitadas.toLocaleString(), icon: Package, color: 'bg-white text-gray-800 border' },
    { title: 'Unidades ingresadas', value: unidadesIngresadas.toLocaleString(), icon: Package, color: 'bg-white text-gray-800 border' },
    { title: 'Unidades pendientes', value: unidadesPendientes.toLocaleString(), icon: AlertTriangle, color: 'bg-white text-gray-800 border' },
    { title: 'Tiempo prom. de ingreso', value: `${promedioDias} días`, icon: Clock, color: 'bg-macro-blue text-white' },
    { title: 'Cumplimiento', value: `${porcentajeCumplimiento}%`, icon: CheckCircle, color: 'bg-macro-teal text-white' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-black text-gray-800">Dashboard Ejecutivo</h1>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[120px] flex-1 xl:flex-none"
            value={filterAño}
            onChange={(e) => setFilterAño(e.target.value)}
          >
            <option value="">Año (Todos)</option>
            {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          
          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[120px] flex-1 xl:flex-none"
            value={filterMesOC}
            onChange={(e) => setFilterMesOC(e.target.value)}
          >
            <option value="">Mes de OC</option>
            {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[120px] flex-1 xl:flex-none"
            value={filterMesEntrega}
            onChange={(e) => setFilterMesEntrega(e.target.value)}
          >
            <option value="">Mes Entrega</option>
            {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          
          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[120px] flex-1 xl:flex-none"
            value={filterMesIngreso}
            onChange={(e) => setFilterMesIngreso(e.target.value)}
          >
            <option value="">Mes Ingreso</option>
            {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[140px] flex-1 xl:flex-none"
            value={filterCedi}
            onChange={(e) => setFilterCedi(e.target.value)}
          >
            <option value="">Todos los CEDIS</option>
            {CEDIS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none bg-white min-w-[140px] flex-1 xl:flex-none"
            value={filterProveedor}
            onChange={(e) => setFilterProveedor(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className={`p-6 rounded-xl shadow-sm flex items-center gap-4 ${kpi.color} ${kpi.color.includes('border') ? 'border-gray-200' : ''}`}>
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon size={24} className={kpi.color.includes('bg-white') ? 'text-gray-500' : 'text-current'} />
              </div>
              <div>
                <p className={`text-sm opacity-90 ${kpi.color.includes('bg-white') ? 'text-gray-500' : ''}`}>{kpi.title}</p>
                <p className="text-3xl font-bold mt-1">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Alertas Automáticas Básicas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-macro-orange" />
          Alertas Automáticas
        </h2>
        <div className="space-y-3">
          {orders.map(order => {
             const hoy = new Date();
             const entrega = new Date(order.fechaEntrega);
             const isDelayed = order.estatus === 'EN TRÁNSITO' && hoy > entrega;
             
             if (isDelayed) {
               const diffTime = Math.abs(hoy - entrega);
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               return (
                 <div key={order.id} className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 flex justify-between">
                    <div>
                      <strong>🔴 OC {order.folioOC} – {order.proveedor} – {order.cedi}</strong><br/>
                      La entrega estaba programada para el {entrega.toLocaleDateString()} y continúa en tránsito.
                    </div>
                    <div className="font-bold">
                      Retraso: {diffDays} días
                    </div>
                 </div>
               );
             }
             if (order.unidadesPendientes > 0 && order.estatus === 'ENTREGADO') {
                return (
                  <div key={order.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-yellow-800">
                    <strong>🟡 OC {order.folioOC} – Ingreso parcial</strong><br/>
                    Se solicitaron {order.cantidadSolicitada}, pero solo ingresaron {order.cantidadIngresada}. Pendientes: {order.unidadesPendientes}.
                  </div>
                )
             }
             return null;
          })}
          {orders.length === 0 && <p className="text-gray-500 text-sm">No hay alertas activas.</p>}
        </div>
      </div>
    </div>
  );
}
