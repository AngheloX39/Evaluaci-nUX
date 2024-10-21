import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase'; // Asegúrate de tener la ruta correcta para importar la configuración de Firebase
import { HiDownload, HiTrash, HiPencil, HiClipboardCheck } from "react-icons/hi";
import MenuSuperior from "../components/MenuSuperior";
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Timestamp } from "firebase/firestore"; // Importa Timestamp

const Home = () => {
  const [evaluaciones, setEvaluaciones] = useState([]); // Estado para almacenar las evaluaciones
  const [eliminacionPendiente, setEliminacionPendiente] = useState(null); // Estado para la evaluación que se va a eliminar
  const [mensaje, setMensaje] = useState(""); // Estado para los mensajes de notificación
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false); // Estado para mostrar la notificación

  const navigate = useNavigate(); // Inicializa navigate

  // Función para obtener las evaluaciones de Firebase
  const obtenerEvaluaciones = async () => {
    try {
      const evaluacionesSnapshot = await getDocs(collection(db, "EvUser"));
      const evaluacionesList = evaluacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvaluaciones(evaluacionesList); // Guardar las evaluaciones en el estado
    } catch (error) {
      setMensaje(`Error al cargar evaluaciones: ${error.message}`);
      setMostrarNotificacion(true);
    }
  };

  useEffect(() => {
    obtenerEvaluaciones(); // Cargar evaluaciones al montar el componente
  }, []);

  // Función para confirmar la eliminación de una evaluación
  const confirmarEliminacion = (evaluacion) => {
    setEliminacionPendiente(evaluacion); // Establecer la evaluación a eliminar
  };

  // Función para cancelar la eliminación
  const cancelarEliminacion = () => {
    setEliminacionPendiente(null); // Limpiar el estado
  };

  // Función para eliminar una evaluación de Firebase
  const handleDelete = async () => {
    if (!eliminacionPendiente) return;

    try {
      await deleteDoc(doc(db, "EvUser", eliminacionPendiente.id)); // Eliminar el documento de Firebase
      setEvaluaciones(prev => prev.filter(evaluacion => evaluacion.id !== eliminacionPendiente.id)); // Actualizar el estado
      setMensaje(`La evaluación "${eliminacionPendiente.nombreRubrica}" ha sido eliminada correctamente.`);
    } catch (error) {
      setMensaje(`Error al eliminar la evaluación: ${error.message}`);
    } finally {
      setEliminacionPendiente(null); // Limpiar la evaluación pendiente
      setMostrarNotificacion(true); // Mostrar la notificación
    }
  };

  // Cerrar la notificación después de unos segundos
  useEffect(() => {
    if (mostrarNotificacion) {
      const timer = setTimeout(() => setMostrarNotificacion(false), 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador
    }
  }, [mostrarNotificacion]);

  // Función para navegar a la página de edición
  const handleEdit = (evaluacion) => {
    console.log("Navegando a EditarRubrica con:", evaluacion); // Agrega este log
    navigate("/EditarRubrica", {
      state: {
        rubricaId: evaluacion.id,
        nombreRubrica: evaluacion.nombreRubrica,
        criteriosSeleccionados: evaluacion.criterios // Asegúrate de enviar los criterios seleccionados
      }
    });
  };

  const handleDownload = (id) => {
    console.log("Descargar PDF de la evaluación con ID:", id);
  };

  const handleEvaluate = (id) => {
    console.log("Realizar evaluación con ID:", id);
  };

  return (
    <div>
      <MenuSuperior bgColor="#275dac" textColor="#ffffff" />

      <div className="flex justify-end mt-4 mr-10">
        <button
          className="py-2 px-4 rounded-md mr-4"
          style={{ backgroundColor: "#275DAC", color: "#ffffff" }}
          onClick={() => console.log("Ir a Evaluaciones")}
        >
          Evaluaciones
        </button>
        <Link to="/CrearRubrica">
          <button
            className="py-2 px-4 rounded-md"
            style={{ backgroundColor: "#275DAC", color: "#ffffff" }}
            onClick={() => console.log("Crear nueva rúbrica")}
          >
            Crear Rúbrica
          </button>
        </Link>
      </div>

      {/* Mostrar las evaluaciones cargadas de Firebase */}
      <div className="flex flex-wrap justify-start mt-4 ml-10">
        {evaluaciones.length === 0 ? (
          <p className="text-gray-500">No hay evaluaciones disponibles.</p>
        ) : (
          evaluaciones.map((evaluacion) => (
            <div key={evaluacion.id} className="bg-white shadow-lg rounded-lg w-80 border-2 border-gray-300 overflow-hidden m-4">
              <div className="p-4">
                {/* Nombre de la evaluación */}
                <h2 className="text-xl font-bold mb-2 text-[#275DAC] text-center">
                  {evaluacion.nombreRubrica}
                </h2>
                {/* Fecha de creación */}
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
                  className="flex flex-col items-center justify-center w-1/4 bg-[#FF3E3E] text-white py-3"
                  onClick={() => confirmarEliminacion(evaluacion)}
                >
                  <HiTrash className="text-lg" />
                  <span className="text-xs">Eliminar</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center w-1/4 bg-[#275DAC] text-white py-3"
                  onClick={() => handleEdit(evaluacion)} // Modificado para llamar a handleEdit
                >
                  <HiPencil className="text-lg" />
                  <span className="text-xs">Editar</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center w-1/4 bg-[#2DCA8C] text-white py-3"
                  onClick={() => handleDownload(evaluacion.id)}
                >
                  <HiDownload className="text-lg" />
                  <span className="text-xs">Descargar</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center w-1/4 bg-[#FBB13C] text-white py-3"
                  onClick={() => handleEvaluate(evaluacion.id)}
                >
                  <HiClipboardCheck className="text-lg" />
                  <span className="text-xs">Evaluar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
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

      {/* Notificación */}
      {mostrarNotificacion && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Home;
