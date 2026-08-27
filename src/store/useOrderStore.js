import { create } from 'zustand';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

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
        console.error("Error de lectura en Firebase:", error);
      });
    } catch (e) {
      console.error("Error iniciando Firebase:", e);
    }
  },

  addOrder: (order) => {
    try {
      const id = generateId();
      const newOrder = {
        ...order,
        id,
        fechaCreacion: new Date().toISOString(),
        cantidadIngresada: 0,
        unidadesPendientes: order.cantidadSolicitada || 0,
        historial: [{
          fechaHora: new Date().toISOString(),
          usuario: 'Usuario',
          accion: 'Creacion',
          detalle: 'Orden creada'
        }]
      };
      
      // Actualizacion optimista inmediata
      set((state) => ({ orders: [...state.orders, newOrder] }));

      // Guardado en segundo plano sin await
      setDoc(doc(db, 'orders', id), newOrder)
        .then(() => console.log("Guardado en la nube con exito"))
        .catch((e) => alert("Error guardando en la nube: " + e.message));
        
    } catch (e) {
      alert("Error local crítico al crear orden: " + e.message);
    }
  },
  
  updateOrder: (id, updates, usuario = 'Usuario') => {
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
      
      updateDoc(doc(db, 'orders', id), dataToUpdate)
        .then(() => console.log("Actualizado en la nube con exito"))
        .catch((e) => alert("Error actualizando en la nube: " + e.message));
        
    } catch (e) {
      alert("Error local al actualizar orden: " + e.message);
    }
  },
  
  deleteOrder: (id) => {
    try {
      // Actualizacion optimista
      set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      }));
      
      deleteDoc(doc(db, 'orders', id))
        .catch((e) => alert("Error eliminando en la nube: " + e.message));
    } catch (e) {
      alert("Error eliminando orden: " + e.message);
    }
  }
}));
