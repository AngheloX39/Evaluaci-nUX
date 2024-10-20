import React, { useState } from "react";
import MenuSuperior from "../components/MenuSuperior2"; // Asegúrate de que la ruta es correcta
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const Rubrica = () => {
  const navigate = useNavigate();

  // Datos estáticos
  const categoriasPorCriterio = {
    Usabilidad: [
      { nombre: "Facilidad de aprendizaje", preguntas: ["¿Es fácil de aprender?", "¿La interfaz es intuitiva?"] },
      { nombre: "Retroalimentación del sistema", preguntas: ["¿La retroalimentación es clara?", "¿Se proporcionan mensajes de error?"] },
    ],
    Accesibilidad: [
      { nombre: "Interfaz de usuario", preguntas: ["¿Es accesible para personas con discapacidad?", "¿Se puede navegar usando el teclado?"] },
      { nombre: "Documentación y ayuda", preguntas: ["¿La documentación es clara y accesible?", "¿Existen tutoriales disponibles?"] },
    ],
    Simplicidad: [
      { nombre: "Reducción de complejidad", preguntas: ["¿El sistema es fácil de usar?", "¿Se evitan características innecesarias?"] },
    ],
    Consistencia: [
      { nombre: "Consistencia visual", preguntas: ["¿Los colores y fuentes son coherentes?", "¿Se mantienen los mismos patrones de diseño?"] },
    ],
    "Centrado en el Usuario": [
      { nombre: "Empatía", preguntas: ["¿Se consideran las necesidades del usuario?", "¿El diseño es inclusivo?"] },
    ],
  };

  const [preguntasAdicionales, setPreguntasAdicionales] = useState({});

  const agregarPregunta = (categoriaNombre, nuevaPregunta) => {
    setPreguntasAdicionales((prev) => ({
      ...prev,
      [categoriaNombre]: [...(prev[categoriaNombre] || []), nuevaPregunta],
    }));
  };

  const handleSiguiente = () => {
    navigate("/rubrica");
  };

  const handleAtras = () => {
    navigate("/CrearRubrica");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500">
      <MenuSuperior bgColor="white" textColor="#275dac" />

      <div className="flex justify-center items-center pt-12 pb-12">
        <div className="max-w-6xl w-full p-12 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-start mb-4">
            <div className="bg-[#275dac] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl">
              3
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">
              Elige las preguntas de ayuda
            </h2>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          <table className="min-w-full table-auto border-collapse rounded-lg mx-0 mb-4">
            <thead>
              <tr className="bg-[#275dac] rounded-t-lg">
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CATEGORÍA</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CRITERIOS</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">PREGUNTAS DE AYUDA</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoriasPorCriterio).flatMap(([criterio, categorias]) => {
                const rows = categorias.map((categoria, index) => (
                  <tr key={index}>
                    <td className="border-2 border-[#275dac] px-4 py-2">{index === 0 ? criterio : ""}</td>
                    <td className="border-2 border-[#275dac] px-4 py-2">{categoria.nombre}</td>
                    <td className="border-2 border-[#275dac] px-4 py-2">
                      {categoria.preguntas.map((pregunta, preguntaIndex) => (
                        <div key={preguntaIndex} className="flex items-center">
                          <label>
                            <input type="checkbox" className="mr-2" name={categoria.nombre} value={pregunta} />
                            {pregunta}
                          </label>
                        </div>
                      ))}
                      {preguntasAdicionales[categoria.nombre]?.map((pregunta, preguntaIndex) => (
                        <div key={preguntaIndex} className="flex items-center">
                          <label>
                            <input type="checkbox" className="mr-2" name={categoria.nombre} value={pregunta} />
                            {pregunta}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center mt-2">
                        <input
                          type="text"
                          placeholder="Añadir pregunta..."
                          className="p-2 border rounded flex-grow"
                          id={`input-${categoria.nombre}`} // ID único para cada campo
                        />
                        <button
                          className="ml-2 p-2 bg-[#275dac] text-white rounded"
                          onClick={() => {
                            const input = document.getElementById(`input-${categoria.nombre}`);
                            if (input && input.value.trim()) {
                              agregarPregunta(categoria.nombre, input.value.trim());
                              input.value = "";
                            }
                          }}
                        >
                          <AiOutlinePlus />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
                return rows;
              })}
            </tbody>
          </table>

          <hr className="border-t-4 border-[#275dac] my-4 mt-8" />

          <div className="flex justify-between mt-8">
            <button
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow hover:bg-[#b3cef5] transition duration-200 focus:outline-none"
              onClick={handleAtras}
            >
              Atrás
            </button>

            <button
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow hover:bg-[#b3cef5] transition duration-200 focus:outline-none"
              onClick={handleSiguiente}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rubrica;
