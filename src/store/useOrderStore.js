import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, parseISO, isBefore, startOfDay } from 'date-fns';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const newOrder = {
          ...order,
          id: crypto.randomUUID(),
          fechaCreacion: new Date().toISOString(),
          cantidadIngresada: 0,
          unidadesPendientes: order.cantidadSolicitada,
          historial: [{
            fechaHora: new Date().toISOString(),
            usuario: 'Usuario',
            accion: 'Creación',
            detalle: 'Orden creada'
          }]
        };
        set((state) => ({ orders: [...state.orders, newOrder] }));
      },
      updateOrder: (id, updates, usuario = 'Usuario') => {
        set((state) => {
          const orderIndex = state.orders.findIndex(o => o.id === id);
          if (orderIndex === -1) return state;
          
          const currentOrder = state.orders[orderIndex];
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
          
          // History tracking (simplified)
          const cambios = Object.keys(updates).map(k => `${k}: ${currentOrder[k]} -> ${updates[k]}`).join(', ');
          
          updatedOrder.historial = [
            {
              fechaHora: new Date().toISOString(),
              usuario,
              accion: 'Edición',
              detalle: cambios
            },
            ...(currentOrder.historial || [])
          ];

          const newOrders = [...state.orders];
          newOrders[orderIndex] = updatedOrder;
          return { orders: newOrders };
        });
      },
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      })),
      
      // Selectors & Computed
      getTransitOrders: () => get().orders.filter(o => o.estatus === 'EN TRÁNSITO'),
      getDeliveredOrders: () => get().orders.filter(o => o.estatus === 'ENTREGADO'),
      getCancelledOrders: () => get().orders.filter(o => o.estatus === 'CANCELADO'),
    }),
    {
      name: 'cronograma-orders-storage',
    }
  )
);
