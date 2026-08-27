import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import TrackingTable from './pages/TrackingTable';
import { useOrderStore } from './store/useOrderStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

function App() {
  const initListener = useOrderStore(state => state.initListener);

  useEffect(() => {
    initListener();
    
    // Migracion de LocalStorage a Firebase
    const migrateData = async () => {
      try {
        const localData = localStorage.getItem('cronograma-orders-storage');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed && parsed.state && parsed.state.orders && parsed.state.orders.length > 0) {
            console.log('Migrando ' + parsed.state.orders.length + ' ordenes a Firebase...');
            for (const order of parsed.state.orders) {
              await setDoc(doc(db, 'orders', order.id), order);
            }
            // Borrar para no migrar de nuevo
            localStorage.removeItem('cronograma-orders-storage');
            console.log('Migracion exitosa');
          }
        }
      } catch (err) {
        console.error('Error en migracion:', err);
      }
    };
    
    migrateData();
  }, [initListener]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="tracking" element={<TrackingTable />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
