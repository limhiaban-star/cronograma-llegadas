import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X } from 'lucide-react';
import emailjs from '@emailjs/browser';

const CEDIS = [
  'CEDI MERIDA', 'CEDI TUXTLA GUTIÉRREZ', 'CEDI VILLAHERMOSA', 'CEDI OAXACA',
  'CEDI EDOMEX', 'CEDI GUADALAJARA', 'CEDI MERIDA MOTOS', 'CEDI SAN LUIS POTOSÍ',
  'CEDI CULIACÁN', 'CEDI SALTILLO', 'CEDI TIJUANA'
];
const PROVEEDORES = ['Bodesa', 'Veloci', 'Bajaj', 'Carabela', 'Kiwo', 'Yadea', 'Moto Colt'];

const HORARIOS = [
  '08:00 am - 09:00 am',
  '09:00 am - 10:00 am',
  '10:00 am - 11:00 am',
  '11:00 am - 12:00 pm',
  '12:00 pm - 13:00 pm',
  '14:00 pm - 15:00 pm',
  '16:00 pm - 17:00 pm',
  '18:00 pm - 19:00 pm'
];

const generateCalendarLinks = (fecha, horarioArray, folio, cedi) => {
  if (!fecha || !horarioArray || horarioArray.length === 0) return { google: '', outlook: '' };
  
  const timeMap = {
    '08:00 am - 09:00 am': { s: '08:00:00', e: '09:00:00' },
    '09:00 am - 10:00 am': { s: '09:00:00', e: '10:00:00' },
    '10:00 am - 11:00 am': { s: '10:00:00', e: '11:00:00' },
    '11:00 am - 12:00 pm': { s: '11:00:00', e: '12:00:00' },
    '12:00 pm - 13:00 pm': { s: '12:00:00', e: '13:00:00' },
    '14:00 pm - 15:00 pm': { s: '14:00:00', e: '15:00:00' },
    '16:00 pm - 17:00 pm': { s: '16:00:00', e: '17:00:00' },
    '18:00 pm - 19:00 pm': { s: '18:00:00', e: '19:00:00' }
  };
  
  const arr = Array.isArray(horarioArray) ? horarioArray : [horarioArray];
  arr.sort((a, b) => HORARIOS.indexOf(a) - HORARIOS.indexOf(b));
  
  const firstSlot = arr[0];
  const lastSlot = arr[arr.length - 1];
  
  const times = { s: timeMap[firstSlot].s, e: timeMap[lastSlot].e };
  
  // Para Google Calendar (YYYYMMDDTHHmmss)
  const gStart = `${fecha.replace(/-/g, '')}T${times.s.replace(/:/g, '')}`;
  const gEnd = `${fecha.replace(/-/g, '')}T${times.e.replace(/:/g, '')}`;
  
  // Para Outlook (YYYY-MM-DDTHH:mm:ss)
  const oStart = `${fecha}T${times.s}`;
  const oEnd = `${fecha}T${times.e}`;
  
  const title = encodeURIComponent(`Entrega OC: ${folio}`);
  const details = encodeURIComponent(`Recepcion de orden de compra ${folio} en ${cedi}`);
  
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${gStart}/${gEnd}&details=${details}&location=${encodeURIComponent(cedi)}`;
  
  const outlook = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${oStart}&enddt=${oEnd}&subject=${title}&body=${details}&location=${encodeURIComponent(cedi)}`;
  
  return { google, outlook };
};

