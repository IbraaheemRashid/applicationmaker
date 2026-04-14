import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tracker } from './pages/Tracker';
import { Evaluate } from './pages/Evaluate';
import { CVBuilder } from './pages/CVBuilder';
import { InterviewPrep } from './pages/InterviewPrep';
import { Scan } from './pages/Scan';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/evaluate" element={<Evaluate />} />
          <Route path="/cv-builder" element={<CVBuilder />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
