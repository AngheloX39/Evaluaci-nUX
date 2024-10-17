import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase'; // Asegúrate de importar tu configuración de Firebase
import { Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

// Lista de criterios disponibles
const criteriosDisponibles = [
    "usabilidad",
    "accesibilidad",
    "simplicidad",
    "consistencia",
    "centrado en el usuario" // Cambiado correctamente
];

const CrearEvaluacion = () => {
    const [nombreEvaluacion, setNombreEvaluacion] = useState(""); // Nombre de la evaluación
    const [selectedCriterio, setSelectedCriterio] = useState("");
    const [pregunta, setPregunta] = useState("");
    const [criterios, setCriterios] = useState({
        usabilidad: [],
        accesibilidad: [],
        simplicidad: [],
        consistencia: [],
        "centrado en el usuario": [], // Cambiado correctamente
    });
    const auth = getAuth();

    const manejarCambioCriterio = (event) => {
        setSelectedCriterio(event.target.value);
    };

    const manejarCambioPregunta = (event) => {
        setPregunta(event.target.value);
    };

    const manejarCambioNombre = (event) => {
        setNombreEvaluacion(event.target.value);
    };

    const agregarCriterio = () => {
        if (selectedCriterio && pregunta) {
            setCriterios((prev) => ({
                ...prev,
                [selectedCriterio]: [
                    ...(prev[selectedCriterio] || []),
                    pregunta // Solo agregar el texto
                ]
            }));
            setSelectedCriterio(""); // Limpiar selección de criterio
            setPregunta(""); // Limpiar pregunta
        } else {
            alert("Por favor, selecciona un criterio y añade una pregunta.");
        }
    };

    const manejarSubmit = async (event) => {
        event.preventDefault();

        // Validar que el nombre de la evaluación y al menos una pregunta estén presentes
        if (!nombreEvaluacion) {
            alert("Por favor, ingresa un nombre para la evaluación.");
            return;
        }
        if (!esValidoParaGuardar()) {
            alert("Debes agregar al menos una pregunta antes de guardar la evaluación.");
            return;
        }

        try {
            const user = auth.currentUser;
            const evaluacion = {
                userId: user.uid,
                nombreEvaluacion,
                ...criterios,
                fechaCreacion: new Date().toISOString(),
            };

            await addDoc(collection(db, 'EvUser'), evaluacion);
            alert("Evaluación creada con éxito");
            // Reiniciar el formulario si es necesario
            setCriterios({
                usabilidad: [],
                accesibilidad: [],
                simplicidad: [],
                consistencia: [],
                "centrado en el usuario": [], // Asegurarse de usar el nombre correcto aquí también
            });
            setNombreEvaluacion(""); // Reiniciar el nombre de la evaluación
        } catch (error) {
            console.error("Error al crear evaluación: ", error);
        }
    };

    const esValidoParaGuardar = () => {
        // Verificar si hay al menos una pregunta en cualquiera de los criterios
        return Object.values(criterios).some(preguntas => preguntas.length > 0);
    };

    return (
        <div className='bg-sky-400 min-h-screen'>
            {/* Enlace a los formularios del usuario */}
            <div className='flex justify-center items-center pt-6 pb-6 px-5'>
                <Link to="/UserExperience">
                    <button className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-all">
                        Tus Formularios
                    </button>
                </Link>
                <div className='px-5'>

          <LogoutButton></LogoutButton>
        </div>
            </div>

            {/* Contenedor del formulario para crear una evaluación */}
            <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Crear Evaluación Personalizada</h1>

                <form onSubmit={manejarSubmit}>
                    {/* Campo para ingresar el nombre de la evaluación */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Nombre de la Evaluación:</label>
                        <input
                            type="text"
                            value={nombreEvaluacion}
                            onChange={manejarCambioNombre}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingresa un nombre"
                        />
                    </div>

                    {/* Selección de criterio */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Seleccionar Criterio:</label>
                        <select
                            value={selectedCriterio}
                            onChange={manejarCambioCriterio}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Seleccione un criterio</option>
                            {criteriosDisponibles.map((criterio, index) => (
                                <option key={index} value={criterio}>
                                    {criterio.charAt(0).toUpperCase() + criterio.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo para ingresar la pregunta o rasgo a evaluar */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Pregunta o Rasgo a Evaluar:</label>
                        <input
                            type="text"
                            value={pregunta}
                            onChange={manejarCambioPregunta}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Escribe una pregunta"
                        />
                    </div>

                    {/* Botón para agregar criterio */}
                    <button
                        type="button"
                        onClick={agregarCriterio}
                        className="w-full bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition duration-200 mb-8"
                    >
                        Agregar Criterio
                    </button>

                    {/* Mostrar los criterios agregados */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Criterios Agregados:</h3>
                        {criteriosDisponibles.map((criterio) => (
                            <div key={criterio} className="mb-4">
                                <h4 className="font-semibold text-gray-700">{criterio.charAt(0).toUpperCase() + criterio.slice(1)}</h4>
                                {Array.isArray(criterios[criterio]) && criterios[criterio].map((pregunta, index) => (
                                    <p key={index} className="text-gray-600 ml-4">{pregunta}</p>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Botón para guardar la evaluación */}
                    <button
                        type="submit"
                        disabled={!esValidoParaGuardar()}
                        className={`w-full bg-green-500 text-white font-bold py-3 rounded-md transition duration-200 
        ${!esValidoParaGuardar() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                    >
                        Guardar Evaluación
                    </button>
                </form>
            </div>
        </div>

    );
};

export default CrearEvaluacion;
