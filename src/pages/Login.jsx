import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import app from '../firebase';
import logo from '../Images/Fondo.png';  // Imagen de fondo grande
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
      navigate('/Home');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      setErrorMessage('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Div izquierdo con la imagen de fondo */}
      <div className="w-1/2 flex justify-center items-center bg-blue-500">
        <img 
          src={logo} 
          alt="Logo de fondo" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Div derecho con el formulario de inicio de sesión */}
      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="p-8">
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
              className="w-full bg-[#275DAC] text-white py-3 rounded-md mt-6 text-lg"
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
    </div>
  );
}

export default Login;
