import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // Importar html2canvas
import MenuSuperior from "../components/MenuSuperior2"; // Asegúrate de que la ruta es correcta
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // Importar Firebase
import { db } from "../firebase";
import { Link } from 'react-router-dom';

const Evaluacion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rubrica, setRubrica] = useState(null); // Estado para almacenar la rúbrica
  const [criteriosPorCategoria, setCriteriosPorCategoria] = useState({}); // Estado para criterios por categoría
  const [puntajesSeleccionados, setPuntajesSeleccionados] = useState({});
  const [mostrarPuntuacion, setMostrarPuntuacion] = useState(false); // Estado para mostrar la puntuación
  const [puntuacionTotal, setPuntuacionTotal] = useState(0); // Estado para la puntuación total
  const [mensajePuntuacion, setMensajePuntuacion] = useState(""); // Estado para el mensaje de puntuación
  const [colorCuadroPuntuacion, setColorCuadroPuntuacion] = useState(""); // Estado para el color del cuadro

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

  // Habilitar evaluación cuando sea necesario
  const handlePuntajeSeleccionado = (criterio, index, puntaje) => {
    // Actualizar el puntaje seleccionado
    setPuntajesSeleccionados((prev) => ({
      ...prev,
      [`${criterio}-${index}`]: puntaje,
    }));

    // Calcular la nueva puntuación total
    calcularPuntuacionTotal({
      ...puntajesSeleccionados,
      [`${criterio}-${index}`]: puntaje,
    });
  };

  // Calcular puntuación total
  const calcularPuntuacionTotal = (nuevosPuntajesSeleccionados) => {
    const totalPuntaje = Object.values(nuevosPuntajesSeleccionados).reduce((total, puntaje) => {
      return total + puntaje; // Sumar los puntajes
    }, 0);

    const totalCriterios = Object.keys(nuevosPuntajesSeleccionados).length;
    const puntuacionFinal = totalCriterios > 0 ? Math.round((totalPuntaje / (totalCriterios * 5)) * 100) : 0;

    setPuntuacionTotal(puntuacionFinal);
    setMostrarPuntuacion(true); // Mostrar cuadro de puntuación

    // Determinar el mensaje y el color del cuadro de puntuación
    determinarMensajeYColor(puntuacionFinal);
  };

  // Función para determinar el mensaje y el color del cuadro de puntuación
  const determinarMensajeYColor = (puntuacion) => {
    let mensaje = "";
    let color = "";

    if (puntuacion < 20) {
      mensaje = "Mal diseño UX";
      color = "bg-red-300"; // Rojo
    } else if (puntuacion < 40) {
      mensaje = "Diseño UX deficiente";
      color = "bg-orange-300"; // Naranja
    } else if (puntuacion < 60) {
      mensaje = "Diseño UX regular";
      color = "bg-yellow-300"; // Amarillo
    } else if (puntuacion < 80) {
      mensaje = "Diseño UX bueno";
      color = "bg-blue-200"; // Azul
    } else if (puntuacion < 99) {
      mensaje = "Diseño UX Muy bueno";
      color = "bg-blue-400"; // Azul
    } else {
      mensaje = "Diseño UX perfecto";
      color = "bg-green-300"; // Verde
    }

    setMensajePuntuacion(mensaje);
    setColorCuadroPuntuacion(color);
  };

  // Descargar la tabla como PDF
  const handleDownloadPDF = () => {
    const input = document.getElementById("tabla-evaluacion");
    const inputPuntuacion = document.getElementById("cuadro-puntuacion"); // Obtener el cuadro de puntuación
    const inputPuntuacionTexto = document.getElementById("mensaje-puntuacion"); // Obtener el mensaje de puntuación

    Promise.all([
      html2canvas(input, { scale: 2 }),
      html2canvas(inputPuntuacion, { scale: 2 }),
    ]).then(([canvasTabla, canvasPuntuacion]) => {
      const imgDataTabla = canvasTabla.toDataURL("image/png");
      const imgDataPuntuacion = canvasPuntuacion.toDataURL("image/png");

      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeightTabla = (canvasTabla.height * imgWidth) / canvasTabla.width;
      const imgHeightPuntuacion = (canvasPuntuacion.height * imgWidth) / canvasPuntuacion.width;

      let heightLeft = imgHeightTabla + imgHeightPuntuacion;
      let position = 0;

      // Agregar tabla al PDF
      pdf.addImage(imgDataTabla, "PNG", 10, position, imgWidth, imgHeightTabla);
      position += imgHeightTabla;

      // Agregar cuadro de puntuación al PDF
      pdf.addImage(imgDataPuntuacion, "PNG", 10, position, imgWidth, imgHeightPuntuacion);

      pdf.save("evaluacion.pdf");
    });
  };

  // Función para finalizar la evaluación
  const finalizarEvaluacion = () => {
    handleDownloadPDF(); // Descargar el PDF
    navigate("/Home"); // Redirigir a la página /Home
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
          <div className="flex items-center mb-6">
            <h1 className="ml-4 text-3xl font-bold">Evaluación</h1>
          </div>
          {/* Botones de evaluación y descarga */}
          <div className="flex justify-between mt-4 p-3">
            {/* Botón para descargar PDF */}
            <button
              onClick={handleDownloadPDF}
              className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500`}
            >
              Imprimir PDF
            </button>

            {!mostrarPuntuacion && (
              <button
                onClick={() => setMostrarPuntuacion(true)}
                className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500`}
              >
                Evaluar
              </button>
            )}
          </div>


          <div className="overflow-x-auto">
            <table id="tabla-evaluacion" className="min-w-full border-collapse border border-[#275dac]">
              <thead>
                <tr>
                  <th className="border-2 border-[#275dac] px-4 py-2">Categoría</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">Criterio</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">Preguntas</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">EXCELENTE</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">BUENO</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">REGULAR</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">SUFICIENTE</th>
                  <th className="border-2 border-[#275dac] px-4 py-2">MALO</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(criteriosPorCategoria).map(([categoria, criterios]) => (
                  criterios.length === 0 ? (
                    <tr key={categoria}>
                      <td className="border-2 border-[#275dac] px-4 py-2" colSpan="8">No hay criterios en esta categoría.</td>
                    </tr>
                  ) : (
                    criterios.map((criterio, criterioIndex) => (
                      <tr key={criterio.id || criterioIndex}>
                        <td className="border-2 border-[#275dac] px-4 py-2">{categoria}</td>
                        <td className="border-2 border-[#275dac] px-4 py-2">{criterio.nombre}</td>
                        <td className="border-2 border-[#275dac] px-4 py-2">
                          {criterio.preguntas.map((pregunta) => (
                            <div key={pregunta.id} className="flex justify-between items-center">
                              - {pregunta.texto}
                            </div>
                          ))}
                        </td>
                        {/* Espacios para calificar */}
                        {[5, 4, 3, 2, 1].map((puntaje) => (
                          <td key={puntaje} className="border-2 border-[#275dac] px-4 py-2">
                            <button
                              className={`p-1 text-black ${puntajesSeleccionados[`${criterio.nombre}-${criterioIndex}`] === puntaje ? 'bg-blue-300' : 'bg-white'}`}
                              onClick={() => handlePuntajeSeleccionado(criterio.nombre, criterioIndex, puntaje)}
                            >
                              {puntaje}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))
                  )
                ))}
              </tbody>
            </table>
          </div>

          {/* Mostrar cuadro de puntuación si es necesario */}
          {mostrarPuntuacion && (
            <div id="cuadro-puntuacion" className={`mt-4 p-4 border-2 border-[#275dac] rounded-md ${colorCuadroPuntuacion}`}>
              <h3 className="text-lg font-semibold">Puntuación Total: {puntuacionTotal}</h3>
              <p id="mensaje-puntuacion" className="mt-2">{mensajePuntuacion}</p>
            </div>
          )}



          <div className="flex justify-center mt-4">
            <button
              disabled={Object.keys(puntajesSeleccionados).length === 0} // Deshabilitar si no hay puntajes seleccionados
              onClick={finalizarEvaluacion}
              className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 ${Object.keys(puntajesSeleccionados).length === 0 ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"}`}
            >
              Finalizar Evaluación
            </button>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <Link to="/Home" className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500">
            <button onClick={() => console.log("Navegando a la sección anterior...")} className="w-1/4 py-2 rounded-md text-lg bg-transparent text-white ">Atrás</button>
            </Link>
          </div>
        </div>
      </div>
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

export default Evaluacion;
