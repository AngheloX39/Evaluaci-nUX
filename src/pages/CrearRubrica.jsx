import React, { useState } from "react";
import MenuSuperior2 from "../components/MenuSuperior2"; 
import { useNavigate } from 'react-router-dom';

const CrearRubrica = () => {
  const [nombreRubrica, setNombreRubrica] = useState(""); 
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState([]); 
  const navigate = useNavigate();

  const criterios = [
    "Usabilidad",
    "Simplicidad",
    "Accesibilidad",
    "Consistencia",
    "Centrado en el Usuario",
  ];

  const handleCheckboxChange = (criterio) => {
    if (criteriosSeleccionados.includes(criterio)) {
      setCriteriosSeleccionados(criteriosSeleccionados.filter(c => c !== criterio)); 
    } else {
      setCriteriosSeleccionados([...criteriosSeleccionados, criterio]);
    }
  };

  const handleNext = () => {
    if (nombreRubrica.trim() === "") {
      alert("Por favor, ingresa un nombre para la rúbrica.");
      return;
    }

    if (criteriosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos una categoría.");
      return;
    }

    // Navegar a la página Rubrica pasando el estado
    navigate('/Rubrica', { state: { nombreRubrica, criteriosSeleccionados } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MenuSuperior2 bgColor="white" textColor="#275dac" />

      {/* Contenedor principal con fondo degradado y movimiento */}
      <div
        className="flex-grow flex justify-center items-center bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500"
        style={{
          backgroundSize: '200% 200%',
          animation: 'moveBackground 10s ease infinite',
        }}
      >
        <div className="max-w-4xl w-full py-6 px-6 bg-white rounded-lg shadow-lg"> {/* Ajustamos el padding */}
          <div className="flex items-center justify-start mb-4">
            <div className="bg-[#275dac] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl">
              1
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">DALE UN NOMBRE Y SELECCIONA LOS CRITERIOS</h2>
          </div>

          {/* Reemplazar <hr> con un div para efecto de degradado */}
          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-4 mb-8"></div>
          <h2 className="text-xl font-bold text-[#275DAC] mb-2">Nombre de la Rúbrica</h2>
          <input
            type="text"
            value={nombreRubrica}
            onChange={(e) => setNombreRubrica(e.target.value)}
            className="border-2 border-[#275DAC] rounded-md p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-[#b9d5fe]"
            placeholder="Ingresa el nombre de la rúbrica"
          />

          {/* Otro div para la línea */}
          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-2" />

          <h2 className="text-xl font-bold text-[#275DAC] mb-2">Selecciona los Criterios</h2>
          <div className="flex flex-col space-y-4">
            {criterios.map((criterio) => (
              <label key={criterio} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={criteriosSeleccionados.includes(criterio)}
                  onChange={() => handleCheckboxChange(criterio)}
                  className="form-checkbox h-6 w-6 text-[#275dac] border-gray-300 rounded"
                />
                <span className="text-gray-700 font-semibold text-lg">
                  {criterio}
                </span>
              </label>
            ))}
          </div>

          {/* Último div para la línea */}
          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-3" />

          <div className="flex justify-between mt-4">
            <button
              onClick={() => navigate("/")}
              className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500" // Efecto degradado en hover
            >
              Inicio
            </button>
            <button
              onClick={handleNext}
              className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500 `} // Efecto degradado en hover
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Animación del fondo */}
      <style>{`
        @keyframes moveBackground {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default CrearRubrica;