export default function OrderFormModal({ onClose, orderToEdit = null }) {
  const { addOrder, updateOrder, orders } = useOrderStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState(orderToEdit ? {
    cedi: orderToEdit.cedi,
    proveedor: orderToEdit.proveedor,
    folioOC: orderToEdit.folioOC,
    folioSOLPED: orderToEdit.folioSOLPED,
    fechaOC: orderToEdit.fechaOC ? orderToEdit.fechaOC.substring(0,10) : '',
    fechaEntrega: orderToEdit.fechaEntrega ? orderToEdit.fechaEntrega.substring(0,10) : '',
    horaEntrega: orderToEdit.horaEntrega ? (Array.isArray(orderToEdit.horaEntrega) ? orderToEdit.horaEntrega : [orderToEdit.horaEntrega]) : [],
    cantidadSolicitada: orderToEdit.cantidadSolicitada,
    estatus: orderToEdit.estatus,
    cantidadIngresada: orderToEdit.cantidadIngresada || '',
    fechaIngreso: orderToEdit.fechaIngreso ? orderToEdit.fechaIngreso.substring(0,10) : '',
    numCamiones: orderToEdit.numCamiones || ''
  } : {
    cedi: '',
    proveedor: '',
    folioOC: '',
    folioSOLPED: '',
    fechaOC: '',
    fechaEntrega: '',
    horaEntrega: [],
    cantidadSolicitada: '',
    estatus: 'EN TRÁNSITO',
    cantidadIngresada: '',
    fechaIngreso: '',
    numCamiones: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        cedi: orderToEdit.cedi,
        proveedor: orderToEdit.proveedor,
        folioOC: orderToEdit.folioOC,
        folioSOLPED: orderToEdit.folioSOLPED,
        fechaOC: orderToEdit.fechaOC ? orderToEdit.fechaOC.substring(0,10) : '',
        fechaEntrega: orderToEdit.fechaEntrega ? orderToEdit.fechaEntrega.substring(0,10) : '',
        horaEntrega: orderToEdit.horaEntrega ? (Array.isArray(orderToEdit.horaEntrega) ? orderToEdit.horaEntrega : [orderToEdit.horaEntrega]) : [],
        cantidadSolicitada: orderToEdit.cantidadSolicitada,
        estatus: orderToEdit.estatus,
        cantidadIngresada: orderToEdit.cantidadIngresada || '',
        fechaIngreso: orderToEdit.fechaIngreso ? orderToEdit.fechaIngreso.substring(0,10) : '',
        numCamiones: orderToEdit.numCamiones || ''
      });
    }
  }, [orderToEdit]);

  const occupiedSlots = orders
    .filter(o => 
      o.cedi === formData.cedi && 
      formData.fechaEntrega && o.fechaEntrega && o.fechaEntrega.startsWith(formData.fechaEntrega) &&
      o.id !== orderToEdit?.id
    )
    .flatMap(o => Array.isArray(o.horaEntrega) ? o.horaEntrega : [o.horaEntrega])
    .filter(Boolean);

  const handleHorarioChange = (h) => {
    setFormData(prev => {
      const current = Array.isArray(prev.horaEntrega) ? prev.horaEntrega : (prev.horaEntrega ? [prev.horaEntrega] : []);
      if (current.includes(h)) {
        return { ...prev, horaEntrega: current.filter(x => x !== h) };
      } else {
        return { ...prev, horaEntrega: [...current, h] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.horaEntrega || formData.horaEntrega.length === 0) {
      setError('Debes seleccionar al menos un horario de entrega.');
      return;
    }
    
    if (!CEDIS.includes(formData.cedi)) {
      setError('Selecciona un CEDI válido de la lista.');
      return;
    }

    if (!PROVEEDORES.includes(formData.proveedor)) {
      setError('Selecciona un Proveedor válido de la lista.');
      return;
    }
    
    if (!orderToEdit) {
      const newOcs = formData.folioOC.split(',').map(s => s.trim()).filter(Boolean);
      const existingOcs = orders.flatMap(o => o.folioOC.split(',').map(s => s.trim()));
      const duplicate = newOcs.find(oc => existingOcs.includes(oc));
      if (duplicate) {
        setError(`El Folio de OC ${duplicate} ya existe.`);
        return;
      }
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
      numCamiones: formData.numCamiones !== '' ? Number(formData.numCamiones) : 1,
      cantidadSolicitada: Number(formData.cantidadSolicitada),
      cantidadIngresada: formData.cantidadIngresada !== '' ? Number(formData.cantidadIngresada) : 0,
      fechaOC: formData.fechaOC ? `${formData.fechaOC}T12:00:00.000Z` : null,
      fechaEntrega: formData.fechaEntrega ? `${formData.fechaEntrega}T12:00:00.000Z` : null,
      fechaIngreso: formData.fechaIngreso ? `${formData.fechaIngreso}T12:00:00.000Z` : null,
      createdBy: orderToEdit ? orderToEdit.createdBy : user
    };

    let shouldSendEmail = true;
    if (orderToEdit) {
      const origFecha = orderToEdit.fechaEntrega ? orderToEdit.fechaEntrega.substring(0, 10) : '';
      const origHora = orderToEdit.horaEntrega ? (Array.isArray(orderToEdit.horaEntrega) ? orderToEdit.horaEntrega : [orderToEdit.horaEntrega]) : [];
      const origCantidad = Number(orderToEdit.cantidadSolicitada);

      const newFecha = formData.fechaEntrega || '';
      const newHora = Array.isArray(formData.horaEntrega) ? formData.horaEntrega : [];
      const newCantidad = Number(formData.cantidadSolicitada);

      const horaChanged = [...origHora].sort().join(',') !== [...newHora].sort().join(',');

      // Si no cambió ni la fecha, ni la hora, ni la cantidad solicitada, no enviamos correo.
      // (Es decir, si solo editaron estatus o datos de ingreso).
      if (origFecha === newFecha && origCantidad === newCantidad && !horaChanged) {
        shouldSendEmail = false;
      }
    }

    if (orderToEdit) {
      updateOrder(orderToEdit.id, payload);
    } else {
      addOrder(payload);
    }
    
    if (shouldSendEmail) {
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
        hora_entrega: Array.isArray(formData.horaEntrega) ? formData.horaEntrega.join(', ') : (formData.horaEntrega || 'No especificada'),
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
                  <input 
                    list="cedis-list"
                    name="cedi" 
                    required 
                    value={formData.cedi} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" 
                    placeholder="Buscar CEDI..."
                  />
                  <datalist id="cedis-list">
                    {CEDIS.map(c => <option key={c} value={c}>{c}</option>)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                  <input 
                    list="proveedores-list"
                    name="proveedor" 
                    required 
                    value={formData.proveedor} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" 
                    placeholder="Buscar proveedor..."
                  />
                  <datalist id="proveedores-list">
                    {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Órdenes de compra * <span className="text-xs text-gray-500 font-normal">(puedes ingresar varias separadas por coma)</span></label>
                  <textarea name="folioOC" required value={formData.folioOC} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue resize-none" placeholder="Ej. OC123, OC456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solped *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de camiones *</label>
                  <input type="number" name="numCamiones" required min="1" value={formData.numCamiones} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-macro-blue" />
                </div>
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horario(s) de entrega (Puedes seleccionar varios si la descarga toma horas) *</label>
                    {(!formData.cedi || !formData.fechaEntrega) ? (
                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">Selecciona CEDI y Fecha primero para ver los horarios disponibles.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {HORARIOS.map(h => {
                          const isOccupied = occupiedSlots.includes(h) && !(Array.isArray(formData.horaEntrega) ? formData.horaEntrega.includes(h) : formData.horaEntrega === h);
                          if (isOccupied) return null; // Hide occupied
                          
                          const isSelected = Array.isArray(formData.horaEntrega) ? formData.horaEntrega.includes(h) : formData.horaEntrega === h;
                          
                          return (
                            <label key={h} className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-macro-blue' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => handleHorarioChange(h)}
                                className="w-4 h-4 text-macro-blue border-gray-300 rounded focus:ring-macro-blue"
                              />
                              <span className="text-sm font-medium text-gray-700">{h}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
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
