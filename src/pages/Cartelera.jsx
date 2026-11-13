import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventosService from '../services/eventosService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const resolverUrlImagen = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Cartelera = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const [imagenesFallidas, setImagenesFallidas] = useState({});

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        try {
            setCargando(true);
            const data = await eventosService.listar();
            setEventos(data);
            setImagenesFallidas({});
        } catch (error) {
            console.error("Error al cargar la cartelera:", error);
            alert("No se pudieron cargar los eventos disponibles.");
        } finally {
            setCargando(false);
        }
    };

    const obtenerEstiloPoster = (index, categoria = '') => {
        const cat = categoria.toLowerCase();
        if (cat.includes('concierto') || cat.includes('música')) {
            return { bg: 'linear-gradient(135deg, #311042 0%, #1e1b4b 55%, #090d16 100%)', accent: '#c084fc', icon: '🎸' };
        }
        if (cat.includes('recreativo') || cat.includes('fiesta')) {
            return { bg: 'linear-gradient(135deg, #0f2942 0%, #164e63 55%, #090d16 100%)', accent: '#38bdf8', icon: '✨' };
        }
        const paletas = [
            { bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #090d16 100%)', accent: '#818cf8', icon: '🎭' },
            { bg: 'linear-gradient(135deg, #064e3b 0%, #115e59 55%, #090d16 100%)', accent: '#34d399', icon: '🎟️' },
            { bg: 'linear-gradient(135deg, #4c1d95 0%, #701a75 55%, #090d16 100%)', accent: '#f472b6', icon: '🔥' }
        ];
        return paletas[index % paletas.length];
    };

    const categoriasDisponibles = ['TODAS', ...new Set(eventos.map(e => e.categoria?.nombre).filter(Boolean))];

    const eventosFiltrados = eventos.filter(ev => {
        const coincideTexto =
            ev.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (ev.lugar?.ciudad || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (ev.lugar?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
        const coincideCat = categoriaFiltro === 'TODAS' || ev.categoria?.nombre === categoriaFiltro;
        return coincideTexto && coincideCat;
    });

    if (cargando) {
        return (
            <div style={{ ...pageWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '16px' }}>Cargando cartelera de espectáculos...</p>
            </div>
        );
    }

    return (
        <div style={pageWrapper}>
            <style>{`
                .cartelera-card {
                    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, box-shadow 0.28s ease;
                }
                .cartelera-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(56, 189, 248, 0.45) !important;
                    box-shadow: 0 20px 38px rgba(0, 0, 0, 0.6) !important;
                }
                .buy-btn {
                    transition: all 0.22s ease;
                }
                .buy-btn:hover {
                    filter: brightness(1.12);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35) !important;
                }
                .search-box:focus {
                    border-color: #38bdf8 !important;
                    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15) !important;
                }
            `}</style>

            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                {/* HERO HEADER */}
                <div style={heroSection}>
                    <div>
                        <span style={heroTag}>✨ EXPERIENCIAS EN VIVO</span>
                        <h1 style={{ fontSize: '34px', margin: '10px 0 8px 0', fontWeight: '800', letterSpacing: '-0.6px' }}>
                            Cartelera de Eventos
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', maxWidth: '540px' }}>
                            Descubre conciertos, festivales y eventos exclusivos en tu ciudad. Selecciona tus localidades y asegura tu entrada al instante.
                        </p>
                    </div>

                    {/* BUSCADOR EN VIVO */}
                    <div style={{ minWidth: '280px', flex: '0 1 340px' }}>
                        <input
                            className="search-box"
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="🔍 Buscar por evento, ciudad o escenario..."
                            style={searchInput}
                        />
                    </div>
                </div>

                {/* PÍLDORAS DE FILTRO POR CATEGORÍA */}
                {categoriasDisponibles.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
                        {categoriasDisponibles.map(cat => {
                            const activa = categoriaFiltro === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaFiltro(cat)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: activa ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.09)',
                                        backgroundColor: activa ? 'rgba(56, 189, 248, 0.15)' : 'rgba(17, 20, 30, 0.7)',
                                        color: activa ? '#38bdf8' : '#94a3b8',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat === 'TODAS' ? 'Todos los eventos' : cat}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* GRILLA DE EVENTOS */}
                {eventosFiltrados.length === 0 ? (
                    <div style={{ backgroundColor: 'rgba(15, 18, 28, 0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '50px', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                            No encontramos eventos que coincidan con tu búsqueda.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '28px' }}>
                        {eventosFiltrados.map((evento, idx) => {
                            const tieneImagenValida = evento.imagenUrl && evento.imagenUrl.trim() !== '' && !imagenesFallidas[evento.id];
                            const estiloTema = obtenerEstiloPoster(idx, evento.categoria?.nombre);

                            return (
                                <div key={evento.id} className="cartelera-card" style={cardContainer}>
                                    {/* PÓSTER */}
                                    <div style={{
                                        width: '100%',
                                        height: '215px',
                                        background: estiloTema.bg,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '22px',
                                        textAlign: 'center',
                                        borderBottom: '1px solid rgba(255,255,255,0.07)'
                                    }}>
                                        {tieneImagenValida ? (
                                            <>
                                                <img
                                                    src={resolverUrlImagen(evento.imagenUrl)}
                                                    alt={evento.nombre}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                                    onError={() => setImagenesFallidas(prev => ({ ...prev, [evento.id]: true }))}
                                                />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,13,20,0.9) 0%, transparent 60%)' }} />
                                            </>
                                        ) : (
                                            <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '28px', marginBottom: '8px' }}>{estiloTema.icon}</span>
                                                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2.5px', color: estiloTema.accent, marginBottom: '6px', fontWeight: '700' }}>
                                                    {evento.categoria?.nombre || 'En Vivo'}
                                                </span>
                                                <h2 style={{ fontSize: '23px', margin: 0, color: '#ffffff', fontWeight: '800', lineHeight: '1.2', textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
                                                    {evento.nombre}
                                                </h2>
                                            </div>
                                        )}

                                        <span style={posterBadge}>
                                            {evento.categoria?.nombre || 'Evento'}
                                        </span>
                                    </div>

                                    {/* CUERPO DE LA TARJETA */}
                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
                                                {evento.nombre}
                                            </h3>
                                            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.55' }}>
                                                {evento.descripcion}
                                            </p>

                                            <div style={infoBox}>
                                                <div style={infoRow}>
                                                    <span style={{ color: '#64748b' }}>📅 Fecha</span>
                                                    <strong style={{ color: '#e2e8f0' }}>{evento.fecha}</strong>
                                                </div>
                                                <div style={infoRow}>
                                                    <span style={{ color: '#64748b' }}>🏢 Ciudad</span>
                                                    <strong style={{ color: '#e2e8f0' }}>{evento.lugar?.ciudad || 'Por definir'}</strong>
                                                </div>
                                                <div style={infoRow}>
                                                    <span style={{ color: '#64748b' }}>📍 Escenario</span>
                                                    <strong style={{ color: '#e2e8f0' }}>{evento.lugar?.nombre || 'Por definir'}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="buy-btn"
                                            onClick={() => navigate(`/eventos/${evento.id}/comprar`)}
                                            style={ctaButton}
                                        >
                                            🎟️ Comprar Entradas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const pageWrapper = {
    backgroundColor: '#06070a',
    backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(168, 85, 247, 0.08) 0%, transparent 45%)',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '40px 24px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

const heroSection = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '26px',
    marginBottom: '24px'
};

const heroTag = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(56, 189, 248, 0.25)'
};

const searchInput = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(15, 18, 28, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s'
};

const cardContainer = {
    backgroundColor: 'rgba(15, 18, 28, 0.9)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
};

const posterBadge = {
    position: 'absolute',
    top: '14px',
    right: '14px',
    backgroundColor: 'rgba(6, 7, 10, 0.72)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: '600',
    backdropFilter: 'blur(6px)',
    zIndex: 3
};

const infoBox = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
    marginBottom: '22px',
    backgroundColor: '#090b10',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const infoRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const ctaButton = {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14.5px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
};

export default Cartelera;