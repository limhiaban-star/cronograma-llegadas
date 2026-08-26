import { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import OrderFormModal from '../components/orders/OrderFormModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import { useAuthStore } from '../store/useAuthStore';

export default function TrackingTable() {
  const { orders, deleteOrder } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [filterCedi, setFilterCedi] = useState('');
  const [filterMesOC, setFilterMesOC] = useState('');
  const [filterMesIngreso, setFilterMesIngreso] = useState('');
  
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

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

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.folioOC.includes(searchTerm) || o.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) || o.cedi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstatus = filterEstatus ? o.estatus === filterEstatus : true;
    const matchesProveedor = filterProveedor ? o.proveedor === filterProveedor : true;
    const matchesCedi = filterCedi ? o.cedi === filterCedi : true;
    
    const mesOC = o.fechaOC ? o.fechaOC.substring(5, 7) : '';
    const matchesMesOC = filterMesOC ? mesOC === filterMesOC : true;
    
    const mesIngreso = o.fechaIngreso ? o.fechaIngreso.substring(5, 7) : '';
    const matchesMesIngreso = filterMesIngreso ? mesIngreso === filterMesIngreso : true;
    
    return matchesSearch && matchesEstatus && matchesProveedor && matchesCedi && matchesMesOC && matchesMesIngreso;
  });

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      deleteOrder(id);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredOrders.map(o => ({
      'CEDI': o.cedi,
      'Proveedor': o.proveedor,
      'Folio OC': o.folioOC,
      'Folio SOLPED': o.folioSOLPED,
      'Fecha OC': format(new Date(o.fechaOC), 'dd/MM/yyyy'),
      'Fecha Entrega': format(new Date(o.fechaEntrega), 'dd/MM/yyyy'),
      'Cantidad Solicitada': o.cantidadSolicitada,
      'Cantidad Ingresada': o.cantidadIngresada,
      'Pendientes': o.unidadesPendientes,
      'Fecha Ingreso': o.fechaIngreso ? format(new Date(o.fechaIngreso), 'dd/MM/yyyy') : 'N/A',
      'Días de Ingreso': o.diasIngreso !== undefined ? o.diasIngreso : 'N/A',
      'Estatus': o.estatus
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ordenes");
    XLSX.writeFile(wb, "Cronograma_Llegadas.xlsx");
  };

  const getSemaforoClass = (estatus) => {
    if (estatus === 'EN TRÁNSITO') return 'bg-yellow-100 text-yellow-800';
    if (estatus === 'ENTREGADO') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getSemaforoDot = (estatus) => {
    if (estatus === 'EN TRÁNSITO') return 'bg-yellow-500';
    if (estatus === 'ENTREGADO') return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl font-display font-black text-gray-800">Seguimiento de Órdenes</h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar folio, prov, cedi..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-macro-blue focus:border-macro-blue outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none"
              value={filterMesOC}
              onChange={(e) => setFilterMesOC(e.target.value)}
            >
              <option value="">Mes de OC (Todos)</option>
              {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            
            <select 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none"
              value={filterMesIngreso}
              onChange={(e) => setFilterMesIngreso(e.target.value)}
            >
              <option value="">Mes de Ingreso (Todos)</option>
              {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>

            <select 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none"
              value={filterCedi}
              onChange={(e) => setFilterCedi(e.target.value)}
            >
            <option value="">Todos los CEDIS</option>
            {CEDIS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none"
            value={filterProveedor}
            onChange={(e) => setFilterProveedor(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select 
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-macro-blue outline-none"
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
          >
            <option value="">Todos los estatus</option>
            <option value="EN TRÁNSITO">En Tránsito</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Exportar Excel
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1 border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs">
              <th className="p-3">CEDI / Prov</th>
              <th className="p-3">Orden de compra / Solped</th>
              <th className="p-3">Fechas (OC / Entrega)</th>
              <th className="p-3 text-center">Cantidades (Sol / Ing / Pen)</th>
              <th className="p-3 text-center">Días de Ingreso</th>
              <th className="p-3">Creado Por</th>
              <th className="p-3">Estatus</th>
              {isAuthenticated && <th className="p-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={isAuthenticated ? "9" : "8"} className="p-6 text-center text-gray-500">No se encontraron registros.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-gray-800">{order.cedi}</div>
                    <div className="text-gray-500 text-xs">{order.proveedor}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{order.folioOC}</div>
                    <div className="text-gray-500 text-xs">Solped: {order.folioSOLPED}</div>
                  </td>
                  <td className="p-3">
                    <div><span className="text-gray-500 mr-1">OC:</span>{format(new Date(order.fechaOC), 'dd/MM/yyyy')}</div>
                    <div><span className="text-gray-500 mr-1">Ent:</span>{format(new Date(order.fechaEntrega), 'dd/MM/yyyy')}</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-gray-100 px-2 rounded text-gray-700" title="Solicitadas">{order.cantidadSolicitada}</span>
                      <span className="bg-blue-50 px-2 rounded text-macro-blue font-medium" title="Ingresadas">{order.cantidadIngresada}</span>
                      <span className={`px-2 rounded font-medium ${order.unidadesPendientes > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`} title="Pendientes">
                        {order.unidadesPendientes}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {order.diasIngreso !== undefined ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${order.diasIngreso <= 1 ? 'bg-green-100 text-green-700' : order.diasIngreso <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {order.diasIngreso} días
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    <span className="text-gray-600 text-xs font-medium uppercase bg-gray-100 px-2 py-1 rounded">{order.createdBy || 'ADMIN'}</span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getSemaforoClass(order.estatus)}`}>
                      <span className={`w-2 h-2 rounded-full ${getSemaforoDot(order.estatus)}`}></span>
                      {order.estatus}
                    </span>
                  </td>
                  {isAuthenticated && (user === 'ADMIN' || order.createdBy === user) && (
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingOrder(order)} className="p-1.5 text-gray-500 hover:text-macro-blue hover:bg-blue-50 rounded transition-colors" title="Ver Detalle">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => setEditingOrder(order)} className="p-1.5 text-gray-500 hover:text-macro-teal hover:bg-teal-50 rounded transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingOrder && (
        <OrderFormModal orderToEdit={editingOrder} onClose={() => setEditingOrder(null)} />
      )}
      
      {viewingOrder && (
        <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}
    </div>
  );
}
