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

      <div className="flex-grow flex justify-center items-center bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 overflow-hidden">
        <div className="max-w-4xl w-full py-6 px-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-[#275DAC] mb-2">Nombre de la Rúbrica</h2>
          <input
            type="text"
            value={nombreRubrica}
            onChange={(e) => setNombreRubrica(e.target.value)}
            className="border-2 border-[#275DAC] rounded-md p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-[#b9d5fe]"
            placeholder="Ingresa el nombre de la rúbrica"
          />

          <hr className="border-t-4 border-[#275dac] my-2" />

          <h3 className="text-lg font-bold text-[#275DAC] mb-2">Selecciona los Criterios</h3>
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

          <hr className="border-t-4 border-[#275dac] my-3" />

          <div className="flex justify-between mt-4">
            <button
              onClick={() => navigate("/")}
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow transition duration-200 hover:bg-[#b3cef5] hover:text-[#275DAC] focus:outline-none focus:ring-0"
            >
              Inicio
            </button>
            <button
              onClick={handleNext}
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow transition duration-200 hover:bg-[#b3cef5] hover:text-[#275DAC] focus:outline-none focus:ring-0"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearRubrica;
