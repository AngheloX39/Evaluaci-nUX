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
      mensaje = "El diseño es inaceptable y dificulta la interacción del usuario. La navegación es confusa y frustrante, y la interfaz está desorganizada. Se requiere una reestructuración completa para cumplir con los estándares básicos.";
      color = "bg-red-300 text-white"; // Rojo
    } else if (puntuacion < 40) {
      mensaje = "El diseño es deficiente y presenta múltiples fallos. La navegación es complicada, lo que puede dificultar que los usuarios completen tareas. Se necesita una revisión para identificar y corregir los problemas.";
      color = "bg-[#ff9800] text-white"; // Naranja
    } else if (puntuacion < 60) {
      mensaje = "El diseño presenta problemas significativos que afectan la experiencia. La navegación puede ser confusa y hay incoherencias en la interfaz. Aunque es usable, requiere cambios importantes para mejorar.";
      color = "bg-[#f3bd1c] text-white"; // Amarillo
    } else if (puntuacion < 80) {
      mensaje = "El diseño es funcional y cumple con los requisitos básicos. La navegación es aceptable, pero hay áreas que podrían optimizarse para una mejor experiencia. Algunos elementos pueden resultar confusos.";
      color = "bg-[#3677e1] text-white"; // Azul
    } else if (puntuacion < 99) {
      mensaje = "El diseño es de alta calidad y supera las expectativas en la mayoría de los aspectos. La navegación es clara y efectiva, aunque hay pequeños detalles que podrían mejorarse. La experiencia del usuario es muy satisfactoria.";
      color = "bg-[#1e40af] text-white"; // Azul
    } else {
      mensaje = "El diseño es excepcional y cumple con todos los aspectos esperados. La navegación es intuitiva y la experiencia general es fluida, con todos los elementos alineados con las necesidades del usuario.";
      color = "bg-[#14b8a6] text-white"; // Verde
    }

    setMensajePuntuacion(mensaje);
    setColorCuadroPuntuacion(color);
  };

 
  
  
  const handleDownloadPDF = () => {
    const input = document.getElementById("tabla-evaluacion"); // Captura la tabla
    const inputPuntuacion = document.getElementById("cuadro-puntuacion"); // Captura la sección de puntuación
  
    // Obtener la fecha y hora actual
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString(); // Formato de la fecha
    const horaFormateada = fecha.toLocaleTimeString(); // Formato de la hora
  
    // Asegurarte de que la tabla exista
    if (!input) {
      console.error("No se encontró la tabla de evaluación.");
      return;
    }
  
    Promise.all([
      html2canvas(input, { scale: 6 }), // Escalar para mejorar la resolución
      inputPuntuacion ? html2canvas(inputPuntuacion, { scale: 6 }) : Promise.resolve(null) // Manejar la sección de puntuación si no existe
    ]).then(([canvasTabla, canvasPuntuacion]) => {
      const imgDataTabla = canvasTabla.toDataURL("image/png");
  
      const pdf = new jsPDF('p', 'mm', 'a4'); // Crear el PDF en modo retrato
      const imgWidth = 190; // Aumentar el ancho de la tabla
      const imgHeightTabla = (canvasTabla.height * imgWidth) / canvasTabla.width;
  
      let position = 10; // Posición inicial de los elementos
  
      // Añadir la fecha y la hora centrada
      pdf.setFontSize(12);
      pdf.text(`La evaluación se realizó el ${fechaFormateada} a las ${horaFormateada}`, pdf.internal.pageSize.getWidth() / 2, position, { align: 'center' });
  
      position += 10; // Espacio entre la fecha/hora y la tabla
  
      // Añadir la tabla como imagen
      pdf.addImage(imgDataTabla, "PNG", 10, position, imgWidth, imgHeightTabla);
      position += imgHeightTabla + 20; // Ajustar la posición para la sección de puntuación
  
      // Añadir la sección de puntuación si existe
      if (canvasPuntuacion) {
        const imgDataPuntuacion = canvasPuntuacion.toDataURL("image/png");
        const imgWidthP = 200; // Ancho de la sección de puntuación
        const imgHeightPuntuacion = (canvasPuntuacion.height * imgWidthP) / canvasPuntuacion.width; // Mantener proporción
  
        // Centrar la sección de puntuación
        const centeredPosition = (pdf.internal.pageSize.getWidth() - imgWidthP) / 2;
        pdf.addImage(imgDataPuntuacion, "PNG", centeredPosition, position, imgWidthP, imgHeightPuntuacion);
      }
  
      // Guardar el PDF
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
        <div className="flex items-center justify-start mb-4">
            <div className="bg-[#275dac] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl">
              
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">REALIZA TU EVALUACIÓN</h2>
          </div>

          <div className="h-1 bg-gradient-to-r  from-blue-800 via-blue-500 to-teal-500 my-3" />

        {/* Botones de evaluación y descarga */}
<div className="flex justify-center space-x-4 mt-4 p-3">
  {/* Botón para descargar PDF */}
  <button
    onClick={handleDownloadPDF}
    className="w-1/5 py-2 rounded-md border-0 text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
  >
    Imprimir PDF
  </button>

  {!mostrarPuntuacion && (
    <button
      onClick={() => setMostrarPuntuacion(true)}
      className="w-1/5 py-2 rounded-md border-0 text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
    >
      Evaluar
    </button>
  )}
</div>




          <div className="overflow-x-auto">
            <table id="tabla-evaluacion" className="min-w-full border-collapse border border-[#275dac]">
              <thead>
                <tr>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">PRINCIPIO</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">CRITERIO</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">PREGUNTAS</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">EXCELENTE</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">BUENO</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">REGULAR</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">SUFICIENTE</th>
                  <th className="border-2 border-[#275dac] bg-[#275dac] px-4 py-2 text-center text-white">MALO</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(criteriosPorCategoria).map(([categoria, criterios]) => (
                  criterios.length === 0 ? (
                    <tr key={categoria}>
                      <td className="border-2 border-[#275dac] px-4 py-2 text-center" colSpan="8">No hay criterios en esta categoría.</td>
                    </tr>
                  ) : (
                    criterios.map((criterio, criterioIndex) => (
                      <tr key={criterio.id || criterioIndex}>
                        <td className="border-2 border-[#275dac] px-4 py-2 text-center">{categoria}</td>
                        <td className="border-2 border-[#275dac] px-4 py-2 text-center">{criterio.nombre}</td>
                        <td className="border-2 border-[#275dac] px-4 py-2 text-center">
                          {criterio.preguntas.map((pregunta) => (
                            <div key={pregunta.id} className="items-center text-center">
                               {pregunta.texto}
                            </div>
                          ))}
                        </td>
                        {/* Espacios para calificar */}


{[5, 4, 3, 2, 1].map((puntaje) => (
  <td
    key={puntaje}
    className={`border-2 border-[#275dac] px-4 py-2 text-center ${puntajesSeleccionados[`${criterio.nombre}-${criterioIndex}`] === puntaje ? 'bg-blue-300' : 'bg-white'}`}
    onClick={() => mostrarPuntuacion && handlePuntajeSeleccionado(criterio.nombre, criterioIndex, puntaje)} // Hacer clic solo si se muestra la puntuación
    style={{ cursor: mostrarPuntuacion ? 'pointer' : 'not-allowed' }} // Cambiar cursor según el estado
  >
    {puntaje}
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
  <div id="cuadro-puntuacion" className={`mt-4 p-4  rounded-md w-15 ${colorCuadroPuntuacion}  mx-auto`}>
    <h3 className="text-lg font-semibold text-center text-white">Puntuación Total: {puntuacionTotal}</h3>
    <p id="mensaje-puntuacion" className="mt-2 text-center">{mensajePuntuacion}</p>
  </div>
)}





<div className="flex justify-center mt-4">
  <button
    disabled={Object.keys(puntajesSeleccionados).length < Object.keys(criteriosPorCategoria).reduce((acc, categoria) => acc + criteriosPorCategoria[categoria].length, 0)} // Deshabilitar si no hay puntajes seleccionados para todas las filas
    onClick={finalizarEvaluacion}
    className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 ${Object.keys(puntajesSeleccionados).length < Object.keys(criteriosPorCategoria).reduce((acc, categoria) => acc + criteriosPorCategoria[categoria].length, 0) ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"}`}
  >
    Finalizar Evaluación
  </button>
</div>


          <div className="h-1 bg-gradient-to-r  from-blue-800 via-blue-500 to-teal-500 my-3" />


          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
  <Link
    to="/Home"
    className="w-32 py-2 text-center rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500 no-underline"
    onClick={() => console.log("Navegando a la sección anterior...")}
  >
    Atrás
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
