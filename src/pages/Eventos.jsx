import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import eventosService from '../services/eventosService';
import lugaresService from '../services/lugaresService';
import categoriasService from '../services/categoriasService';
import api from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const resolverUrlImagen = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Eventos = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [eventos, setEventos] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
    const [cargando, setCargando] = useState(true);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        fecha: '',
        descripcion: '',
        imagenUrl: '',
        idLugar: '',
        idCategoria: ''
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            setCargando(true);
            const [eventosData, lugaresData, categoriasData] = await Promise.all([
                eventosService.listar(),
                lugaresService.listar(),
                categoriasService.listar()
            ]);

            setEventos(eventosData);
            setLugares(lugaresData);
            setCategorias(categoriasData);

            const ciudadesUnicas = [...new Set(lugaresData.map(lugar => lugar.ciudad))];
            setCiudades(ciudadesUnicas);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("Error de conexión. Verifica que el backend esté corriendo.");
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: (name === 'idLugar' || name === 'idCategoria') ? Number(value) : value
        });
    };

    const handleCiudadChange = (e) => {
        setCiudadSeleccionada(e.target.value);
        setFormData({ ...formData, idLugar: '' });
    };

    const handleSubirPoster = async (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        const nombreLower = archivo.name.toLowerCase();
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
        const extensionValida = nombreLower.endsWith('.png') || nombreLower.endsWith('.jpg') || nombreLower.endsWith('.jpeg');

        if (!tiposPermitidos.includes(archivo.type) && !extensionValida) {
            alert("Formato no válido. Solo se permiten imágenes .PNG o .JPG.");
            e.target.value = '';
            return;
        }

        const payload = new FormData();
        payload.append('file', archivo);

        try {
            setSubiendoImagen(true);
            const res = await api.post('/api/eventos/upload-poster', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imagenUrl: res.data.url }));
        } catch (error) {
            console.error("Error al subir el póster:", error);
            const mensaje = error.response?.data?.message || "No se pudo subir la imagen. Verifica que pese menos de 10 MB y sea .PNG o .JPG.";
            alert(mensaje);
        } finally {
            setSubiendoImagen(false);
            e.target.value = '';
        }
    };

    const quitarPoster = () => {
        setFormData(prev => ({ ...prev, imagenUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const prepararEdicion = (evento) => {
        setEditandoId(evento.id);
        const ciudadDelLugar = evento.lugar?.ciudad || '';
        setCiudadSeleccionada(ciudadDelLugar);
        setFormData({
            nombre: evento.nombre,
            fecha: evento.fecha,
            descripcion: evento.descripcion,
            imagenUrl: evento.imagenUrl || '',
            idLugar: evento.lugar?.id || '',
            idCategoria: evento.categoria?.id || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setCiudadSeleccionada('');
        setFormData({ nombre: '', fecha: '', descripcion: '', imagenUrl: '', idLugar: '', idCategoria: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const guardarEvento = async (e) => {
        e.preventDefault();
        if (subiendoImagen) {
            alert("Espera un momento a que termine de subirse el póster.");
            return;
        }

        try {
            if (editandoId) {
                await eventosService.actualizar(editandoId, formData);
                alert("¡Evento actualizado!");
            } else {
                await eventosService.crear(formData);
                alert("¡Evento creado exitosamente!");
            }
            cancelarEdicion();
            cargarDatosIniciales();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar. Revisa la consola.");
        }
    };

    const eliminarEvento = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;
        try {
            await eventosService.eliminar(id);
            cargarDatosIniciales();
        } catch (error) {
            alert("No se puede eliminar, es posible que tenga localidades asociadas.");
        }
    };

    const lugaresFiltrados = lugares.filter(lugar => lugar.ciudad === ciudadSeleccionada);
    const aforoTotal = lugares.reduce((acc, l) => acc + (Number(l.capacidad) || 0), 0);

    const kpiCards = [
        { titulo: 'Eventos Activos', valor: eventos.length, badge: 'En cartelera', color: '#0ea5e9', gradId: 'waveCyan' },
        { titulo: 'Escenarios', valor: lugares.length, badge: `${ciudades.length} ciudades`, color: '#a855f7', gradId: 'wavePurple' },
        { titulo: 'Categorías', valor: categorias.length, badge: 'Disponibles', color: '#f59e0b', gradId: 'waveAmber' },
        { titulo: 'Aforo Global', valor: aforoTotal.toLocaleString('es-CO'), badge: 'Capacidad', color: '#10b981', gradId: 'waveGreen' }
    ];

    return (
        <div style={pageWrapper}>
            <style>{`
                .ev-input:focus {
                    border-color: #38bdf8 !important;
                    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15) !important;
                }
                .ev-card {
                    transition: all 0.25s ease;
                }
                .ev-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(56, 189, 248, 0.35) !important;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45) !important;
                }
                .ev-btn {
                    transition: all 0.2s ease;
                }
                .ev-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.15);
                }
                .ev-upload-zone {
                    transition: all 0.2s ease;
                }
                .ev-upload-zone:hover {
                    border-color: #38bdf8 !important;
                    background-color: rgba(56, 189, 248, 0.08) !important;
                }
            `}</style>

            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* ENCABEZADO */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', margin: '0 0 4px 0', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        Panel de Control
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                        Resumen general y administración de eventos programados.
                    </p>
                </div>

                {/* 4 TARJETAS KPI CON CURVAS DE ONDA */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                    {kpiCards.map((kpi) => (
                        <div key={kpi.titulo} style={kpiContainer}>
                            <div style={{ padding: '18px 20px 6px 20px', position: 'relative', zIndex: 2 }}>
                                <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: '500' }}>{kpi.titulo}</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                                    <strong style={{ fontSize: '26px', fontWeight: '800', color: '#f8fafc' }}>{kpi.valor}</strong>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: kpi.color,
                                        backgroundColor: `${kpi.color}1A`,
                                        border: `1px solid ${kpi.color}40`,
                                        padding: '3px 8px',
                                        borderRadius: '8px'
                                    }}>
                                        {kpi.badge}
                                    </span>
                                </div>
                            </div>
                            <svg viewBox="0 0 240 54" width="100%" height="52" preserveAspectRatio="none" style={{ display: 'block' }}>
                                <defs>
                                    <linearGradient id={kpi.gradId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={kpi.color} stopOpacity="0.45" />
                                        <stop offset="100%" stopColor={kpi.color} stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,42 C45,38 65,16 105,24 C145,32 165,8 205,14 C222,17 232,12 240,10 L240,54 L0,54 Z" fill={`url(#${kpi.gradId})`} />
                                <path d="M0,42 C45,38 65,16 105,24 C145,32 165,8 205,14 C222,17 232,12 240,10" fill="none" stroke={kpi.color} strokeWidth="2.5" />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* CONTENIDO PRINCIPAL: FORMULARIO + LISTA */}
                <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* FORMULARIO */}
                    <div style={panelGlass}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '14px' }}>
                            <div style={iconCircle}>{editandoId ? '✏️' : '✨'}</div>
                            <div>
                                <h2 style={{ fontSize: '16px', margin: 0, color: '#f8fafc' }}>
                                    {editandoId ? 'Editar Evento' : 'Crear Nuevo Evento'}
                                </h2>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Ficha técnica del espectáculo</span>
                            </div>
                        </div>

                        <form onSubmit={guardarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Nombre del Evento</label>
                                <input className="ev-input" type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Gran Concierto de Verano" style={inputStyle} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Fecha</label>
                                    <input className="ev-input" type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Categoría</label>
                                    <select className="ev-input" name="idCategoria" value={formData.idCategoria} onChange={handleInputChange} style={inputStyle} required>
                                        <option value="" disabled>Seleccionar...</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Ciudad</label>
                                    <select className="ev-input" value={ciudadSeleccionada} onChange={handleCiudadChange} style={inputStyle} required>
                                        <option value="" disabled>Ciudad...</option>
                                        {ciudades.map(ciudad => (
                                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Escenario</label>
                                    <select className="ev-input" name="idLugar" value={formData.idLugar} onChange={handleInputChange} style={{ ...inputStyle, opacity: ciudadSeleccionada ? 1 : 0.45 }} required disabled={!ciudadSeleccionada}>
                                        <option value="" disabled>Escenario...</option>
                                        {lugaresFiltrados.map(lugar => (
                                            <option key={lugar.id} value={lugar.id}>{lugar.nombre} ({lugar.capacidad})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* SECCIÓN PÓSTER: SUBIR ARCHIVO .PNG / .JPG O URL */}
                            <div>
                                <label style={labelStyle}>Póster / Pancarta del Evento (.PNG o .JPG)</label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                    onChange={handleSubirPoster}
                                    style={{ display: 'none' }}
                                />

                                <div
                                    className="ev-upload-zone"
                                    onClick={() => !subiendoImagen && fileInputRef.current?.click()}
                                    style={uploadDropzone}
                                >
                                    <span style={{ fontSize: '20px' }}>{subiendoImagen ? '⏳' : '🖼️'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>
                                            {subiendoImagen
                                                ? 'Subiendo imagen al servidor...'
                                                : formData.imagenUrl
                                                    ? 'Cambiar imagen (.PNG / .JPG)'
                                                    : 'Seleccionar imagen (.PNG / .JPG)'}
                                        </div>
                                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                            Haz clic para elegir desde tu equipo
                                        </div>
                                    </div>
                                    <span style={uploadBadge}>Explorar</span>
                                </div>

                                {/* VISTA PREVIA DEL PÓSTER */}
                                {formData.imagenUrl && (
                                    <div style={previewCard}>
                                        <img
                                            src={resolverUrlImagen(formData.imagenUrl)}
                                            alt="Vista previa del póster"
                                            style={previewThumb}
                                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', marginBottom: '2px' }}>
                                                Póster cargado
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {formData.imagenUrl}
                                            </div>
                                        </div>
                                        <button type="button" onClick={quitarPoster} style={removePosterBtn}>
                                            ✕ Quitar
                                        </button>
                                    </div>
                                )}

                                <input
                                    className="ev-input"
                                    type="text"
                                    name="imagenUrl"
                                    value={formData.imagenUrl}
                                    onChange={handleInputChange}
                                    placeholder="O pega aquí una URL externa (https://...)"
                                    style={{ ...inputStyle, marginTop: '8px', fontSize: '12.5px' }}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Descripción Promocional</label>
                                <textarea className="ev-input" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Detalles clave del evento..." style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} required />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <button className="ev-btn" type="submit" disabled={subiendoImagen} style={{ ...primaryBtn, flex: 1, opacity: subiendoImagen ? 0.65 : 1 }}>
                                    {editandoId ? 'Guardar Cambios' : 'Publicar Evento →'}
                                </button>
                                {editandoId && (
                                    <button className="ev-btn" type="button" onClick={cancelarEdicion} style={secondaryBtn}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* LISTA DE EVENTOS */}
                    <div style={{ flex: '2', minWidth: '340px', ...panelGlass }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '14px' }}>
                            <div style={iconCircle}>📅</div>
                            <div>
                                <h2 style={{ fontSize: '16px', margin: 0, color: '#f8fafc' }}>Próximos Eventos</h2>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Gestiona zonas de boletería y recaudo</span>
                            </div>
                        </div>

                        {cargando ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Cargando programación...</p>
                        ) : eventos.length === 0 ? (
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ color: '#94a3b8', margin: 0 }}>Aún no has registrado eventos.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {eventos.map(evento => (
                                    <div key={evento.id} className="ev-card" style={eventRowCard}>
                                        <div style={miniPoster}>
                                            {evento.imagenUrl ? (
                                                <img
                                                    src={resolverUrlImagen(evento.imagenUrl)}
                                                    alt={evento.nombre}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '24px' }}>🎟️</span>
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: '190px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#f8fafc' }}>{evento.nombre}</h3>
                                                <span style={categoryPill}>{evento.categoria?.nombre || 'General'}</span>
                                            </div>

                                            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                                                {evento.descripcion}
                                            </p>

                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: '#cbd5e1' }}>
                                                <span style={metaTag}>📅 {evento.fecha}</span>
                                                <span style={metaTag}>🏢 {evento.lugar?.ciudad}</span>
                                                <span style={metaTag}>📍 {evento.lugar?.nombre || 'Sin asignar'}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minWidth: '185px' }}>
                                            <button className="ev-btn" onClick={() => navigate(`/eventos/${evento.id}/localidades`)} style={actionPurple}>
                                                🎟️ Zonas
                                            </button>
                                            <button className="ev-btn" onClick={() => navigate(`/eventos/${evento.id}/recaudo`)} style={actionAmber}>
                                                💰 Recaudo
                                            </button>
                                            <button className="ev-btn" onClick={() => prepararEdicion(evento)} style={actionSlate}>
                                                ✏️ Editar
                                            </button>
                                            <button className="ev-btn" onClick={() => eliminarEvento(evento.id)} style={actionRed}>
                                                🗑️ Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const pageWrapper = {
    backgroundColor: '#06080f',
    backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.07) 0%, transparent 45%)',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '32px 28px'
};

const kpiContainer = {
    backgroundColor: '#0d111d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
};

const panelGlass = {
    flex: '1',
    minWidth: '320px',
    backgroundColor: '#0d111d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
};

const iconCircle = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px'
};

const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '6px'
};

const inputStyle = {
    width: '100%',
    padding: '11px 13px',
    backgroundColor: '#070910',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '13.5px',
    transition: 'all 0.2s ease'
};

const uploadDropzone = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#070910',
    border: '1.5px dashed rgba(56, 189, 248, 0.35)',
    borderRadius: '10px',
    cursor: 'pointer'
};

const uploadBadge = {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.28)',
    padding: '5px 10px',
    borderRadius: '8px'
};

const previewCard = {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(56, 189, 248, 0.22)',
    borderRadius: '10px'
};

const previewThumb = {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.12)'
};

const removePosterBtn = {
    padding: '5px 9px',
    borderRadius: '7px',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    flexShrink: 0
};

const primaryBtn = {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13.5px',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
};

const secondaryBtn = {
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13.5px'
};

const eventRowCard = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    backgroundColor: '#080b13',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.07)'
};

const miniPoster = {
    width: '68px',
    height: '82px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0
};

const categoryPill = {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
};

const metaTag = {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 9px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const baseAction = {
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center'
};

const actionPurple = { ...baseAction, backgroundColor: 'rgba(168, 85, 247, 0.14)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)' };
const actionAmber = { ...baseAction, backgroundColor: 'rgba(245, 158, 11, 0.14)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' };
const actionSlate = { ...baseAction, backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.25)' };
const actionRed = { ...baseAction, backgroundColor: 'rgba(239, 68, 68, 0.14)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' };

export default Eventos;