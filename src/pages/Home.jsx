import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { HiDownload, HiTrash, HiPencil, HiClipboardCheck } from "react-icons/hi";
import MenuSuperior from "../components/MenuSuperior";
import { Link, useNavigate } from 'react-router-dom';
import { Timestamp } from "firebase/firestore";

const Home = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [eliminacionPendiente, setEliminacionPendiente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

  const navigate = useNavigate();

  const obtenerEvaluaciones = async () => {
    try {
      const evaluacionesSnapshot = await getDocs(collection(db, "EvUser"));
      const evaluacionesList = evaluacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvaluaciones(evaluacionesList);
    } catch (error) {
      setMensaje(`Error al cargar evaluaciones: ${error.message}`);
      setMostrarNotificacion(true);
    }
  };

  useEffect(() => {
    obtenerEvaluaciones();
  }, []);

  const confirmarEliminacion = (evaluacion) => {
    setEliminacionPendiente(evaluacion);
  };

  const cancelarEliminacion = () => {
    setEliminacionPendiente(null);
  };

  const handleDelete = async () => {
    if (!eliminacionPendiente) return;

    try {
      await deleteDoc(doc(db, "EvUser", eliminacionPendiente.id));
      setEvaluaciones(prev => prev.filter(evaluacion => evaluacion.id !== eliminacionPendiente.id));
      setMensaje(`La evaluación "${eliminacionPendiente.nombreRubrica}" ha sido eliminada correctamente.`);
    } catch (error) {
      setMensaje(`Error al eliminar la evaluación: ${error.message}`);
    } finally {
      setEliminacionPendiente(null);
      setMostrarNotificacion(true);
    }
  };

  useEffect(() => {
    if (mostrarNotificacion) {
      const timer = setTimeout(() => setMostrarNotificacion(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [mostrarNotificacion]);

  const handleEdit = (evaluacion) => {
    navigate("/EditarRubrica", {
      state: {
        rubricaId: evaluacion.id,
        nombreRubrica: evaluacion.nombreRubrica,
        criteriosSeleccionados: evaluacion.criterios
      }
    });
  };

  const handleDownload = (id) => {
    console.log("Descargar PDF de la evaluación con ID:", id);
  };

  const handleEvaluate = (evaluacion) => {
    navigate("/Evaluacion", {
      state: {
        rubricaId: evaluacion.id,
        nombreRubrica: evaluacion.nombreRubrica,
        criteriosSeleccionados: evaluacion.criterios // Pasamos los criterios seleccionados
      }
    });
  };


  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MenuSuperior bgColor="#275dac" textColor="#ffffff" />

      <div className="flex justify-end mt-4 mr-10">
        <button
          className="w-40 py-2 rounded-md mt-2 text-base transition-all duration-300 mr-4"
          style={{
            backgroundImage: "linear-gradient(to right, #1e40af, #3b82f6, #2dd4bf)",
            color: "#ffffff",
            border: "none",
            boxShadow: "none"
          }}
          onClick={() => console.log("Ir a Evaluaciones")}
        >
          Evaluaciones
        </button>

        <Link to="/CrearRubrica">
          <button
            className="w-40 py-2 rounded-md mt-2 text-base transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
            style={{ backgroundColor: "#275DAC", color: "#ffffff", border: "none" }}
            onClick={() => console.log("Crear nueva rúbrica")}
          >
            Crear Rúbrica
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap justify-start mt-4 ml-10">
        {evaluaciones.length === 0 ? (
          <p className="text-gray-500">No hay evaluaciones disponibles.</p>
        ) : (
          evaluaciones.map((evaluacion) => (
            <div key={evaluacion.id} className="bg-white shadow-lg rounded-lg w-80 border-2 border-gray-300 overflow-hidden m-4">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2 text-[#275DAC] text-center">
                  {evaluacion.nombreRubrica}
                </h2>
                <p className="text-gray-500 text-center">
                  {`Creada el: ${evaluacion.timestamp
                    ? (evaluacion.timestamp instanceof Timestamp
                      ? evaluacion.timestamp.toDate().toLocaleDateString()
                      : evaluacion.timestamp)
                    : "Fecha no disponible"
                    }`}
                </p>
              </div>

              <div className="flex">
                <button
                  className="flex flex-col items-center justify-center w-1/4 bg-[#FF3E3E] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-400"
                  onClick={() => confirmarEliminacion(evaluacion)}
                >
                  <HiTrash className="text-lg" />
                  <span className="text-xs">Eliminar</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center w-1/4 bg-[#275DAC] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-500"
                  onClick={() => handleEdit(evaluacion)}
                >
                  <HiPencil className="text-lg" />
                  <span className="text-xs">Editar</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center w-1/2 bg-[#60ee3d] text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-green-200 hover:to-green-400"
                  onClick={() => handleEvaluate(evaluacion)} // Mantiene la funcionalidad de Evaluar
                >
                  <HiClipboardCheck className="text-lg" />
                  <span className="text-xs">Visualizar</span> {/* Cambiado a "Ver" */}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {eliminacionPendiente && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">¿Estás seguro de que deseas eliminar esta evaluación?</h2>
            <p>{eliminacionPendiente.nombreRubrica}</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md mr-2"
                onClick={cancelarEliminacion}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarNotificacion && (
        <div className="fixed bottom-4 right-4 bg-white text-black p-4 rounded-lg shadow-lg">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Home;
