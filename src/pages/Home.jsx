import React, { useState } from "react";
import { HiDownload, HiTrash, HiPencil, HiClipboardCheck } from "react-icons/hi"; // Iconos de eliminar, descargar, editar y evaluar
import MenuSuperior from "../components/MenuSuperior"; // Asegúrate de tener la ruta correcta para importar el menú

const Home = () => {
  // Obtener la fecha y hora actuales
  const createdAt = new Date().toLocaleString(); // Formato de fecha y hora locales

  const [selectedButton, setSelectedButton] = useState(null); // Estado para el botón seleccionado

  const handleDelete = () => {
    console.log("Eliminar card");
  };

  const handleEdit = () => {
    console.log("Editar card");
  };

  const handleDownload = () => {
    console.log("Descargar PDF");
  };

  const handleEvaluate = () => {
    console.log("Realizar evaluación");
  };

  const handleEvaluaciones = () => {
    console.log("Ir a Evaluaciones");
    setSelectedButton("evaluaciones"); // Marcar "Evaluaciones" como seleccionado
  };

  const handleCrearRubrica = () => {
    console.log("Crear nueva rúbrica");
    setSelectedButton("crearRubrica"); // Marcar "Crear Rúbrica" como seleccionado
  };

  // Función para obtener el color de fondo y el color de texto del botón
  const getButtonStyles = (buttonName) => {
    if (selectedButton === buttonName) {
      return {
        backgroundColor: "transparent", // Mantener el fondo transparente para aplicar el degradado
        backgroundImage: "linear-gradient(to right, #275DAC, #3D99D1, #2DCA8C)", // Aplicar el degradado cuando está seleccionado
        color: "#ffffff", // Color del texto cuando está seleccionado
      };
    }
    return {
      backgroundColor: "#275DAC", // Color de fondo por defecto
      color: "#ffffff", // Color de texto por defecto
    };
  };

  return (
    <div className="bg-white h-screen flex flex-col">
      <MenuSuperior bgColor="#275dac" textColor="#ffffff" />

      {/* Contenedor de los botones Evaluaciones y Crear Rúbrica */}
      <div className="flex justify-end mt-4 mr-10">
        <button
          className="w-40 py-2 rounded-md mt-2 text-base transition-all duration-300 mr-4"
          style={getButtonStyles("evaluaciones")}
          onClick={handleEvaluaciones}
        >
          Evaluaciones
        </button>
        <button
          className="w-40 py-2 rounded-md mt-2 text-base transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500" // Agregar efecto hover aquí
          style={getButtonStyles("crearRubrica")}
          onClick={handleCrearRubrica}
        >
          Crear Rúbrica
        </button>
      </div>

      {/* Contenedor de la card alineada a la izquierda y separada del menú */}
      <div className="flex justify-start mt-4 ml-10">
        <div className="bg-white shadow-lg rounded-lg w-80 border-2 border-gray-300 overflow-hidden">
          {/* Nombre de la rúbrica en el medio */}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2 text-[#275DAC] text-center">Nombre de la Rúbrica</h2>
            {/* Fecha y hora de creación */}
            <p className="text-gray-500 text-center">{`Creada el: ${createdAt}`}</p>
          </div>

          {/* Botones en una fila en la parte inferior */}
          <div className="flex">
            {/* Botón Eliminar (Rojo) */}
            <button
              className="flex flex-col items-center justify-center w-1/4 bg-[#FF3E3E] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-400"
              onClick={handleDelete}
            >
              <HiTrash className="text-lg" />
              <span className="text-xs">Eliminar</span>
            </button>

            {/* Botón Editar (Azul) */}
            <button
              className="flex flex-col items-center justify-center w-1/4 bg-[#275DAC] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-500"
              onClick={handleEdit}
            >
              <HiPencil className="text-lg" />
              <span className="text-xs">Editar</span>
            </button>

            {/* Botón Descargar PDF (Verde) */}
            <button
              className="flex flex-col items-center justify-center w-1/4 bg-[#2DCA8C] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-400"
              onClick={handleDownload}
            >
              <HiDownload className="text-lg" />
              <span className="text-xs">Descargar</span>
            </button>

            {/* Botón Evaluar (Amarillo) */}
            <button
              className="flex flex-col items-center justify-center w-1/4 bg-[#FBB13C] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-400"
              onClick={handleEvaluate}
            >
              <HiClipboardCheck className="text-lg" />
              <span className="text-xs">Evaluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
