import React from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { Link } from 'react-router-dom';

const MenuSuperior = ({ bgColor, textColor }) => {
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogout = () => {
    console.log("Cerrar sesión");
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  return (
    <div
      className="flex justify-between items-center p-3"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="text-2xl font-bold">
        <Link to="/Home">
        UXGrade
        </Link>
        
      </div>
      <div className="relative flex items-center">
        {/* Botón de cerrar sesión más compacto */}
        <button
          className="px-3 py-1 hover:bg-gray-200 rounded-md shadow-md"
          style={{ backgroundColor: textColor, color: bgColor }}
          onClick={handleLogout} // Lógica para cerrar sesión
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default MenuSuperior;
