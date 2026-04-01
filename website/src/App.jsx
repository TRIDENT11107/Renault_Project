import { Toaster } from '@/components/ui/sonner';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import IndianEcosystem from './pages/IndianEcosystem';
import MarketOverview from './pages/MarketOverview';
import MarketPositioning from './pages/MarketPositioning';
import TechnologyRoadmap from './pages/TechnologyRoadmap';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MarketOverview />} />
            <Route path="market-positioning" element={<MarketPositioning />} />
            <Route path="indian-ecosystem" element={<IndianEcosystem />} />
            <Route path="technology-roadmap" element={<TechnologyRoadmap />} />
            <Route path="benchmarking" element={<Navigate to="/market-positioning" replace />} />
            <Route path="insights" element={<Navigate to="/indian-ecosystem" replace />} />
            <Route path="roadmap" element={<Navigate to="/technology-roadmap" replace />} />
            <Route path="technologies" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster />
    </div>
  );
}

export default App;
