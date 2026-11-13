import { useState, useEffect } from 'react';
import lugaresService from "../services/lugaresService";

const GestionLugares = () => {
    const [lugares, setLugares] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [editandoId, setEditandoId] = useState(null);

    // Estado exacto mapeado a tu LugarRequest del backend
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        ciudad: '',
        capacidad: ''
    });

    useEffect(() => {
        cargarLugares();
    }, []);

    const cargarLugares = async () => {
        try {
            setCargando(true);
            // Usamos tu método listar() del crudService
            const data = await lugaresService.listar();
            setLugares(data);
        } catch (error) {
            console.error("Error al cargar lugares:", error);
            alert("No se pudieron cargar los lugares. Revisa tu conexión o sesión.");
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'capacidad' ? Number(value) : value });
    };

    const prepararEdicion = (lugar) => {
        setEditandoId(lugar.id);
        setFormData({
            nombre: lugar.nombre,
            direccion: lugar.direccion,
            ciudad: lugar.ciudad,
            capacidad: lugar.capacidad
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormData({ nombre: '', direccion: '', ciudad: '', capacidad: '' });
    };

    const guardarLugar = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                // Usamos tu método actualizar()
                await lugaresService.actualizar(editandoId, formData);
                alert("¡Lugar actualizado con éxito!");
            } else {
                // Usamos tu método crear()
                await lugaresService.crear(formData);
                alert("¡Lugar creado con éxito!");
            }
            cancelarEdicion();
            cargarLugares();
        } catch (error) {
            console.error("Error al guardar el lugar:", error);
            alert("Ocurrió un error al guardar. Verifica los datos.");
        }
    };

    const eliminarLugar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este lugar? Esta acción no se puede deshacer.")) return;
        
        try {
            // Usamos tu método eliminar()
            await lugaresService.eliminar(id);
            alert("Lugar eliminado.");
            cargarLugares();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se puede eliminar. Es posible que tenga eventos asociados.");
        }
    };

    return (
        <div style={{ backgroundColor: '#090a0f', color: '#ffffff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                <h1 style={{ fontSize: '28px', borderBottom: '1px solid #2a2d3e', paddingBottom: '15px', marginBottom: '30px' }}>
                    Panel de Administración: Gestión de Lugares
                </h1>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px', height: 'fit-content' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#a0a0a0' }}>
                            {editandoId ? '✏️ Editar Lugar' : '➕ Registrar Nuevo Lugar'}
                        </h2>
                        
                        <form onSubmit={guardarLugar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre del lugar (Ej: Estadio, Coliseo)" style={inputStyle} required />
                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} placeholder="Ciudad / Región" style={inputStyle} required />
                            <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección exacta" style={inputStyle} required />
                            <input type="number" name="capacidad" value={formData.capacidad} onChange={handleInputChange} placeholder="Capacidad máxima" style={inputStyle} required min="1" />
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ ...btnStyle, backgroundColor: '#4caf50', flex: '1' }}>
                                    {editandoId ? 'Actualizar' : 'Guardar'}
                                </button>
                                {editandoId && (
                                    <button type="button" onClick={cancelarEdicion} style={{ ...btnStyle, backgroundColor: '#333', flex: '1' }}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* COLUMNA DERECHA: Lista de Lugares */}
                    <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#a0a0a0' }}>📍 Lugares Disponibles</h2>
                        
                        {cargando ? (
                            <p style={{ color: '#666' }}>Cargando lugares...</p>
                        ) : lugares.length === 0 ? (
                            <div style={{ backgroundColor: '#2a2d3e', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#a0a0a0', margin: 0 }}>No hay lugares registrados. Añade el primero.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {lugares.map(lugar => (
                                    <div key={lugar.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1c29', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #cc3b22' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{lugar.nombre}</h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                                                🏢 {lugar.ciudad} | 📍 {lugar.direccion} | 👥 Aforo: {lugar.capacidad}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => prepararEdicion(lugar)} style={{ ...btnAccion, backgroundColor: '#2a2d3e' }}>✏️</button>
                                            <button onClick={() => eliminarLugar(lugar.id)} style={{ ...btnAccion, backgroundColor: '#8b0000' }}>🗑️</button>
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

const inputStyle = { padding: '12px', backgroundColor: '#090a0f', border: '1px solid #2a2d3e', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '12px', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };
const btnAccion = { padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: 'white', transition: '0.2s' };

export default GestionLugares;