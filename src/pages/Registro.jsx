import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import app from '../firebase';
import logo from '../Images/Fondo.png';  // Imagen de fondo grande
import icono from '../Images/Icono.png';  // Imagen pequeña
import { HiMail, HiLockClosed, HiUser } from 'react-icons/hi';  // Iconos para el nombre, correo y contraseña

const auth = getAuth(app);
const db = getFirestore(app);

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: nombre,
        email: email,
      });

      setMessage('Usuario registrado con éxito.');
      setTimeout(() => {
        navigate('/');
      }, 2000);

      console.log('Usuario registrado con éxito:', user.uid);
    } catch (error) {
      setMessage(`Error al registrar el usuario: ${error.message}`);
      console.error('Error al registrar el usuario:', error.message);
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

      {/* Div derecho con el formulario de registro */}
      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="p-8">
          {/* Imagen pequeña arriba del título */}
          <img 
            src={icono} 
            alt="Icono" 
            className="w-20 h-auto mb-4 mx-auto" 
          />
          <h1 className="text-3xl font-bold text-[#275DAC] text-center mb-6">UXGrade</h1>

          {/* Mensaje de error o éxito */}
          {message && (
            <p className="text-red-500 mb-4 text-center">{message}</p>
          )}

          {/* Formulario de registro */}
          <form onSubmit={handleRegister}>
            {/* Campo de nombre */}
            <div className="flex items-center border-1 border-[#275DAC] rounded-md mt-4 focus-within:border-4 focus-within:border-[#275DAC] focus-within:shadow-lg">
              <HiUser className="text-gray-500 mx-3 text-xl" />
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="block w-full p-3 outline-none text-lg rounded-md"
              />
            </div>

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
              Registrar
            </button>
          </form>

          {/* Textos centrados */}
          <p className="text-center mt-4 text-lg">
            <Link to="/" className="text-[#275DAC]">¿Ya tienes una cuenta? Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
