import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importa el hook de navegación
import app from '../firebase';
import { Link } from 'react-router-dom';

const auth = getAuth(app);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para almacenar el mensaje de error
  const navigate = useNavigate(); // Crea el hook de navegación

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Limpiar el mensaje de error antes de intentar iniciar sesión

    try {
      // Inicia sesión con el correo y la contraseña
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Usuario ha iniciado sesión con éxito:', user.uid);
      navigate('/DefaultExperience'); // Redirige a la página de Inicio después de iniciar sesión
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      setErrorMessage('Error al iniciar sesión. Verifica tus credenciales.'); // Establecer el mensaje de error
    }
  };

  return (
    <div className="bg-sky-400 flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
       
        <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Evaluacion UX</h2>
          
          {errorMessage && (
            <p className="text-red-500 mb-4">{errorMessage}</p> 
          )}

          <form onSubmit={handleLogin}>
            <p>Correo Electrónico</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 mb-2 rounded-lg w-full" // Estilo para el input
            />
            <p>Contraseña</p>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 mb-4 rounded-lg w-full" // Estilo para el input
            />
            <p>
              <button
                type="submit"
                className="bg-sky-400 hover:bg-sky-500 text-black p-2 rounded-lg w-full"
              >
                Iniciar Sesión
              </button>
            </p>
          </form>

          <div className="mt-4">
            No tienes cuenta? registrate{" "}
            <Link to="/Registro" className="text-blue-500 underline">
              Aquí
            </Link>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Login;

