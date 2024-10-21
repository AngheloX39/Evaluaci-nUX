import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import MenuSuperior from "../components/MenuSuperior2";
import { db } from "../firebase";
import { collection, addDoc, AiOutlineDelete, AiOutlineEdit } from "firebase/firestore"; // Importamos los íconos
import { FaTrashAlt } from "react-icons/fa"; // Importar el icono de basura

const Rubrica = () => {
  const location = useLocation();
  const { nombreRubrica, criteriosSeleccionados } = location.state || {};
  const navigate = useNavigate();

  // Estado para los criterios por categoría
  const [criteriosPorCategoria, setCriteriosPorCategoria] = useState({});

  // Efecto para inicializar los criterios desde la información recibida
  useEffect(() => {
    if (criteriosSeleccionados && Array.isArray(criteriosSeleccionados)) {
      const initialCriterios = criteriosSeleccionados.reduce((acc, categoria) => {
        acc[categoria] = []; // Asegúrate de que esto se ajuste a la estructura correcta
        return acc;
      }, {});
      setCriteriosPorCategoria(initialCriterios);
    }
  }, [criteriosSeleccionados]);

  // Función para agregar un nuevo criterio
  const agregarCriterio = (categoria) => {
    const nuevoCriterio = prompt(`Introduce un nombre para el nuevo criterio en la categoría ${categoria}:`);
    if (nuevoCriterio) {
      setCriteriosPorCategoria((prev) => ({
        ...prev,
        [categoria]: [...prev[categoria], { nombre: nuevoCriterio, preguntas: [] }],
      }));
    }
  };

  // Función para agregar una pregunta a un criterio
  const agregarPregunta = (categoria, criterioIndex) => {
    const input = document.getElementById(`input-${categoria}-${criterioIndex}`);
    const nuevaPregunta = input.value.trim();

    if (nuevaPregunta) {
      setCriteriosPorCategoria((prev) => {
        const criteriosActualizados = [...prev[categoria]];
        const nuevaPreguntaConID = { id: Date.now(), texto: nuevaPregunta };

        // Evitar preguntas duplicadas
        if (!criteriosActualizados[criterioIndex].preguntas.some(preg => preg.texto === nuevaPregunta)) {
          criteriosActualizados[criterioIndex].preguntas.push(nuevaPreguntaConID);
        }
        return { ...prev, [categoria]: criteriosActualizados };
      });
      input.value = ''; // Limpiar el input
    } else {
      alert('Por favor, ingrese una pregunta válida.');
    }
  };

  // Función para eliminar una pregunta específica dentro de un criterio
  const eliminarPregunta = (categoria, criterioIndex, preguntaId) => {
    setCriteriosPorCategoria((prev) => {
      const criteriosActualizados = [...prev[categoria]];
      const preguntasActualizadas = criteriosActualizados[criterioIndex].preguntas.filter(
        (pregunta) => pregunta.id !== preguntaId
      );
      criteriosActualizados[criterioIndex].preguntas = preguntasActualizadas;
      return { ...prev, [categoria]: criteriosActualizados };
    });
  };

  // Función para eliminar un criterio completo
  const eliminarCriterio = (categoria, criterioIndex) => {
    setCriteriosPorCategoria((prev) => {
      const criteriosActualizados = [...prev[categoria]];
      criteriosActualizados.splice(criterioIndex, 1);
      return { ...prev, [categoria]: criteriosActualizados };
    });
  };

  // Función para guardar la rúbrica y criterios en Firebase
  const handleGuardar = async () => {
    try {
      const rubricaRef = collection(db, "EvUser");
      const criterioRef = collection(db, "criterio");

      // Guardar criterios en la colección 'criterio' y mantener un array de ids
      const criteriosIds = [];

      for (const [categoria, criterios] of Object.entries(criteriosPorCategoria)) {
        for (const criterio of criterios) {
          // Guardar cada criterio con su categoría y preguntas
          const docRef = await addDoc(criterioRef, {
            nombre: criterio.nombre,
            preguntas: criterio.preguntas,
            categoria: categoria,  // Guardar la categoría asociada al criterio
            timestamp: new Date(),
          });
          criteriosIds.push(docRef.id); // Guarda el ID del nuevo criterio
        }
      }

      // Ahora guarda la rúbrica con referencias a los IDs de criterios
      await addDoc(rubricaRef, {
        criterios: criteriosIds, // Guarda las referencias a los criterios
        nombreRubrica: nombreRubrica,
        timestamp: new Date(),
      });

      alert("Rúbrica guardada exitosamente.");
      navigate("/Home");
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500"
    style={{
      backgroundSize: '200% 200%',
      animation: 'moveBackground 10s ease infinite',
    }}
    >
      <MenuSuperior bgColor="white" textColor="#275dac" />

      <div className="flex justify-center items-center pt-12 pb-12">
        <div className="max-w-7xl w-full p-12 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-start mb-4">
            <div className="bg-[#275dac] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl">
              2
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">TERMINA DE CREAR TU RÚBRICA</h2>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">
              Elige las preguntas de ayuda para la rúbrica: {nombreRubrica}
            </h2>
          </div>

          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-3" />

          {/* Tabla para mostrar criterios y preguntas */}
          <table className="min-w-full table-auto border-collapse rounded-lg mx-0 mb-4">
            <thead>
              <tr className="bg-[#275dac] rounded-t-lg">
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CATEGORÍA</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CRITERIOS</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">PREGUNTAS</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(criteriosPorCategoria).map(([categoria, criterios]) => (
                criterios.length === 0 ? (
                  <tr key={categoria}>
                    <td className="border-2 border-[#275dac] px-4 py-2">{categoria}</td>
                    <td className="border-2 border-[#275dac] px-4 py-2" colSpan="2">No hay criterios añadidos.</td>
                  </tr>
                ) : (
                  criterios.map((criterio, criterioIndex) => (
                    <tr key={criterioIndex}>
                      {/* Mostrar categoría solo en la primera fila del grupo */}
                      {criterioIndex === 0 && (
                        <td rowSpan={criterios.length} className="border-2 border-[#275dac] px-4 py-2">
                          {categoria}
                        </td>
                      )}
                      {/* Mostrar el criterio */}
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.nombre}
                        <button
                          className="ml-2 text-red-600"
                          onClick={() => eliminarCriterio(categoria, criterioIndex)}
                        >
                          <FaTrashAlt /> {/* Ícono de eliminar criterio */}
                        </button>
                      </td>
                      {/* Mostrar preguntas del criterio */}
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.preguntas.length === 0
                          ? "No hay preguntas aún."
                          : criterio.preguntas.map((pregunta) => (
                            <div key={pregunta.id} className="ml-4 flex justify-between items-center">
                              - {pregunta.texto}
                              <button
                                className="text-red-600"
                                onClick={() => eliminarPregunta(categoria, criterioIndex, pregunta.id)}
                              >
                                <FaTrashAlt /> {/* Ícono de eliminar pregunta */}
                              </button>
                            </div>
                          ))}
                        {/* Input para agregar nueva pregunta */}
                        <div className="flex items-center mt-2">
                          <input
                            type="text"
                            id={`input-${categoria}-${criterioIndex}`}
                            placeholder="Añadir pregunta..."
                            className="p-2 border rounded flex-grow"
                          />
                          <button
                            className="ml-2 p-2 bg-[#275dac] text-white rounded"
                            onClick={() => agregarPregunta(categoria, criterioIndex)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ))}
            </tbody>
          </table>

          {/* Botón para agregar criterios */}
          <div className="flex justify-center mt-4">
            {Object.keys(criteriosPorCategoria).map((categoria, index) => (
              <button
                key={index}
                className="mt-4 bg-green-500 text-white p-2 rounded mx-2"
                onClick={() => agregarCriterio(categoria)}
              >
                + Añadir Criterio en {categoria}
              </button>
            ))}
          </div>

          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-3" />

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow hover:bg-[#b3cef5] transition duration-200 focus:outline-none"
              onClick={() => navigate("/CrearRubrica")}
            >
              Atrás
            </button>

            <button
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow hover:bg-[#b3cef5] transition duration-200 focus:outline-none"
              onClick={handleGuardar}
            >
              Guardar
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

export default Rubrica;
