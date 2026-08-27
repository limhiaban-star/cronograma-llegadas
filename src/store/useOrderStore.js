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
    const ordersRef = collection(db, 'orders');
    onSnapshot(ordersRef, (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => {
        ordersData.push({ ...doc.data(), id: doc.id });
      });
      set({ orders: ordersData });
    });
  },

  addOrder: async (order) => {
    const id = crypto.randomUUID();
    const newOrder = {
      ...order,
      fechaCreacion: new Date().toISOString(),
      cantidadIngresada: 0,
      unidadesPendientes: order.cantidadSolicitada,
      historial: [{
        fechaHora: new Date().toISOString(),
        usuario: 'Usuario',
        accion: 'Creacin',
        detalle: 'Orden creada'
      }]
    };
    await setDoc(doc(db, 'orders', id), newOrder);
  },
  
  updateOrder: async (id, updates, usuario = 'Usuario') => {
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
    
    // History tracking
    const cambios = Object.keys(updates).map(k => k + ': ' + currentOrder[k] + ' -> ' + updates[k]).join(', ');
    
    updatedOrder.historial = [
      {
        fechaHora: new Date().toISOString(),
        usuario,
        accion: 'Edicin',
        detalle: cambios
      },
      ...(currentOrder.historial || [])
    ];

    const { id: docId, ...dataToUpdate } = updatedOrder;
    await updateDoc(doc(db, 'orders', id), dataToUpdate);
  },
  
  deleteOrder: async (id) => {
    await deleteDoc(doc(db, 'orders', id));
  }
}));
