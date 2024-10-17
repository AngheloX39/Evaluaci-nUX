// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Importa el contexto de autenticación

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Opcional: puedes mostrar un cargador mientras se verifica el estado
  }

  return currentUser ? children : <Navigate to="/login" />; // Redirige al login si no está autenticado
};

export default ProtectedRoute;
