import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import EventFlowLogo from './components/EventFlowLogo';
import Login from './pages/Login';
import Eventos from './pages/Eventos';
import GestionSillas from './pages/GestionSillas';
import Recaudo from './pages/Recaudo';
import Cartelera from './pages/Cartelera';
import GestionLugares from './pages/GestionLugares';
import GestionLocalidades from './pages/GestionLocalidades';
import GestionUsuarios from './pages/GestionUsuarios';

function SideBar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const esActiva = (ruta) => location.pathname === ruta;

  const navItemStyle = (ruta) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: esActiva(ruta) ? '700' : '500',
    color: esActiva(ruta) ? '#f8fafc' : '#94a3b8',
    background: esActiva(ruta)
      ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.16) 0%, rgba(30, 41, 59, 0.35) 100%)'
      : 'transparent',
    border: esActiva(ruta) ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
    transition: 'all 0.2s ease'
  });

  const inicialUsuario = usuario?.correo ? usuario.correo.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="ef-sidebar" style={sidebarContainer}>
      <div>
        <Link
          to={usuario?.rol === 'ADMIN' ? '/eventos' : '/cartelera'}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', marginBottom: '28px' }}
        >
          <EventFlowLogo size={38} />
          <div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.4px', lineHeight: '1.1' }}>
              Event<span style={{ color: '#38bdf8' }}>Flow</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
              Gestión de Eventos
            </span>
          </div>
        </Link>

        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 12px', marginBottom: '10px' }}>
          Menú Principal
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {usuario?.rol === 'ADMIN' ? (
            <>
              <Link className="ef-nav-link" to="/eventos" style={navItemStyle('/eventos')}>
                {esActiva('/eventos') && <span style={activeGlowBar} />}
                <span style={{ fontSize: '17px' }}>📅</span>
                <span>Panel Eventos</span>
              </Link>

              <Link className="ef-nav-link" to="/admin/lugares" style={navItemStyle('/admin/lugares')}>
                {esActiva('/admin/lugares') && <span style={activeGlowBar} />}
                <span style={{ fontSize: '17px' }}>📍</span>
                <span>Gestión Lugares</span>
              </Link>

              <Link className="ef-nav-link" to="/admin/usuarios" style={navItemStyle('/admin/usuarios')}>
                {esActiva('/admin/usuarios') && <span style={activeGlowBar} />}
                <span style={{ fontSize: '17px' }}>👥</span>
                <span>Usuarios y Roles</span>
              </Link>

              <Link className="ef-nav-link" to="/cartelera" style={navItemStyle('/cartelera')}>
                {esActiva('/cartelera') && <span style={activeGlowBar} />}
                <span style={{ fontSize: '17px' }}>🎭</span>
                <span>Cartelera Pública</span>
              </Link>

              <button
                className="ef-create-btn"
                onClick={() => navigate('/eventos')}
                style={quickCreateBtn}
              >
                <span style={{ fontSize: '16px', fontWeight: '800' }}>+</span>
                <span>Crear Evento</span>
              </button>
            </>
          ) : (
            <Link className="ef-nav-link" to="/cartelera" style={navItemStyle('/cartelera')}>
              {esActiva('/cartelera') && <span style={activeGlowBar} />}
              <span style={{ fontSize: '17px' }}>🎭</span>
              <span>Cartelera de Eventos</span>
            </Link>
          )}
        </nav>
      </div>

      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', paddingTop: '18px', marginTop: '24px' }}>
        <div style={profileCard}>
          <div style={{ position: 'relative' }}>
            <div style={avatarCircle}>{inicialUsuario}</div>
            <span style={onlineDot} />
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usuario?.correo}
            </div>
            <div style={{ fontSize: '11px', color: usuario?.rol === 'ADMIN' ? '#38bdf8' : '#34d399', fontWeight: '700', marginTop: '2px' }}>
              {usuario?.rol === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="ef-logout-btn" style={logoutSidebarBtn}>
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

function RutaProtegida({ children, rolRequerido }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" />;
  if (rolRequerido && usuario.rol !== rolRequerido) return <Navigate to="/cartelera" />;
  return children;
}

function AppContent() {
  const { usuario } = useAuth();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background-color: #06070a;
          color: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .ef-layout { display: flex; min-height: 100vh; background-color: #06070a; }
        .ef-main { flex: 1; min-width: 0; }
        .ef-nav-link:hover {
          color: #f8fafc !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .ef-create-btn { transition: all 0.2s ease; }
        .ef-create-btn:hover {
          background-color: rgba(56, 189, 248, 0.18) !important;
          border-color: rgba(56, 189, 248, 0.45) !important;
          transform: translateY(-1px);
        }
        .ef-logout-btn { transition: all 0.2s ease; }
        .ef-logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.22) !important;
          border-color: rgba(239, 68, 68, 0.45) !important;
        }
        @media (max-width: 860px) {
          .ef-layout { flex-direction: column; }
          .ef-sidebar {
            width: 100% !important;
            height: auto !important;
            position: static !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
        }
      `}</style>

      <div className={usuario ? 'ef-layout' : ''}>
        {usuario && <SideBar />}
        <main className={usuario ? 'ef-main' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/eventos" element={<RutaProtegida rolRequerido="ADMIN"><Eventos /></RutaProtegida>} />
            <Route path="/eventos/:id/recaudo" element={<RutaProtegida rolRequerido="ADMIN"><Recaudo /></RutaProtegida>} />
            <Route path="/eventos/:id/localidades" element={<RutaProtegida rolRequerido="ADMIN"><GestionLocalidades /></RutaProtegida>} />
            <Route path="/admin/lugares" element={<RutaProtegida rolRequerido="ADMIN"><GestionLugares /></RutaProtegida>} />
            <Route path="/admin/usuarios" element={<RutaProtegida rolRequerido="ADMIN"><GestionUsuarios /></RutaProtegida>} />
            <Route path="/cartelera" element={<RutaProtegida><Cartelera /></RutaProtegida>} />
            <Route path="/eventos/:id/comprar" element={<RutaProtegida><GestionSillas /></RutaProtegida>} />
            <Route path="*" element={
              usuario
                ? (usuario.rol === 'ADMIN' ? <Navigate to="/eventos" /> : <Navigate to="/cartelera" />)
                : <Navigate to="/login" />
            } />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

const sidebarContainer = {
  width: '260px',
  flexShrink: 0,
  height: '100vh',
  position: 'sticky',
  top: 0,
  backgroundColor: '#0b0e17',
  backgroundImage: 'linear-gradient(180deg, rgba(30, 41, 59, 0.25) 0%, rgba(9, 11, 18, 0.95) 100%)',
  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  zIndex: 50
};

const activeGlowBar = {
  position: 'absolute',
  left: '0',
  top: '20%',
  bottom: '20%',
  width: '3.5px',
  borderRadius: '0 4px 4px 0',
  backgroundColor: '#38bdf8',
  boxShadow: '0 0 10px #38bdf8'
};

const quickCreateBtn = {
  marginTop: '14px',
  width: '100%',
  padding: '11px 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#f8fafc',
  fontSize: '13.5px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
};

const profileCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  marginBottom: '12px'
};

const avatarCircle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
  color: '#ffffff',
  fontWeight: '800',
  fontSize: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const onlineDot = {
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  border: '2px solid #0b0e17'
};

const logoutSidebarBtn = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  backgroundColor: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  color: '#fca5a5',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
};

export default App;