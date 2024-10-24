import React from 'react';
import ProtectedRoute from './ProtectedRoute'; // Importa el componente de ruta protegida


import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa los componentes que vas a usar en las rutas
import LayoutPrincipal from './pages/LayoutPrincipal';
import Login from './pages/Login';
import Registro from './pages/Registro';
import UserExperience from './pages/UserExperience';
import CrearEvaluacion from './pages/CrearEvaluacion';
import DefaultExperience from './pages/DefaultExperience';

// Define las rutas usando createBrowserRouter
function App() {
  const router = createBrowserRouter([
    {
        

      path: "/",
      element: <LayoutPrincipal />,  // Componente que envuelve las páginas
      children: [
        {
          path: "/",
          element: <Login />,  // Componente que se renderiza en la ruta "/"
        },
        {
          path: "/registro",
          element: <Registro />,  // Componente que se renderiza en la ruta "/"
        },
        {
          path: "/UserExperience",
          element: <ProtectedRoute><UserExperience /></ProtectedRoute>,
        },
        {
          path: "/CrearEvaluacion",
          element: <ProtectedRoute><CrearEvaluacion /></ProtectedRoute>,
        },
        {
          path: "/DefaultExperience",
          element: <ProtectedRoute><DefaultExperience /></ProtectedRoute>,
        },
        // Puedes agregar más rutas si es necesario
      ],
    },
  ]);

  return (
    <RouterProvider router={router} />  // Aquí devuelves el RouterProvider
  );
}

export default App;



