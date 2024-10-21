import React, { useState } from "react";
import MenuSuperior from "../components/MenuSuperior2"; // Asegúrate de que la ruta es correcta
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"; // Importamos los íconos
import { useNavigate } from "react-router-dom";

const Rubrica = () => {
  const navigate = useNavigate();

  // Datos estáticos
  const [categoriasPorCriterio, setCategoriasPorCriterio] = useState({
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
  });

  const [preguntasAdicionales, setPreguntasAdicionales] = useState({});
  const [isEditing, setIsEditing] = useState({}); // Estado para rastrear las filas que están en modo de edición
  const [isEditingPregunta, setIsEditingPregunta] = useState({}); // Estado para rastrear preguntas en modo de edición

  const agregarPregunta = (categoriaNombre, nuevaPregunta) => {
    setPreguntasAdicionales((prev) => ({
      ...prev,
      [categoriaNombre]: [...(prev[categoriaNombre] || []), nuevaPregunta],
    }));
  };

  const agregarFila = (criterio) => {
    setCategoriasPorCriterio((prev) => ({
      ...prev,
      [criterio]: [...prev[criterio], { nombre: "Nombre de la Categoria", preguntas: [] }], // Agregar nueva categoría con nombre predeterminado
    }));
  };

  const eliminarFila = (criterio, index) => {
    setCategoriasPorCriterio((prev) => {
      const categorias = prev[criterio].filter((_, i) => i !== index);
      return {
        ...prev,
        [criterio]: categorias,
      };
    });
  };

  const toggleEditMode = (criterio, index) => {
    setIsEditing((prev) => ({
      ...prev,
      [`${criterio}-${index}`]: !prev[`${criterio}-${index}`], // Alternar el modo de edición para la categoría
    }));

    // Activar el modo de edición para las preguntas
    const preguntas = categoriasPorCriterio[criterio][index].preguntas;
    preguntas.forEach((_, preguntaIndex) => {
      toggleEditPregunta(criterio, index, preguntaIndex); // Alternar el modo de edición para cada pregunta
    });
  };

  const toggleEditPregunta = (criterio, index, preguntaIndex) => {
    setIsEditingPregunta((prev) => ({
      ...prev,
      [`${criterio}-${index}-${preguntaIndex}`]: !prev[`${criterio}-${index}-${preguntaIndex}`], // Alternar el modo de edición para preguntas
    }));
  };

  const handleInputChange = (criterio, index, field, value) => {
    setCategoriasPorCriterio((prev) => {
      const categorias = [...prev[criterio]];
      if (field === "nombre") {
        categorias[index].nombre = value; // Editar la categoría
      }
      return {
        ...prev,
        [criterio]: categorias,
      };
    });
  };

  const handlePreguntaChange = (criterio, index, preguntaIndex, value) => {
    setCategoriasPorCriterio((prev) => {
      const categorias = [...prev[criterio]];
      categorias[index].preguntas[preguntaIndex] = value; // Editar pregunta
      return {
        ...prev,
        [criterio]: categorias,
      };
    });
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
        <div className="max-w-7xl w-full p-12 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-start mb-4">
            <div className="bg-[#275dac] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl">
              2
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">Termina tu Rubrica</h2>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          {/* Tabla principal */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              {/* Encabezado */}
              <thead className="bg-[#275dac] text-white">
                <tr>
                  <th className="border px-4 py-2">CRITERIOS</th>
                  <th className="border px-4 py-2">CATEGORIAS</th>
                  <th className="border px-4 py-2">PREGUNTAS DE AYUDA</th>
                  <th className="border px-4 py-2">ACCIONES</th>
                </tr>
              </thead>

              {/* Cuerpo de la tabla */}
              <tbody>
                {Object.entries(categoriasPorCriterio).flatMap(([criterio, categorias], criterioIndex) => {
                  return categorias.map((categoria, index) => (
                    <tr key={`${criterioIndex}-${index}`}>
                      {/* Columna de criterios */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/4">
                        {index === 0 ? criterio : ""}
                      </td>

                      {/* Columna de categorías */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/4">
                        {isEditing[`${criterio}-${index}`] ? (
                          <input
                            type="text"
                            value={categoria.nombre}
                            onChange={(e) => handleInputChange(criterio, index, "nombre", e.target.value)}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          <span>{categoria.nombre}</span>
                        )}
                      </td>

                      {/* Columna de preguntas de ayuda */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/2">
                        {categoria.preguntas.map((pregunta, preguntaIndex) => (
                          <div key={preguntaIndex} className="flex items-center">
                            {isEditingPregunta[`${criterio}-${index}-${preguntaIndex}`] ? (
                              <input
                                type="text"
                                value={pregunta}
                                onChange={(e) => handlePreguntaChange(criterio, index, preguntaIndex, e.target.value)}
                                className="border p-1 rounded w-full mr-2"
                              />
                            ) : (
                              <label>
                                <input type="checkbox" className="mr-2" name={categoria.nombre} value={pregunta} />
                                {pregunta}
                              </label>
                            )}
                            
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

                      {/* Columna de acciones (Agregar/Eliminar/Editar) */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/12">
                        <div className="flex justify-center">
                          <div className="flex flex-col items-center">
                            <AiOutlinePlus
                              className="text-green-500 cursor-pointer hover:text-green-700 mb-2"
                              onClick={() => agregarFila(criterio)} // Llamar a la función de agregar fila
                            />
                            <AiOutlineDelete
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => eliminarFila(criterio, index)} // Llamar a la función de eliminar fila
                            />
                            <AiOutlineEdit
                              className="text-blue-500 cursor-pointer hover:text-blue-700"
                              onClick={() => toggleEditMode(criterio, index)} // Alternar el modo de edición de la categoría y preguntas
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button onClick={handleAtras} className="bg-[#275dac] text-white px-4 py-2 rounded">Atrás</button>
            <button onClick={handleSiguiente} className="bg-[#275dac] text-white px-4 py-2 rounded">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rubrica;
