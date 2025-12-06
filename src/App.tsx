import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

// Lazy load components that use API to prevent errors on home page
const OnboardForm = React.lazy(() => 
  import('./components/OnboardForm').then(module => ({ default: module.OnboardForm }))
);
const ViewEvents = React.lazy(() => 
  import('./pages/ViewEvents').then(module => ({ default: module.ViewEvents }))
);
const MongoDBDetails = React.lazy(() => 
  import('./pages/MongoDBDetails').then(module => ({ default: module.MongoDBDetails }))
);
const KafkaDetails = React.lazy(() => 
  import('./pages/KafkaDetails').then(module => ({ default: module.KafkaDetails }))
);

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #60a5fa, #93c5fd, #60a5fa)'
        }}>
          <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboard" element={<OnboardForm />} />
          <Route path="/onboardonp" element={<OnboardForm />} />
          <Route path="/events" element={<ViewEvents />} />
          <Route path="/mongodb" element={<MongoDBDetails />} />
          <Route path="/kafka" element={<KafkaDetails />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
