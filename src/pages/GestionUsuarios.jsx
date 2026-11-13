import { useEffect, useState } from 'react';
import api from '../services/api';

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        rol: 'ADMIN',
    });
    const [verPassword, setVerPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [cargandoLista, setCargandoLista] = useState(true);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const cargarUsuarios = async () => {
        setCargandoLista(true);
        try {
            const { data } = await api.get('/api/usuarios');
            setUsuarios(Array.isArray(data) ? data : []);
        } catch {
            setUsuarios([]);
        } finally {
            setCargandoLista(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });
        setCargando(true);

        try {
            await api.post('/api/usuarios', form);
            setMensaje({
                tipo: 'exito',
                texto: `Usuario ${form.correo} creado con rol ${form.rol}.`,
            });
            setForm({
                nombre: '',
                apellido: '',
                correo: '',
                password: '',
                rol: 'ADMIN',
            });
            cargarUsuarios();
        } catch (err) {
            setMensaje({
                tipo: 'error',
                texto: err.response?.data?.message || 'No se pudo registrar el usuario.',
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={pageContainer}>
            <style>{`
        .ef-user-input:focus {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18) !important;
        }
        .ef-user-submit {
          transition: all 0.2s ease;
        }
        .ef-user-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `}</style>

            {/* ENCABEZADO */}
            <div style={{ marginBottom: '26px' }}>
                <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '800', color: '#f8fafc' }}>
                    Gestión de Usuarios y Roles
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                    Crea cuentas de administradores o clientes y consulta los accesos activos en EventFlow.
                </p>
            </div>

            {/* GRID PRINCIPAL */}
            <div style={contentGrid}>
                {/* TARJETA FORMULARIO */}
                <div style={panelCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <span style={iconBadge}>🛡️</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                                Registrar Nuevo Usuario
                            </h2>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                Asigna privilegios de administración o cliente
                            </span>
                        </div>
                    </div>

                    {mensaje.texto && (
                        <div style={mensaje.tipo === 'exito' ? successBanner : errorBanner}>
                            <span>{mensaje.tipo === 'exito' ? '✅' : '⚠️'}</span>
                            <span>{mensaje.texto}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Nombre</label>
                                <input
                                    className="ef-user-input"
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Carlos"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Apellido</label>
                                <input
                                    className="ef-user-input"
                                    type="text"
                                    name="apellido"
                                    value={form.apellido}
                                    onChange={handleChange}
                                    placeholder="Ej. Mendoza"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Correo Electrónico</label>
                            <input
                                className="ef-user-input"
                                type="email"
                                name="correo"
                                value={form.correo}
                                onChange={handleChange}
                                placeholder="nuevo.admin@eventflow.com"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="ef-user-input"
                                    type={verPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                    style={{ ...inputStyle, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setVerPassword(!verPassword)}
                                    style={eyeBtn}
                                    title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {verPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Rol en la Plataforma</label>
                            <select
                                className="ef-user-input"
                                name="rol"
                                value={form.rol}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="ADMIN">ADMIN (Administrador total)</option>
                                <option value="USER">USER (Cliente / Comprador)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="ef-user-submit"
                            style={{ ...submitBtn, opacity: cargando ? 0.7 : 1 }}
                        >
                            {cargando ? 'Guardando...' : '+ Crear Usuario'}
                        </button>
                    </form>
                </div>

                {/* TARJETA LISTADO DE USUARIOS */}
                <div style={panelCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={iconBadge}>👥</span>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                                    Cuentas Registradas
                                </h2>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} en sistema
                                </span>
                            </div>
                        </div>
                    </div>

                    {cargandoLista ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            Cargando usuarios...
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            No hay usuarios disponibles para mostrar.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '440px', overflowY: 'auto' }}>
                            {usuarios.map((u) => (
                                <div key={u.id || u.correo} style={userRowCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                        <div style={userAvatar}>
                                            {(u.nombre || u.correo || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {u.nombre ? `${u.nombre} ${u.apellido || ''}` : u.correo}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {u.correo}
                                            </div>
                                        </div>
                                    </div>

                                    <span style={u.rol === 'ADMIN' ? adminBadge : userBadge}>
                                        {u.rol}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const pageContainer = {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
};

const contentGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
    alignItems: 'start',
};

const panelCard = {
    backgroundColor: '#0b0e17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
};

const iconBadge = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
};

const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '6px',
};

const inputStyle = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: '10px',
    backgroundColor: '#06070a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    fontSize: '13.5px',
    outline: 'none',
};

const eyeBtn = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: 0,
};

const submitBtn = {
    marginTop: '6px',
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
};

const successBanner = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    color: '#6ee7b7',
    fontSize: '13px',
    marginBottom: '14px',
};

const errorBanner = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '14px',
};

const userRowCard = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
};

const userAvatar = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
};

const adminBadge = {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.3)',
};

const userBadge = {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
};

export default GestionUsuarios;