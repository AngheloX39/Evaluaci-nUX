// src/components/LogoutButton.jsx
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importa el hook de navegación
import app from '../firebase'; // Importa la configuración de Firebase

const auth = getAuth(app);

const LogoutButton = () => {
  const navigate = useNavigate(); // Crea el hook de navegación

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión
      console.log('Usuario cerrado sesión.');
      navigate('/'); // Redirige a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <button onClick={handleLogout} className='bg-cafe1 p-2 rounded-xl hover:bg-yellow-400'>
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
