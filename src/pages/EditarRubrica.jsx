import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuSuperior from "../components/MenuSuperior2";
import { doc, getDoc, collection, updateDoc, addDoc } from "firebase/firestore"; // Importar addDoc
import { db } from "../firebase";
import { FaTrashAlt } from "react-icons/fa"; // Importar el icono de basura

const EditarRubrica = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rubrica, setRubrica] = useState(null); // Estado para almacenar la rúbrica
  const [criteriosPorCategoria, setCriteriosPorCategoria] = useState({}); // Estado para criterios por categoría

  const rubricaId = location.state?.rubricaId;

  useEffect(() => {
    const cargarRubrica = async () => {
      if (!rubricaId) {
        console.error("No se proporcionó el ID de la rúbrica.");
        return;
      }

      try {
        const rubricaRef = doc(db, "EvUser", rubricaId);
        const rubricaSnapshot = await getDoc(rubricaRef);

        if (rubricaSnapshot.exists()) {
          const rubricaData = rubricaSnapshot.data();
          setRubrica(rubricaData);
          console.log("Datos de la rúbrica:", rubricaData);

          // Cargar detalles de criterios
          await cargarDetallesCriterios(rubricaData.criterios);
        } else {
          console.log("No se encontró la rúbrica.");
        }
      } catch (error) {
        console.error("Error al cargar la rúbrica:", error);
      }
    };

    const cargarDetallesCriterios = async (criteriosIds) => {
      if (!Array.isArray(criteriosIds) || criteriosIds.length === 0) {
        console.log("No hay criterios para cargar.");
        return;
      }

      try {
        const criteriosPromesas = criteriosIds.map(async (id) => {
          const criterioRef = doc(db, "criterio", id);
          const criterioSnapshot = await getDoc(criterioRef);

          if (criterioSnapshot.exists()) {
            return criterioSnapshot.data(); // Retorna los detalles del criterio
          } else {
            console.log(`No se encontró el criterio con ID: ${id}`);
            return null;
          }
        });

        const criteriosResult = await Promise.all(criteriosPromesas);
        setCriteriosPorCategoria(agruparCriteriosPorCategoria(criteriosResult));
      } catch (error) {
        console.error("Error al cargar los detalles de los criterios:", error);
      }
    };

    const agruparCriteriosPorCategoria = (criterios) => {
      return criterios.reduce((acc, criterio) => {
        if (criterio) {
          const { categoria } = criterio;
          if (!acc[categoria]) {
            acc[categoria] = [];
          }
          acc[categoria].push({ ...criterio, preguntas: criterio.preguntas || [] });
        }
        return acc;
      }, {});
    };

    cargarRubrica();
  }, [rubricaId]);

  // Verifica si los datos se han cargado
  if (!rubrica) {
    return <div>Cargando...</div>; // Mensaje de carga
  }

  // Función para agregar una nueva pregunta a un criterio
  const agregarPregunta = (categoria, criterioIndex) => {
    const input = document.getElementById(`input-${categoria}-${criterioIndex}`);
    const nuevaPregunta = input.value.trim();

    if (nuevaPregunta) {
      setCriteriosPorCategoria((prev) => {
        const criteriosActualizados = { ...prev };
        const nuevaPreguntaConID = { id: Date.now(), texto: nuevaPregunta };

        // Evitar preguntas duplicadas
        if (!criteriosActualizados[categoria][criterioIndex].preguntas.some(preg => preg.texto === nuevaPregunta)) {
          criteriosActualizados[categoria][criterioIndex].preguntas.push(nuevaPreguntaConID);
        }
        return criteriosActualizados;
      });
      input.value = ''; // Limpiar el input
    } else {
      alert('Por favor, ingrese una pregunta válida.');
    }
  };

  // Función para eliminar una pregunta específica dentro de un criterio
  const eliminarPregunta = (categoria, criterioIndex, preguntaId) => {
    setCriteriosPorCategoria((prev) => {
      const criteriosActualizados = { ...prev };
      const preguntasActualizadas = criteriosActualizados[categoria][criterioIndex].preguntas.filter(
        (pregunta) => pregunta.id !== preguntaId
      );
      criteriosActualizados[categoria][criterioIndex].preguntas = preguntasActualizadas;
      return criteriosActualizados;
    });
  };

  // Función para eliminar un criterio
  

  // Función para guardar la rúbrica editada
  const handleGuardar = async () => {
    try {
      const rubricaRef = doc(db, "EvUser", rubricaId);
      const criteriosIds = [];

      for (const [categoria, criterios] of Object.entries(criteriosPorCategoria)) {
        for (const criterio of criterios) {
          // Si el criterio ya tiene un ID, actualizamos
          if (criterio.id) {
            const criterioRef = doc(db, "criterio", criterio.id);
            await updateDoc(criterioRef, {
              nombre: criterio.nombre,
              preguntas: criterio.preguntas,
              categoria: categoria,
            });
          } else {
            // Si es un nuevo criterio, guardar
            const docRef = await addDoc(collection(db, "criterio"), {
              nombre: criterio.nombre,
              preguntas: criterio.preguntas,
              categoria: categoria,
              timestamp: new Date(),
            });
            criteriosIds.push(docRef.id);
          }
        }
      }

      // Guardar la rúbrica actualizada
      await updateDoc(rubricaRef, {
        criterios: criteriosIds,
        nombreRubrica: rubrica.nombreRubrica,
        timestamp: new Date(),
      });

      alert("Rúbrica guardada exitosamente.");
      navigate("/Home");
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500">
      <MenuSuperior bgColor="white" textColor="#275dac" />

      <div className="flex justify-center items-center pt-12 pb-12">
        <div className="max-w-6xl w-full p-12 bg-white rounded-lg shadow-lg">
          <h2 className="text-[#275dac] font-bold text-2xl mb-4">
            Editando Rúbrica: {rubrica.nombreRubrica}
          </h2>
          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

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
                    <td className="border-2 border-[#275dac] px-4 py-2" colSpan="3">No hay criterios en esta categoría.</td>
                  </tr>
                ) : (
                  criterios.map((criterio, criterioIndex) => (
                    <tr key={criterio.id || criterioIndex}>
                      <td className="border-2 border-[#275dac] px-4 py-2">{categoria}</td>
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.nombre}
                    
                      </td>
                      <td className="border-2 border-[#275dac] px-4 py-2">
                        {criterio.preguntas.map((pregunta) => (
                          <div key={pregunta.id} className="flex justify-between items-center">
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

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button
              className="bg-[#275dac] text-white py-2 px-8 rounded-lg shadow hover:bg-[#b3cef5] transition duration-200 focus:outline-none"
              onClick={() => navigate("/Home")}
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
    </div>
  );
};

export default EditarRubrica;
