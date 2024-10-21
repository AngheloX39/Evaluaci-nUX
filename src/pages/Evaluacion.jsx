import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // Importar html2canvas
import MenuSuperior from "../components/MenuSuperior2"; // Asegúrate de que la ruta es correcta

const Evaluacion = () => {
  // Datos estáticos
  const [categoriasPorCriterio] = useState({
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

  const [puntajesSeleccionados, setPuntajesSeleccionados] = useState({});
  const [evaluarHabilitado, setEvaluarHabilitado] = useState(false);

  const handleEvaluate = () => {
    setEvaluarHabilitado(true);
  };

  const handlePuntajeSeleccionado = (criterio, index, puntaje) => {
    setPuntajesSeleccionados((prev) => ({
      ...prev,
      [`${criterio}-${index}`]: puntaje,
    }));
  };

  const todosLosPuntajesSeleccionados = Object.keys(categoriasPorCriterio).flatMap((criterio) => {
    return categoriasPorCriterio[criterio].map((_, index) => {
      return puntajesSeleccionados[`${criterio}-${index}`] !== undefined;
    });
  }).every(Boolean);

  const handleDownloadPDF = () => {
    const input = document.getElementById("tabla-evaluacion"); // Obtener la tabla por su ID
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 190; // Ancho de la imagen en el PDF
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Agregar la imagen al PDF
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si la imagen es más alta que la página, agregar nuevas páginas
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("evaluacion.pdf");
    });
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
              3
            </div>
            <h2 className="ml-4 text-[#275dac] font-bold text-2xl">REALIZA TU EVALUACIÓN</h2>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          {/* Botones para descargar PDF y evaluar */}
          <div className="flex justify-between mb-4">
            <button
              onClick={handleDownloadPDF}
              className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
            >
              Descargar PDF
            </button>

            <button
              onClick={handleEvaluate}
              className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"
            >
              Evaluar 
            </button>
          </div>

          {/* Tabla principal */}
          <div className="overflow-x-auto">
            <table id="tabla-evaluacion" className="min-w-full table-auto border-collapse" style={{ tableLayout: "fixed" }}>
              {/* Encabezado */}
              <thead className="bg-[#275dac] text-white">
                <tr>
                  <th className="border px-4 py-2">CRITERIOS</th>
                  <th className="border px-4 py-2">CATEGORIAS</th>
                  <th className="border px-4 py-2">PREGUNTAS DE AYUDA</th>
                  <th className="border px-4 py-2" style={{ width: "100px" }}>EXCELENTE</th>
                  <th className="border px-4 py-2" style={{ width: "100px" }}>BUENO</th>
                  <th className="border px-4 py-2" style={{ width: "100px" }}>REGULAR</th>
                  <th className="border px-4 py-2" style={{ width: "100px" }}>SUFICIENTE</th>
                  <th className="border px-4 py-2" style={{ width: "100px" }}>MALO</th>
                </tr>
              </thead>

              {/* Cuerpo de la tabla */}
              <tbody>
                {Object.entries(categoriasPorCriterio).flatMap(([criterio, categorias]) => {
                  return categorias.map((categoria, index) => (
                    <tr key={`${criterio}-${index}`}>
                      {/* Columna de criterios */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/4">
                        {index === 0 ? criterio : ""}
                      </td>

                      {/* Columna de categorías */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/4">
                        {categoria.nombre}
                      </td>

                      {/* Columna de preguntas de ayuda */}
                      <td className="border-2 border-[#275dac] px-4 py-2 w-1/2">
                        {categoria.preguntas.map((pregunta, preguntaIndex) => (
                          <div key={preguntaIndex} className="flex items-center">
                            <span className="mr-2">{pregunta}</span>
                          </div>
                        ))}
                      </td>

                      {/* Columnas de puntajes */}
                      {[5, 4, 3, 2, 1].map((puntaje) => (
                        <td
                          key={puntaje}
                          className={`border-2 border-[#275dac] px-4 py-2 text-center text-2xl cursor-pointer 
                            ${puntajesSeleccionados[`${criterio}-${index}`] === puntaje ? "bg-blue-200" : ""}`}
                          onClick={evaluarHabilitado ? () => handlePuntajeSeleccionado(criterio, index, puntaje) : undefined} // Manejar la selección de puntaje solo si está habilitado
                        >
                          {puntaje}
                        </td>
                      ))}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button
              disabled={!todosLosPuntajesSeleccionados} // Deshabilitar si no todos los puntajes están seleccionados
              onClick={handleDownloadPDF}
              className={`w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 ${!todosLosPuntajesSeleccionados ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500"}`}
            >
              Finalizar Evaluación
            </button>
          </div>

          <hr className="border-t-4 border-[#275dac] my-4 mb-8" />

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button onClick={() => console.log("Navegando a la sección anterior...")} className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500">Atrás</button>
            <button onClick={() => console.log("Navegando a la siguiente sección...")} className="w-1/4 py-2 rounded-md text-lg bg-[#275DAC] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500">Siguiente</button>
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
