import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import MenuSuperior from "../components/MenuSuperior2";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore"; // Importamos los íconos
import { FaTrashAlt } from "react-icons/fa"; // Importar el icono de basura

const Rubrica = () => {
  const location = useLocation();
  const { nombreRubrica, criteriosSeleccionados } = location.state || {};
  const navigate = useNavigate();

  const [criteriosPorCategoria, setCriteriosPorCategoria] = useState({});
  const [nuevaCategoria, setNuevaCategoria] = useState(""); // Estado para nueva categoría
  const [categoriaActual, setCategoriaActual] = useState(""); // Estado para la categoría donde se va a agregar

  useEffect(() => {
    if (criteriosSeleccionados && Array.isArray(criteriosSeleccionados)) {
      const initialCriterios = criteriosSeleccionados.reduce((acc, categoria) => {
        acc[categoria] = [];
        return acc;
      }, {});
      setCriteriosPorCategoria(initialCriterios);
    }
  }, [criteriosSeleccionados]);

  const agregarCriterio = (categoria) => {
    setCategoriaActual(categoria); // Establecer la categoría actual
    setNuevaCategoria(""); // Reiniciar el input
  };

  const handleAgregarNuevaCategoria = () => {
    if (nuevaCategoria) {
      setCriteriosPorCategoria((prev) => ({
        ...prev,
        [categoriaActual]: [...prev[categoriaActual], { nombre: nuevaCategoria, preguntas: [] }],
      }));
      setNuevaCategoria(""); // Reiniciar el input
      setCategoriaActual(""); // Reiniciar la categoría actual
    } else {
      alert('Por favor, ingrese un nombre válido para la categoría.');
    }
  };

  const agregarPregunta = (categoria, criterioIndex) => {
    const input = document.getElementById(`input-${categoria}-${criterioIndex}`);
    const nuevaPregunta = input.value.trim();

    if (nuevaPregunta) {
      setCriteriosPorCategoria((prev) => {
        const criteriosActualizados = [...prev[categoria]];
        const nuevaPreguntaConID = { id: Date.now(), texto: nuevaPregunta };

        if (!criteriosActualizados[criterioIndex].preguntas.some(preg => preg.texto === nuevaPregunta)) {
          criteriosActualizados[criterioIndex].preguntas.push(nuevaPreguntaConID);
        }
        return { ...prev, [categoria]: criteriosActualizados };
      });
      input.value = '';
    } else {
      alert('Por favor, ingrese una pregunta válida.');
    }
  };

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

  const eliminarCriterio = (categoria, criterioIndex) => {
    setCriteriosPorCategoria((prev) => {
      const criteriosActualizados = [...prev[categoria]];
      criteriosActualizados.splice(criterioIndex, 1);
      return { ...prev, [categoria]: criteriosActualizados };
    });
  };

  const handleGuardar = async () => {
    try {
      const rubricaRef = collection(db, "EvUser");
      const criterioRef = collection(db, "criterio");

      const criteriosIds = [];

      for (const [categoria, criterios] of Object.entries(criteriosPorCategoria)) {
        for (const criterio of criterios) {
          const docRef = await addDoc(criterioRef, {
            nombre: criterio.nombre,
            preguntas: criterio.preguntas,
            categoria: categoria,
            timestamp: new Date(),
          });
          criteriosIds.push(docRef.id);
        }
      }

      await addDoc(rubricaRef, {
        criterios: criteriosIds,
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
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">TERMINA DE CREAR TU RÚBRICA :</h2>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">
              {nombreRubrica}
            </h2>
          </div>

          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-3" />

          <table className="min-w-full table-auto border-collapse rounded-lg mx-0 mb-4">
            <thead>
              <tr className="bg-[#275dac] rounded-t-lg">
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CRITERIOS</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">CATEGORÍA</th>
                <th className="border-2 border-[#275dac] px-4 py-2 text-left text-white">PREGUNTAS</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(criteriosPorCategoria).map(([categoria, criterios]) => (
                criterios.length === 0 ? (
                  <tr key={categoria}>
                    <td className="border-2 border-[#275dac] px-4 py-2">{categoria}</td>
                    <td className="border-2 border-[#275dac] px-4 py-2" colSpan="2">Añade las categorias</td>
                  </tr>
                ) : (
                  criterios.map((criterio, criterioIndex) => (
                    <tr key={criterioIndex}>
                      {criterioIndex === 0 && (
                        <td rowSpan={criterios.length} className="border-2 border-[#275dac] px-4 py-2">
                          {categoria}
                        </td>
                      )}
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.nombre}
                        <button
                          className="ml-2 text-red-600 bg-white"
                          onClick={() => eliminarCriterio(categoria, criterioIndex)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.preguntas.length === 0
                          ? "No hay preguntas aún."
                          : criterio.preguntas.map((pregunta) => (
                            <div key={pregunta.id} className="ml-4 flex justify-between items-center">
                              - {pregunta.texto}
                              <button
                                className="text-red-600 bg-white"
                                onClick={() => eliminarPregunta(categoria, criterioIndex, pregunta.id)}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          ))}

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

          <h3 className="text-center text-[#275dac] font-bold text-lg mb-4">SELECCIONA EL CRITERIO DONDE QUIERAS AGREGAR LA CATEGORÍA</h3>

          <div className="flex justify-center space-x-4 mt-4">
            {Object.keys(criteriosPorCategoria).map((categoria, index) => (
              <button
                key={index}
                className="w-40 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
                style={{
                  border: "none",
                  boxShadow: "none",
                }}
                onClick={() => agregarCriterio(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>

          {/* Muestra el input para nueva categoría */}
          {categoriaActual && (
            <div className="flex justify-between mb-4 pt-4 w-1/3 mx-auto"> {/* Reduce el ancho y centra el contenedor */}
              <input
                type="text"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Añadir nueva categoría..."
                className="p-2 border rounded w-full mr-2" // Añadir margen a la derecha del input
              />
              <button
                className="w-20 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
                style={{
                  border: "none",
                  boxShadow: "none",
                }}
                onClick={handleAgregarNuevaCategoria}
              >
                +
              </button>
            </div>
          )}

          <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500 my-3" />

          <div className="flex justify-between mt-8">
            <button
              className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
              style={{
                border: "none",
                boxShadow: "none",
              }}
              onClick={() => navigate(-1)}
            >
              Volver
            </button>

            <button
              className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
              style={{
                border: "none",
                boxShadow: "none",
              }}
              onClick={handleGuardar}
            >
              Guardar rúbrica
            </button>
          </div>

          {/* Botón de Siguiente */}
          <div className="flex justify-center mt-4">
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rubrica;
