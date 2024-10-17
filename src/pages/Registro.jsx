// src/pages/Registro.jsx
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Importa el hook de navegación
import app from '../firebase'; // Importa la configuración de Firebase

const auth = getAuth(app);
const db = getFirestore(app);

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Estado para la notificación
  const navigate = useNavigate(); // Crea el hook de navegación

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validación de la contraseña
    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return; // Salir si la contraseña no es válida
    }

    try {
      // Registra al usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guarda el nombre y el email en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        email: email,
      });

      setMessage('Usuario registrado con éxito.'); // Mensaje de éxito
      setTimeout(() => {
        navigate('/'); // Redirige a la página de login después de 2 segundos
      }, 2000);

      console.log('Usuario registrado con éxito:', user.uid);
    } catch (error) {
      setMessage(`Error al registrar el usuario: ${error.message}`); // Mensaje de error
      console.error("Error al registrar el usuario:", error.message);
    }
  };

  return (
    <div className="bg-sky-400 flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Registro</h2>

          {/* Mostrar la notificación si existe */}
          {message && <p className="text-red-500 mb-4">{message}</p>}

          <form onSubmit={handleRegister}>
            <p>Nombre</p>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="border p-2 mb-2 rounded-lg w-full"
            />

            <p>Correo Electrónico</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 mb-2 rounded-lg w-full"
            />

            <p>Contraseña</p>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 mb-4 rounded-lg w-full"
            />

            <p>
              <button
                type="submit"
                className="bg-sky-400 hover:bg-sky-500 text-white p-2 rounded-lg w-full"
              >
                Registrar
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>


  );
}

export default Registro;
