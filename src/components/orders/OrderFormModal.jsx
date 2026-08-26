import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { X } from 'lucide-react';
import emailjs from '@emailjs/browser';

const CEDIS = [
  'CEDI MERIDA', 'CEDI VILLAHERMOSA', 'CEDI EDOMEX', 'CEDI GUADALAJARA',
  'CEDI MERIDA MOTOS', 'CEDI SAN LUIS POTOSÍ', 'CEDI CULIACÁN', 'CEDI SALTILLO', 'CEDI TIJUANA'
];
const PROVEEDORES = [
  'SAMSUNG', 'MOTOROLA', 'XIAOMI', 'APPLE', 'OPPO', 'ZTE', 
  'HONOR', 'VIVO', 'HUAWEI', 'REALME', 'HISENSE', 'TCL'
];

const HORARIOS = [
  '08:00 am - 09:00 am',
  '09:00 am - 10:00 am',
  '10:00 am - 11:00 am',
  '12:00 pm - 13:00 pm',
  '14:00 pm - 15:00 pm',
  '16:00 pm - 17:00 pm',
  '18:00 pm - 19:00 pm'
];

const generateCalendarLinks = (fecha, horario, folio, cedi) => {
  if (!fecha || !horario) return { google: '', outlook: '' };
  
  const timeMap = {
    '08:00 am - 09:00 am': { s: '080000', e: '090000' },
    '09:00 am - 10:00 am': { s: '090000', e: '100000' },
    '10:00 am - 11:00 am': { s: '100000', e: '110000' },
    '12:00 pm - 13:00 pm': { s: '120000', e: '130000' },
    '14:00 pm - 15:00 pm': { s: '140000', e: '150000' },
    '16:00 pm - 17:00 pm': { s: '160000', e: '170000' },
    '18:00 pm - 19:00 pm': { s: '180000', e: '190000' }
  };
  
  const times = timeMap[horario] || { s: '080000', e: '090000' };
  const dateStr = fecha.replace(/-/g, '');
  
  const startDate = `${dateStr}T${times.s}`;
  const endDate = `${dateStr}T${times.e}`;
  
  const title = encodeURIComponent(`Entrega OC: ${folio}`);
  const details = encodeURIComponent(`Recepción de orden de compra ${folio} en ${cedi}`);
  
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${encodeURIComponent(cedi)}`;
  
  const startDt = `${fecha}T${times.s.substring(0,2)}:00:00`;
  const endDt = `${fecha}T${times.e.substring(0,2)}:00:00`;
  const outlook = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${encodeURIComponent(cedi)}&startdt=${startDt}&enddt=${endDt}&allday=false`;
  
  return { google, outlook };
};

