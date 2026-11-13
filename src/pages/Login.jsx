import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventFlowLogo from '../components/EventFlowLogo';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '' });
  const [modoAcceso, setModoAcceso] = useState('ADMIN');
  const [esRegistro, setEsRegistro] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const alternarRegistro = () => {
    const nuevoEstado = !esRegistro;
    setEsRegistro(nuevoEstado);
    if (nuevoEstado) {
      setModoAcceso('USER');
    }
    setError('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    setCargando(true);

    const endpoint = esRegistro ? '/auth/register' : '/auth/login';
    const payload = esRegistro
      ? form
      : { correo: form.correo, password: form.password };

    api.post(endpoint, payload)
      .then((res) => {
        login(res.data);
        if (res.data?.rol === 'ADMIN') {
          navigate('/eventos');
        } else {
          navigate('/cartelera');
        }
      })
      .catch((err) => {
        if (err.response) {
          if (esRegistro) {
            setError(err.response.data?.message || 'No se pudo completar el registro');
          } else {
            setError('Correo o contraseña incorrectos');
          }
        } else {
          setError('Error al conectar con el servidor');
        }
      })
      .finally(() => setCargando(false));
  };

  return (
    <div style={loginBackdrop}>
      <style>{`
        .ef-pill-input:focus {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2) !important;
          background-color: rgba(15, 23, 42, 0.95) !important;
        }
        .ef-signin-btn { transition: all 0.22s ease; }
        .ef-signin-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.12);
          box-shadow: 0 10px 26px rgba(37, 99, 235, 0.45) !important;
        }
        .ef-register-link { transition: color 0.2s ease; }
        .ef-register-link:hover { color: #7dd3fc !important; }
      `}</style>

      <div style={stageLightLeft} />
      <div style={stageLightRight} />
      <div style={stageLightCenter} />

      <div style={glassCard}>
        <div style={toggleWrapper}>
          <button
            type="button"
            onClick={() => {
              setModoAcceso('ADMIN');
              setEsRegistro(false);
              setError('');
            }}
            style={{
              ...toggleTab,
              background: modoAcceso === 'ADMIN' ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'transparent',
              color: modoAcceso === 'ADMIN' ? '#ffffff' : '#94a3b8',
              boxShadow: modoAcceso === 'ADMIN' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            ADMIN LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setModoAcceso('USER');
              setError('');
            }}
            style={{
              ...toggleTab,
              background: modoAcceso === 'USER' ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'transparent',
              color: modoAcceso === 'USER' ? '#ffffff' : '#94a3b8',
              boxShadow: modoAcceso === 'USER' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            {esRegistro ? 'USER REGISTER' : 'USER LOGIN'}
          </button>
        </div>

        {/* LOGO EVENTFLOW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '26px', flexWrap: 'wrap' }}>
          <EventFlowLogo size={42} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '23px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Event<span style={{ color: '#38bdf8' }}>Flow</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px' }}>|</span>
            <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: '500' }}>
              {esRegistro ? 'Create Account' : modoAcceso === 'ADMIN' ? 'Manage Events' : 'Buy Tickets'}
            </span>
          </div>
        </div>

        {error && (
          <div style={errorBox}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {esRegistro && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <span style={inputLeftIcon}>🪪</span>
                <input
                  className="ef-pill-input"
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  style={{ ...pillInput, paddingLeft: '40px', paddingRight: '14px' }}
                  required
                />
              </div>

              <div style={{ position: 'relative' }}>
                <span style={inputLeftIcon}>✏️</span>
                <input
                  className="ef-pill-input"
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  style={{ ...pillInput, paddingLeft: '40px', paddingRight: '14px' }}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <span style={inputLeftIcon}>👤</span>
            <input
              className="ef-pill-input"
              type="email"
              name="correo"
              placeholder={modoAcceso === 'ADMIN' && !esRegistro ? 'admin@ejemplo.com' : 'usuario@ejemplo.com'}
              value={form.correo}
              onChange={handleChange}
              style={pillInput}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <span style={inputLeftIcon}>🔒</span>
            <input
              className="ef-pill-input"
              type={verPassword ? 'text' : 'password'}
              name="password"
              placeholder={esRegistro ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'}
              value={form.password}
              onChange={handleChange}
              minLength={esRegistro ? 6 : undefined}
              style={{ ...pillInput, paddingRight: '46px' }}
              required
            />
            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
              style={eyeToggleBtn}
              title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {verPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            className="ef-signin-btn"
            style={{ ...signInPillBtn, opacity: cargando ? 0.75 : 1 }}
            disabled={cargando}
          >
            {cargando
              ? (esRegistro ? 'CREANDO CUENTA...' : 'INGRESANDO...')
              : (esRegistro ? 'CREAR CUENTA' : 'INICIAR SESIÓN')}
          </button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          {esRegistro ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta? '}
          <button
            type="button"
            onClick={alternarRegistro}
            className="ef-register-link"
            style={registerLinkBtn}
          >
            {esRegistro ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          Plataforma Integral de Gestión y Boletería · 2026
        </div>
      </div>
    </div>
  );
}

const loginBackdrop = {
  minHeight: '100vh',
  backgroundColor: '#06080f',
  backgroundImage: 'radial-gradient(circle at 50% 0%, #172554 0%, #090d16 55%, #05060a 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

const stageLightLeft = {
  position: 'absolute',
  top: '-80px',
  left: '-60px',
  width: '440px',
  height: '440px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 68%)',
  pointerEvents: 'none'
};

const stageLightRight = {
  position: 'absolute',
  top: '-60px',
  right: '-60px',
  width: '460px',
  height: '460px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 68%)',
  pointerEvents: 'none'
};

const stageLightCenter = {
  position: 'absolute',
  bottom: '-140px',
  left: '35%',
  width: '480px',
  height: '380px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
  pointerEvents: 'none'
};

const glassCard = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'rgba(15, 23, 42, 0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: '26px',
  padding: '32px 30px',
  boxShadow: '0 28px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  position: 'relative',
  zIndex: 2
};

const toggleWrapper = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  backgroundColor: 'rgba(9, 13, 22, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '999px',
  padding: '4px',
  marginBottom: '26px'
};

const toggleTab = {
  padding: '10px 12px',
  borderRadius: '999px',
  border: 'none',
  fontSize: '12px',
  fontWeight: '800',
  letterSpacing: '0.6px',
  cursor: 'pointer',
  transition: 'all 0.25s ease'
};

const errorBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'rgba(239, 68, 68, 0.16)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  color: '#fca5a5',
  padding: '10px 16px',
  borderRadius: '999px',
  fontSize: '12.5px',
  fontWeight: '600',
  marginBottom: '16px',
  justifyContent: 'center'
};

const pillInput = {
  width: '100%',
  padding: '13px 18px 13px 44px',
  borderRadius: '999px',
  backgroundColor: 'rgba(9, 13, 22, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease'
};

const inputLeftIcon = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '15px',
  opacity: 0.75,
  pointerEvents: 'none'
};

const eyeToggleBtn = {
  position: 'absolute',
  right: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '15px',
  opacity: 0.75,
  padding: '4px'
};

const signInPillBtn = {
  marginTop: '8px',
  width: '100%',
  padding: '14px',
  borderRadius: '999px',
  border: 'none',
  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0284c7 100%)',
  color: '#ffffff',
  fontSize: '13.5px',
  fontWeight: '800',
  letterSpacing: '1px',
  cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)'
};

const registerLinkBtn = {
  background: 'none',
  border: 'none',
  color: '#38bdf8',
  fontWeight: '700',
  fontSize: '13px',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline'
};

export default Login;