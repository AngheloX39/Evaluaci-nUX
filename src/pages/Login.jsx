import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import app from '../firebase';
import icono from '../Images/Icono.png';  // Imagen pequeña
import { HiMail, HiLockClosed } from 'react-icons/hi';  // Iconos para correo y contraseña

const auth = getAuth(app);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Usuario ha iniciado sesión con éxito:', user.uid);
      navigate('/DefaultExperience');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      setErrorMessage('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-800 via-blue-500 to-teal-500" style={{
      backgroundSize: '200% 200%',
      animation: 'moveBackground 10s ease infinite'
    }}>
      {/* Div derecho con el formulario de inicio de sesión en una tarjeta blanca */}
      <div className="w-full flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          {/* Imagen pequeña arriba del título */}
          <img 
            src={icono} 
            alt="Icono" 
            className="w-20 h-auto mb-4 mx-auto" 
          />
          <h1 className="text-3xl font-bold text-[#275DAC] text-center mb-6">UXGrade</h1>

          {/* Mensaje de error */}
          {errorMessage && (
            <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
          )}

          {/* Formulario de inicio de sesión */}
          <form onSubmit={handleLogin}>
            {/* Campo de correo */}
            <div className="flex items-center border-1 border-[#275DAC] rounded-md mt-4 focus-within:border-4 focus-within:border-[#275DAC] focus-within:shadow-lg">
              <HiMail className="text-gray-500 mx-3 text-xl" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full p-3 outline-none text-lg rounded-md"
              />
            </div>

            {/* Campo de contraseña */}
            <div className="flex items-center border-1 border-[#275DAC] rounded-md mt-4 focus-within:border-4 focus-within:border-[#275DAC] focus-within:shadow-lg">
              <HiLockClosed className="text-gray-500 mx-3 text-xl" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full p-3 outline-none text-lg rounded-md"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-md mt-6 text-lg 
                bg-[#275DAC] 
                text-white transition-all duration-300 
                hover:bg-gradient-to-r hover:from-blue-800 hover:via-blue-500 hover:to-teal-500" // Degradado al pasar el cursor
            >
              Iniciar sesión
            </button>
          </form>

          {/* Textos centrados */}
          <p className="text-center mt-4 text-lg">
            <Link to="/Registro" className="text-[#275DAC]">¿No tienes una cuenta? Regístrate</Link>
          </p>
        </div>
      </div>

      {/* Animación del fondo */}
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
}

export default Login;