export default function OrderFormModal({ onClose, orderToEdit = null }) {
  const { addOrder, updateOrder, orders } = useOrderStore();
  
  const [formData, setFormData] = useState(orderToEdit ? {
    ...orderToEdit,
    fechaOC: orderToEdit.fechaOC ? orderToEdit.fechaOC.substring(0,10) : '',
    fechaEntrega: orderToEdit.fechaEntrega ? orderToEdit.fechaEntrega.substring(0,10) : '',
    fechaIngreso: orderToEdit.fechaIngreso ? orderToEdit.fechaIngreso.substring(0,10) : '',
  } : {
    cedi: '',
    proveedor: '',
    folioOC: '',
    folioSOLPED: '',
    fechaOC: '',
    fechaEntrega: '',
    horaEntrega: '',
    cantidadSolicitada: '',
    estatus: 'EN TRÁNSITO',
    cantidadIngresada: '',
    fechaIngreso: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        cedi: orderToEdit.cedi,
        proveedor: orderToEdit.proveedor,
        folioOC: orderToEdit.folioOC,
        folioSOLPED: orderToEdit.folioSOLPED,
        fechaOC: orderToEdit.fechaOC.substring(0,10),
        fechaEntrega: orderToEdit.fechaEntrega.substring(0,10),
        cantidadSolicitada: orderToEdit.cantidadSolicitada,
        estatus: orderToEdit.estatus,
        cantidadIngresada: orderToEdit.cantidadIngresada || '',
        fechaIngreso: orderToEdit.fechaIngreso ? orderToEdit.fechaIngreso.substring(0,10) : ''
      });
    }
  }, [orderToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!orderToEdit && orders.some(o => o.folioOC === formData.folioOC)) {
      setError('El Folio de OC ya existe.');
      return;
    }
    if (Number(formData.cantidadSolicitada) <= 0) {
      setError('La cantidad solicitada debe ser mayor a 0.');
      return;
    }
    if (formData.cantidadIngresada !== '' && Number(formData.cantidadIngresada) < 0) {
      setError('La cantidad ingresada no puede ser negativa.');
      return;
    }
    if (formData.fechaIngreso && new Date(formData.fechaIngreso) < new Date(formData.fechaOC)) {
      setError('La fecha de ingreso no debe ser anterior a la fecha de OC.');
      return;
    }

    let isWarning = false;
    if (formData.cantidadIngresada !== '' && Number(formData.cantidadIngresada) > Number(formData.cantidadSolicitada)) {
      isWarning = true;
      if (!window.confirm('La cantidad ingresada supera la solicitada. ¿Deseas continuar?')) {
        return;
      }
    }

    const payload = {
      ...formData,
      cantidadSolicitada: Number(formData.cantidadSolicitada),
      cantidadIngresada: formData.cantidadIngresada !== '' ? Number(formData.cantidadIngresada) : 0,
      fechaOC: formData.fechaOC ? `${formData.fechaOC}T12:00:00.000Z` : null,
      fechaEntrega: formData.fechaEntrega ? `${formData.fechaEntrega}T12:00:00.000Z` : null,
      fechaIngreso: formData.fechaIngreso ? `${formData.fechaIngreso}T12:00:00.000Z` : null
    };

    if (orderToEdit) {
      updateOrder(orderToEdit.id, payload);
    } else {
      addOrder(payload);
        // Enviar correo automático
      const { google, outlook } = generateCalendarLinks(formData.fechaEntrega, formData.horaEntrega, formData.folioOC, formData.cedi);
      
      const cediEmails = {
        'CEDI MERIDA': 'israel.pat@macropay.mx, david.ocampo@macropay.mx, russell.pool@macropay.mx',
        'CEDI VILLAHERMOSA': 'rafael.torrez@macropay.mx, jesus.zavala@macropay.mx, omar.aguilar@macropay.mx',
        'CEDI EDOMEX': 'jorge.zarza@macropay.mx',
        'CEDI GUADALAJARA': 'jorge.zarza@macropay.mx',
        'CEDI MERIDA MOTOS': 'israel.pat@macropay.mx, david.ocampo@macropay.mx, russell.pool@macropay.mx',
        'CEDI SAN LUIS POTOSÍ': 'jorge.zarza@macropay.mx',
        'CEDI CULIACÁN': 'filemon.martinez@macropay.mx',
        'CEDI SALTILLO': 'luis.chel@macropay.mx',
        'CEDI TIJUANA': 'filemon.martinez@macropay.mx'
      };

      const templateParams = {
        to_email: cediEmails[formData.cedi] || '',
        numero_oc: formData.folioOC,
        proveedor: formData.proveedor,
        cedi: formData.cedi,
        fecha_entrega: formData.fechaEntrega || 'No especificada',
        hora_entrega: formData.horaEntrega || 'No especificada',
        cantidad: formData.cantidadSolicitada,
        google_cal: google,
        outlook_cal: outlook
      };

      if (templateParams.to_email) {
        emailjs.send(
          'service_b9ras6v',
          'template_a6keuci',
          templateParams,
          'B25tS4bTI0j2WlOI9'
        ).catch((err) => console.error("Error al enviar email:", err));
      } else {
        console.warn("No hay correo configurado para el CEDI seleccionado.");
      }
    }
    
    onClose();
  };

  const statusType = formData.cantidadIngresada === '' ? '' 
    : Number(formData.cantidadIngresada) < Number(formData.cantidadSolicitada) ? 'Ingreso parcial'
    : 'Ingreso completo';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-display font-black text-macro-blue">
            {orderToEdit ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
          
          <form id="orderForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-100 pb-2">1. Datos de la Orden</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEDI de destino *</label>
                  <select name="cedi" required value={formData.cedi} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue">
                    <option value="">Seleccione un CEDI</option>
                    {CEDIS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                  <select name="proveedor" required value={formData.proveedor} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue">
                    <option value="">Seleccione un proveedor</option>
                    {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Folio OC *</label>
                  <input type="text" name="folioOC" required value={formData.folioOC} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Folio SOLPED *</label>
                  <input type="text" name="folioSOLPED" required value={formData.folioSOLPED} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la OC *</label>
                  <input type="date" name="fechaOC" required value={formData.fechaOC} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha estimada de entrega *</label>
                  <input type="date" name="fechaEntrega" required value={formData.fechaEntrega} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario de entrega *</label>
                  <select name="horaEntrega" required value={formData.horaEntrega} onChange={handleChange} disabled={!formData.cedi || !formData.fechaEntrega} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue disabled:bg-gray-100">
                    <option value="">{(!formData.cedi || !formData.fechaEntrega) ? 'Selecciona CEDI y Fecha primero' : 'Selecciona un horario'}</option>
                    {HORARIOS.map(h => {
                      const isOccupied = occupiedSlots.includes(h);
                      return <option key={h} value={h} disabled={isOccupied}>{h} {isOccupied ? '(Reservado)' : ''}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad solicitada *</label>
                  <input type="number" name="cantidadSolicitada" required min="1" value={formData.cantidadSolicitada} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estatus de llegada *</label>
                  <select name="estatus" required value={formData.estatus} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue font-bold">
                    <option value="EN TRÁNSITO">🟡 En Tránsito</option>
                    <option value="ENTREGADO">🟢 Entregado</option>
                    <option value="CANCELADO">🔴 Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-200 pb-2">2. Ingreso al Inventario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha real de ingreso</label>
                  <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad ingresada</label>
                  <input type="number" name="cantidadIngresada" min="0" value={formData.cantidadIngresada} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
              </div>
              {statusType && (
                <div className="mt-2 text-sm font-semibold text-macro-blue">
                  Tipo de ingreso: {statusType}
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="orderForm" className="px-6 py-2 bg-macro-blue hover:bg-blue-800 text-white rounded-md font-medium transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
