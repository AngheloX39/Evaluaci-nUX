import React from 'react';
import { Outlet } from 'react-router-dom';  // Outlet renderiza las rutas hijas

function LayoutPrincipal() {
  return (
    <div className=' bg-cafe1'>
      <main className='bg-cafe1'>
        {/* El Outlet mostrará el contenido de las rutas hijas */}
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrincipal;
