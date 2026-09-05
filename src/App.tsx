import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PatientsList from './pages/patients/PatientsList';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<PatientsList />} />
        {/*
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="medications" element={<MedicationsList />} />
        <Route path="refills" element={<RefillsList />} />
        <Route path="messages" element={<MessagesList />} />
        <Route path="drugs" element={<DrugMaster />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UsersList />} />
        <Route path="settings" element={<Settings />} />
        */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
