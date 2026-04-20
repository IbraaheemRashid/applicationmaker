import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Apply } from './pages/Apply';
import { Pipeline } from './pages/Pipeline';
import { Interview } from './pages/Interview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Apply />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
