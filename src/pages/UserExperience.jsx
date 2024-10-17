import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import app from '../firebase';
import { Link } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore';
import LogoutButton from '../components/LogoutButton';

const db = getFirestore(app);

const autor = "Anghelo Xavier Calderon Ramirez - 20120087";

const UserExperience = () => {
  const [respuestas, setRespuestas] = useState({});
  const [criterios, setCriterios] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState('');

  // Cargar preguntas desde EvDefault
  const cargarPreguntasDefault = async () => {
    try {
      const docRef = doc(db, "EvDefault", "BhWw3O5w70tSskJjk9Q3");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCriterios(docSnap.data()); // Cargamos las preguntas y categorías
        setLoading(false);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error al cargar las preguntas: ", error);
    }
  };

  // Cargar evaluaciones personalizadas del usuario
  const cargarEvaluaciones = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "EvUser"));
      const evaluacionesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvaluaciones(evaluacionesData);
      if (evaluacionesData.length > 0) {
        setEvaluacionSeleccionada(evaluacionesData[0].id); // Selecciona la primera evaluación por defecto
      }
    } catch (error) {
      console.error("Error al cargar las evaluaciones: ", error);
    }
  };

  // Cargar preguntas de la evaluación seleccionada
  const cargarPreguntasDeEvaluacion = async (evaluacionId) => {
    try {
      console.log("Cargando preguntas para la evaluación con ID:", evaluacionId); // Verificar el ID
      const docRef = doc(db, "EvUser", evaluacionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Datos recibidos:", data); // Verificar los datos recibidos

        // Verificar si el criterio "centradoEnElUsuario" aún está en la base de datos
        if (data.centradoEnElUsuario) {
          console.log("El criterio incorrecto existe, renombrando...");
          data["centrado en el usuario"] = data.centradoEnElUsuario;
          delete data.centradoEnElUsuario; // Eliminar el campo incorrecto
        }

        console.log("Datos corregidos:", data); // Verificar datos corregidos
        setCriterios(data); // Reemplaza criterios con los de la evaluación seleccionada
      } else {
        console.log("No such evaluation!");
      }
    } catch (error) {
      console.error("Error al cargar la evaluación:", error);
    }
  };


  useEffect(() => {
    cargarPreguntasDefault(); // Carga las preguntas por defecto al montar el componente
    cargarEvaluaciones(); // Cargar las evaluaciones al montar el componente
  }, []);

  useEffect(() => {
    if (evaluacionSeleccionada) {
      cargarPreguntasDeEvaluacion(evaluacionSeleccionada); // Cargar preguntas de la evaluación seleccionada
    }
  }, [evaluacionSeleccionada]);

  if (loading) {
    return <p>Cargando evaluación...</p>; // Mensaje de carga
  }

  const manejarCambio = (criterio, indice, valor) => {
    setRespuestas({
      ...respuestas,
      [`${criterio}-${indice}`]: parseInt(valor),
    });
  };

  const calcularPuntuacionTotal = () => {
    // Obtener el array de criterios
    const criteriosArray = Object.values(criterios);
    console.log("Criterios:", criteriosArray);  // Verificar los criterios (todas las preguntas por categorías)

    // Aplanar el array de preguntas
    const preguntasPlanas = criteriosArray.flat();
    console.log("Preguntas planas:", preguntasPlanas);  // Verificar si las preguntas están bien estructuradas

    // Contar las preguntas restando 3 (por los campos adicionales: userId, fechaCreacion, nombreEvaluacion)
    const numeroDePreguntas = preguntasPlanas.length - 3;
    console.log("Número total de preguntas ajustado:", numeroDePreguntas);  // Verificar el número total de preguntas ajustado

    // Calcular el factor de escala basado en el número total de preguntas ajustado
    const factorDeEscala = 100 / (numeroDePreguntas * 5);
    console.log("Factor de escala:", factorDeEscala);  // Verificar el factor de escala calculado

    // Reducir las respuestas para obtener el total escalado
    const respuestasArray = Object.values(respuestas);
    console.log("Respuestas del usuario:", respuestasArray);  // Verificar las respuestas

    const total = respuestasArray.reduce((acc, curr) => {
      console.log(`Acumulador actual: ${acc}, Respuesta actual: ${curr}, Multiplicado por factor: ${curr * factorDeEscala}`);
      return acc + curr * factorDeEscala; // Escalamos cada respuesta
    }, 0);

    console.log("Puntuación total calculada:", total);  // Verificar la puntuación total calculada

    return total;
  };

  // Función para escalar la puntuación
  const calcularPuntuacionEscalada = (total) => {
    console.log("Puntuación total antes de redondear:", total);
    const puntuacionEscalada = Math.round(total);
    console.log("Puntuación total escalada (redondeada):", puntuacionEscalada);
    return puntuacionEscalada;
  };



  const obtenerDescripcion = (totalEscalado) => {
    if (totalEscalado <= 40) return "Deficiente";
    if (totalEscalado <= 60) return "Poco efectivo";
    if (totalEscalado <= 80) return "Mejorable";
    if (totalEscalado <= 90) return "Efectivo";
    return "Muy efectivo";
  };

  const obtenerColorFondo = (totalEscalado) => {
    if (totalEscalado <= 40) return "bg-red-500";
    if (totalEscalado <= 60) return "bg-yellow-500";
    if (totalEscalado <= 80) return "bg-yellow-300";
    if (totalEscalado <= 90) return "bg-green-500";
    return "bg-green-700";
  };

  const manejarPDF = () => {
    const doc = new jsPDF();
    doc.text("Cuestionario de Evaluación UX", 10, 10);
    doc.text(`Autor: ${autor}`, 10, 20);

    let yOffset = 30;
    const lineHeight = 10;
    const pageHeight = 280;

    // Recorremos los criterios y preguntas
    Object.keys(criterios).forEach((criterio, criterioIndex) => {
      if (yOffset + lineHeight > pageHeight) {
        doc.addPage();
        yOffset = 10;
      }

      // Verificar si criterios[criterio] es un array y tiene preguntas
      if (Array.isArray(criterios[criterio]) && criterios[criterio].length > 0) {
        doc.text(criterio, 10, yOffset);
        yOffset += lineHeight;

        criterios[criterio].forEach((pregunta, preguntaIndex) => {
          const respuesta = respuestas[`${criterio}-${preguntaIndex}`] || 0;
          const textoDividido = doc.splitTextToSize(`${pregunta}: ${respuesta}`, 180);

          if (yOffset + (textoDividido.length * lineHeight) > pageHeight) {
            doc.addPage();
            yOffset = 10;
          }

          doc.text(textoDividido, 10, yOffset);
          yOffset += textoDividido.length * lineHeight;
        });

        yOffset += lineHeight; // Espaciado después de cada criterio
      }
    });

    const total = calcularPuntuacionTotal();
    const totalEscalado = calcularPuntuacionEscalada(total);

    if (yOffset + lineHeight > pageHeight) {
      doc.addPage();
      yOffset = 10;
    }

    doc.text(`Puntuación Total: ${totalEscalado} / 100`, 10, yOffset);
    yOffset += lineHeight;
    doc.text(`Descripción: ${obtenerDescripcion(totalEscalado)}`, 10, yOffset);

    doc.save("evaluacion_ux.pdf");
  };

  const total = calcularPuntuacionTotal();
  const totalEscalado = calcularPuntuacionEscalada(total);

  return (
    <div className="bg-sky-400 min-h-screen">
      {/* Barra de navegación superior */}
      <div className='flex justify-between items-center pt-6 pb-6 px-20'>
        <Link to="/DefaultExperience">
          <button className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-all">
            Evaluación Default
          </button>
        </Link>
        <div className='px-5'>

          <LogoutButton></LogoutButton>
        </div>
        <Link to="/CrearEvaluacion">
          <button className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-all">
            + Añadir Evaluación
          </button>
        </Link>
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Evaluación UX</h1>

        {/* Selector de evaluaciones */}
        <div className="mb-8">
          <label htmlFor="evaluaciones" className="block text-gray-700 font-semibold mb-2">Seleccionar Evaluación:</label>
          <select
            id="evaluaciones"
            value={evaluacionSeleccionada}
            onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {evaluaciones.map(evaluacion => (
              <option key={evaluacion.id} value={evaluacion.id}>
                {evaluacion.nombreEvaluacion || "Evaluación sin nombre"}
              </option>
            ))}
          </select>
        </div>

        {/* Mostrar los criterios de evaluación con sus preguntas */}
        {Object.keys(criterios).map((criterio, criterioIndex) => (
          <div key={criterioIndex} className="mb-8">
            {Array.isArray(criterios[criterio]) && criterios[criterio].length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{criterio}</h2>
                {criterios[criterio].map((pregunta, preguntaIndex) => (
                  <div key={preguntaIndex} className="mb-6">
                    {/* Mostrar la pregunta */}
                    <label className="text-gray-700 block mb-2">{pregunta}</label>

                    {/* Mostrar opciones de radio */}
                    <div className="flex space-x-6 mt-2">
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <div key={valor} className="flex items-center">
                          <input
                            type="radio"
                            id={`${criterio}-${preguntaIndex}-${valor}`}
                            name={`${criterio}-${preguntaIndex}`}
                            value={valor}
                            checked={respuestas[`${criterio}-${preguntaIndex}`] === valor}
                            onChange={(e) => manejarCambio(criterio, preguntaIndex, e.target.value)}
                            className="mr-2"
                          />
                          <label htmlFor={`${criterio}-${preguntaIndex}-${valor}`} className="text-gray-600">
                            {valor}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        ))}

        {/* Botón para generar PDF */}
        <div className="mt-6">
          <button
            onClick={manejarPDF}
            className="w-full bg-sky-500 text-white font-bold py-3 rounded-lg hover:bg-sky-600 transition duration-200"
          >
            Generar PDF
          </button>
        </div>

        {/* Mostrar puntuación total */}
        <div className={`mt-8 ${obtenerColorFondo(totalEscalado)} text-white p-4 rounded-lg`}>
          <h2 className="text-lg font-semibold">Puntuación Total: {totalEscalado} / 100</h2>
          <p>Descripción: {obtenerDescripcion(totalEscalado)}</p>
        </div>
      </div>
    </div>

  );
};

export default UserExperience;
