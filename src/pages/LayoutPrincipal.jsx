import React from 'react';
import { Outlet } from 'react-router-dom';  // Outlet renderiza las rutas hijas

function LayoutPrincipal() {
  return (
    <div className=' bg-white'>
      <main className='bg-white'>
        {/* El Outlet mostrará el contenido de las rutas hijas */}
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrincipal;
