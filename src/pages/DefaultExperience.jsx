import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import app from '../firebase'; // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const db = getFirestore(app); // Asegúrate de que esta línea esté bien configurada

const autor = "Anghelo Xavier Calderon Ramirez - 20120087";

const DefaultExperience = () => {
    const [respuestas, setRespuestas] = useState({});
    const [criterios, setCriterios] = useState([]); // Cambiamos este estado
    const [loading, setLoading] = useState(true);

    // Cargar preguntas desde Firestore
    const cargarPreguntasDefault = async () => {
        try {
            const docRef = doc(db, "EvDefault", "BhWw3O5w70tSskJjk9Q3");  // Utiliza el ID correcto del documento

            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setCriterios(docSnap.data()); // Cargamos directamente las preguntas y categorías
                setLoading(false);
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error al cargar las preguntas: ", error);
        }
    };

    useEffect(() => {
        cargarPreguntasDefault(); // Carga las preguntas al montar el componente
    }, []);

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
        const total = Object.values(respuestas).reduce((acc, curr) => acc + curr, 0);
        return total;
    };

    const calcularPuntuacionEscalada = (total) => {
        const puntuacionMaxima = 85; // Ajusta según tu lógica
        const puntuacionEscalada = (total / puntuacionMaxima) * 100;
        return Math.round(puntuacionEscalada);
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

            yOffset += lineHeight;
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
        <div className="bg-sky-400 min-h-screen flex flex-col items-center">
            {/* Botón "Tus Formularios" */}
            <div className="flex justify-between items-center pt-6 pb-6 px-20">
                <div className='px-5'>

                    <Link to="/UserExperience">
                        <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg transition-all">
                            Tus Formularios
                        </button>
                    </Link>
                </div>
                <div className='px-5'>

                    <LogoutButton></LogoutButton>
                </div>
            </div>

            {/* Contenedor de la evaluación */}
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Evaluación UX Default</h1>

                {/* Mostrar los criterios de evaluación con sus preguntas */}
                {Object.keys(criterios).map((criterio, criterioIndex) => (
                    <div key={criterioIndex} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">{criterio}</h2>
                        {criterios[criterio].map((pregunta, preguntaIndex) => (
                            <div key={preguntaIndex} className="mb-6">
                                <p className="font-medium">{pregunta}</p>
                                <div className="flex space-x-4 mt-2">
                                    {[1, 2, 3, 4, 5].map((valor) => (
                                        <label key={valor} className="flex items-center">
                                            <input
                                                type="radio"
                                                name={`${criterio}-${preguntaIndex}`}
                                                value={valor}
                                                onChange={(e) => manejarCambio(criterio, preguntaIndex, e.target.value)}
                                                className="mr-2"
                                            />
                                            {valor}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Botón para imprimir la evaluación en PDF */}
                <div className="mt-8 flex justify-center">
                    <button
                        className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-all"
                        onClick={manejarPDF}
                    >
                        Imprimir Evaluación en PDF
                    </button>
                </div>

                {/* Mostrar puntuación final */}
                <div className={`mt-8 p-6 rounded-lg text-white ${obtenerColorFondo(totalEscalado)}`}>
                    <h3 className="text-lg font-bold">Puntuación Total: {totalEscalado} / 100</h3>
                    <p className="mt-2">Descripción: {obtenerDescripcion(totalEscalado)}</p>
                </div>
            </div>
        </div>

    );
};

export default DefaultExperience;
