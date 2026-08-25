import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import TrackingTable from './pages/TrackingTable';

function App() {
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
