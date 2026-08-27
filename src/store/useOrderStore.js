import { create } from 'zustand';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useOrderStore = create((set, get) => ({
  orders: [],
  initialized: false,
  
  initListener: () => {
    if (get().initialized) return;
    set({ initialized: true });
    try {
      const ordersRef = collection(db, 'orders');
      onSnapshot(ordersRef, (snapshot) => {
        const ordersData = [];
        snapshot.forEach((docSnap) => {
          ordersData.push({ ...docSnap.data(), id: docSnap.id });
        });
        set({ orders: ordersData });
      }, (error) => {
        alert("Error de lectura en Firebase: " + error.message);
      });
    } catch (e) {
      alert("Error iniciando Firebase: " + e.message);
    }
  },

  addOrder: async (order) => {
    try {
      const id = crypto.randomUUID();
      const newOrder = {
        ...order,
        id,
        fechaCreacion: new Date().toISOString(),
        cantidadIngresada: 0,
        unidadesPendientes: order.cantidadSolicitada,
        historial: [{
          fechaHora: new Date().toISOString(),
          usuario: 'Usuario',
          accion: 'Creacion',
          detalle: 'Orden creada'
        }]
      };
      
      // Actualizacion optimista: mostramos la orden inmediatamente en pantalla
      set((state) => ({ orders: [...state.orders, newOrder] }));

      // Guardado en segundo plano
      await setDoc(doc(db, 'orders', id), newOrder);
      alert("Exito: Orden guardada y enviada a todos");
    } catch (e) {
      alert("Error critico guardando en Firebase: " + e.message);
    }
  },
  
  updateOrder: async (id, updates, usuario = 'Usuario') => {
    try {
      const currentOrders = get().orders;
      const currentOrder = currentOrders.find(o => o.id === id);
      if (!currentOrder) return;
      
      const updatedOrder = { ...currentOrder, ...updates };
      
      // Recalculations
      if (updates.cantidadIngresada !== undefined) {
        updatedOrder.unidadesPendientes = updatedOrder.cantidadSolicitada - updatedOrder.cantidadIngresada;
      }
      
      if (updatedOrder.fechaIngreso && updatedOrder.fechaEntrega) {
         const dias = differenceInDays(
           startOfDay(parseISO(updatedOrder.fechaIngreso)),
           startOfDay(parseISO(updatedOrder.fechaEntrega))
         );
         updatedOrder.diasIngreso = dias;
      }

      updatedOrder.fechaModificacion = new Date().toISOString();
      
      const cambios = Object.keys(updates).map(k => k + ': ' + currentOrder[k] + ' -> ' + updates[k]).join(', ');
      
      updatedOrder.historial = [
        {
          fechaHora: new Date().toISOString(),
          usuario,
          accion: 'Edicion',
          detalle: cambios
        },
        ...(currentOrder.historial || [])
      ];

      // Actualizacion optimista
      const newOrders = [...currentOrders];
      const index = newOrders.findIndex(o => o.id === id);
      newOrders[index] = updatedOrder;
      set({ orders: newOrders });

      const { id: docId, ...dataToUpdate } = updatedOrder;
      await updateDoc(doc(db, 'orders', id), dataToUpdate);
      alert("Exito: Orden actualizada para todos");
    } catch (e) {
      alert("Error actualizando orden en Firebase: " + e.message);
    }
  },
  
  deleteOrder: async (id) => {
    try {
      // Actualizacion optimista
      set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      }));
      
      await deleteDoc(doc(db, 'orders', id));
      alert("Exito: Orden eliminada para todos");
    } catch (e) {
      alert("Error eliminando orden: " + e.message);
    }
  }
}));
