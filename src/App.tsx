import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

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
const UserGuide = React.lazy(() => 
  import('./pages/UserGuide').then(module => ({ default: module.UserGuide }))
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/onboard" element={<ProtectedRoute><OnboardForm /></ProtectedRoute>} />
            <Route path="/onboardonp" element={<ProtectedRoute><OnboardForm /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><ViewEvents /></ProtectedRoute>} />
            <Route path="/mongodb" element={<ProtectedRoute><MongoDBDetails /></ProtectedRoute>} />
            <Route path="/kafka" element={<ProtectedRoute><KafkaDetails /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
