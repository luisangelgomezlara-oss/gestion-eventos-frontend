import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventosService from '../services/eventosService';
import { crearLocalidad, obtenerLocalidadesPorEvento, eliminarLocalidad } from '../services/localidadesService';

const GestionLocalidades = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [localidades, setLocalidades] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        capacidad: '',
        tipo: 'NUMERADA' // Por defecto
    });

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [eventoData, localidadesData] = await Promise.all([
                eventosService.obtener(id),
                obtenerLocalidadesPorEvento(id)
            ]);
            setEvento(eventoData);
            setLocalidades(localidadesData);
        } catch (error) {
            console.error("Error al cargar la información:", error);
            alert("No se pudo cargar la información del evento.");
            navigate('/eventos');
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const guardarLocalidad = async (e) => {
        e.preventDefault();
        try {
            // 🔥 TRUCO MAESTRO: Etiquetamos el nombre para no tener que modificar Spring Boot
            const sufijo = formData.tipo === 'GENERAL' ? '(General)' : '(Numerada)';
            const nombreConTipo = `${formData.nombre.trim()} ${sufijo}`;

            const nuevaZona = {
                nombre: nombreConTipo,
                precio: Number(formData.precio),
                capacidad: Number(formData.capacidad),
                eventoId: Number(id) 
            };

            await crearLocalidad(nuevaZona);
            alert("¡Localidad creada con éxito!");
            setFormData({ nombre: '', precio: '', capacidad: '', tipo: 'NUMERADA' });
            cargarDatos();
        } catch (error) {
            console.error("Error al crear localidad:", error);
            alert("Ocurrió un error al guardar la localidad. Revisa la consola.");
        }
    };

    const borrarLocalidad = async (localidadId) => {
        if (!window.confirm("¿Estás seguro de eliminar esta localidad?")) return;
        try {
            await eliminarLocalidad(localidadId);
            cargarDatos();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar la localidad.");
        }
    };

    const formatearMoneda = (valor) => new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
    }).format(valor);

    if (cargando) return <div style={{ color: '#a0a0a0', padding: '40px', textAlign: 'center', backgroundColor: '#090a0f', minHeight: '100vh' }}>Cargando localidades...</div>;

    return (
        <div style={{ backgroundColor: '#090a0f', color: '#ffffff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2d3e', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', margin: 0 }}>Gestión de Localidades y Silletería</h1>
                    <button onClick={() => navigate('/eventos')} style={{ ...btnStyle, backgroundColor: '#333' }}>
                        Volver a Eventos
                    </button>
                </div>

                <div style={{ backgroundColor: '#12141d', borderRadius: '12px', padding: '25px', marginBottom: '30px', borderLeft: '4px solid #00a8ff' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>{evento?.nombre}</h2>
                    <p style={{ margin: 0, color: '#a0a0a0', fontSize: '15px' }}>
                        📅 Fecha: {evento?.fecha} | 📍 Escenario: {evento?.lugar?.nombre} ({evento?.lugar?.ciudad})
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* FORMULARIO DE CREACIÓN */}
                    <div style={{ flex: '1', minWidth: '320px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px', height: 'fit-content' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#a0a0a0' }}>➕ Crear Nueva Localidad</h3>
                        
                        <form onSubmit={guardarLocalidad} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Nombre de la Zona (Ej: VIP, General)</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Platino" style={inputStyle} required />
                            </div>

                            <div>
                                <label style={labelStyle}>Precio de la Boleta ($)</label>
                                <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} placeholder="50000" style={inputStyle} min="0" required />
                            </div>

                            <div>
                                <label style={labelStyle}>Capacidad / Aforo de la Zona</label>
                                <input type="number" name="capacidad" value={formData.capacidad} onChange={handleInputChange} placeholder="100" style={inputStyle} min="1" required />
                            </div>

                            {/* 🔥 NUEVO SELECTOR PARA EL ORGANIZADOR */}
                            <div>
                                <label style={labelStyle}>Modalidad de la Zona</label>
                                <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={inputStyle} required>
                                    <option value="NUMERADA">🪑 Silletería Numerada (Mapa)</option>
                                    <option value="GENERAL">🎫 Entrada General (Por cantidad)</option>
                                </select>
                            </div>

                            <button type="submit" style={{ ...btnStyle, backgroundColor: '#4caf50', marginTop: '10px' }}>
                                Guardar Localidad
                            </button>
                        </form>
                    </div>

                    {/* LISTA DE LOCALIDADES */}
                    <div style={{ flex: '1.5', minWidth: '350px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#a0a0a0' }}>🎫 Zonas Configuradas para este Evento</h3>
                        
                        {localidades.length === 0 ? (
                            <div style={{ backgroundColor: '#2a2d3e', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#a0a0a0', margin: 0 }}>No hay localidades creadas. Agrega la primera a la izquierda.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {localidades.map(loc => (
                                    <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1c29', padding: '20px', borderRadius: '8px' }}>
                                        <div>
                                            {/* Extraemos visualmente la etiqueta para que se vea limpio */}
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#00a8ff' }}>
                                                {loc.nombre.split(' (')[0]}
                                            </h4>
                                            <span style={{ backgroundColor: '#2a2d3e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#ccc', display: 'inline-block', marginBottom: '8px' }}>
                                                {loc.nombre.includes('(General)') ? '🎫 Entrada General' : '🪑 Silletería Numerada'}
                                            </span>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#ccc' }}>Precio: <b>{formatearMoneda(loc.precio)}</b></p>
                                            <span style={{ fontSize: '13px', color: '#888' }}>Capacidad aforo: {loc.capacidad} lugares</span>
                                        </div>
                                        <button onClick={() => borrarLocalidad(loc.id)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#8b0000', color: 'white', cursor: 'pointer' }}>
                                            🗑️ Borrar
                                        </button>
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

const labelStyle = { display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#090a0f', border: '1px solid #2a2d3e', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxSizing: 'border-box' };

export default GestionLocalidades;