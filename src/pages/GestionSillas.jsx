import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventosService from '../services/eventosService';
import { obtenerLocalidadesPorEvento } from '../services/localidadesService';

const GestionSillas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [localidades, setLocalidades] = useState([]);
    const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
    
    // Estados
    const [modoCompra, setModoCompra] = useState('numerada'); 
    const [cantidadGeneral, setCantidadGeneral] = useState(1);
    const [sillasSeleccionadas, setSillasSeleccionadas] = useState([]);
    const [sillasOcupadas, setSillasOcupadas] = useState([]); 
    const [entradasGeneralesVendidas, setEntradasGeneralesVendidas] = useState(0);

    const [datosComprador, setDatosComprador] = useState({
        nombre: '',
        documento: '',
        correo: ''
    });
    const [cargando, setCargando] = useState(true);

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
            
            if (localidadesData.length > 0) {
                cambiarZona(localidadesData[0], eventoData.id);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("No se pudo cargar la información del evento.");
            navigate('/cartelera');
        } finally {
            setCargando(false);
        }
    };

    const cambiarZona = (localidad, idEv = id) => {
        setZonaSeleccionada(localidad);
        setSillasSeleccionadas([]);
        setCantidadGeneral(1);
        
        const esGeneral = localidad.nombre.includes('(General)');
        setModoCompra(esGeneral ? 'general' : 'numerada');
        
        if (!esGeneral) {
            const keyNumeradas = `sillas_ocupadas_ev${idEv}_zona${localidad.id}`;
            const ocupadasGuardadas = JSON.parse(localStorage.getItem(keyNumeradas)) || [];
            setSillasOcupadas(ocupadasGuardadas);
        } else {
            const keyGenerales = `entradas_generales_ev${idEv}_zona${localidad.id}`;
            const vendidas = parseInt(localStorage.getItem(keyGenerales)) || 0;
            setEntradasGeneralesVendidas(vendidas);
        }
    };

    const handleInputChange = (e) => {
        setDatosComprador({ ...datosComprador, [e.target.name]: e.target.value });
    };

    const toggleSilla = (numeroSilla) => {
        if (sillasOcupadas.includes(numeroSilla)) return;
        if (sillasSeleccionadas.includes(numeroSilla)) {
            setSillasSeleccionadas(sillasSeleccionadas.filter(s => s !== numeroSilla));
        } else {
            if (sillasSeleccionadas.length < 10) {
                setSillasSeleccionadas([...sillasSeleccionadas, numeroSilla]);
            } else {
                alert("Solo puedes seleccionar un máximo de 10 sillas por compra.");
            }
        }
    };

    const cambiarCantidad = (incremento) => {
        const nuevaCantidad = cantidadGeneral + incremento;
        const limiteDisponible = zonaSeleccionada.capacidad - entradasGeneralesVendidas;
        
        if (nuevaCantidad > 0 && nuevaCantidad <= 10 && nuevaCantidad <= limiteDisponible) {
            setCantidadGeneral(nuevaCantidad);
        }
    };

    const procesarPago = (e) => {
        e.preventDefault(); 
        
        if (modoCompra === 'numerada' && sillasSeleccionadas.length === 0) {
            alert("Por favor selecciona al menos un asiento en el mapa.");
            return;
        }

        let detalleAsientos = "";
        const nombreLimpio = zonaSeleccionada.nombre.split(' (')[0];

        if (modoCompra === 'numerada') {
            const keyNumeradas = `sillas_ocupadas_ev${evento.id}_zona${zonaSeleccionada.id}`;
            const nuevasOcupadas = [...sillasOcupadas, ...sillasSeleccionadas];
            localStorage.setItem(keyNumeradas, JSON.stringify(nuevasOcupadas));
            detalleAsientos = sillasSeleccionadas.join(', ');
        } else {
            const keyGenerales = `entradas_generales_ev${evento.id}_zona${zonaSeleccionada.id}`;
            const nuevasVendidas = entradasGeneralesVendidas + cantidadGeneral;
            localStorage.setItem(keyGenerales, nuevasVendidas);
            detalleAsientos = `Entrada General (${cantidadGeneral} boletas)`;
        }

        const mensaje = `¡Reserva confirmada con éxito!\n\n` +
                        `A nombre de: ${datosComprador.nombre}\n` +
                        `Documento: ${datosComprador.documento}\n` +
                        `Evento: ${evento.nombre}\n` +
                        `Zona: ${nombreLimpio}\n` +
                        `Asientos/Tipo: ${detalleAsientos}\n` +
                        `Total pagado: ${formatearMoneda(totalPagar)}`;
                        
        alert(mensaje);
        navigate('/cartelera');
    };

    const formatearMoneda = (valor) => new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
    }).format(valor);

    if (cargando) return <div style={{ color: '#a0a0a0', padding: '40px', textAlign: 'center', backgroundColor: '#090a0f', minHeight: '100vh' }}>Cargando información del evento...</div>;
    if (!evento) return <div style={{ color: '#ff4444', padding: '40px', textAlign: 'center', backgroundColor: '#090a0f', minHeight: '100vh' }}>Evento no encontrado.</div>;

    const totalPagar = zonaSeleccionada 
        ? (modoCompra === 'numerada' ? sillasSeleccionadas.length * zonaSeleccionada.precio : cantidadGeneral * zonaSeleccionada.precio) 
        : 0;

    return (
        <div style={{ backgroundColor: '#090a0f', color: '#ffffff', minHeight: '100vh', padding: '30px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* 1. ENCABEZADO */}
                <div style={{ backgroundColor: '#12141d', padding: '30px', borderRadius: '12px', borderLeft: '4px solid #00a8ff', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{evento.nombre}</h1>
                            <p style={{ margin: '0 0 15px 0', color: '#a0a0a0', fontSize: '15px' }}>
                                📅 {evento.fecha} | 📍 {evento.lugar?.nombre} ({evento.lugar?.ciudad})
                            </p>
                        </div>
                        <button onClick={() => navigate('/cartelera')} style={{ ...btnAccion, backgroundColor: '#333', width: 'auto' }}>
                            Volver a Cartelera
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    
                    {/* 2. FORMULARIO COMPRADOR */}
                    <div style={{ flex: '1 1 400px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', borderBottom: '1px solid #2a2d3e', paddingBottom: '10px' }}>
                            👤 Datos del Comprador
                        </h2>
                        <form id="formCompra" onSubmit={procesarPago} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={labelStyle}>Nombre</label><input type="text" name="nombre" value={datosComprador.nombre} onChange={handleInputChange} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Documento</label><input type="number" name="documento" value={datosComprador.documento} onChange={handleInputChange} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Correo</label><input type="email" name="correo" value={datosComprador.correo} onChange={handleInputChange} style={inputStyle} required /></div>
                        </form>
                    </div>

                    {/* 3. RESUMEN PEDIDO */}
                    <div style={{ flex: '1 1 400px', backgroundColor: '#12141d', borderRadius: '12px', padding: '25px' }}>
                        <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', borderBottom: '1px solid #2a2d3e', paddingBottom: '10px' }}>
                            🛒 Resumen del Pedido
                        </h2>
                        <div style={{ backgroundColor: '#1a1c29', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#a0a0a0', fontSize: '13px' }}>Zona seleccionada:</p>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#00a8ff' }}>{zonaSeleccionada?.nombre.split(' (')[0] || 'Ninguna'}</p>
                        </div>
                        <div style={{ backgroundColor: '#1a1c29', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 8px 0', color: '#a0a0a0', fontSize: '13px' }}>
                                {modoCompra === 'numerada' ? `Asientos (${sillasSeleccionadas.length}):` : 'Cantidad:'}
                            </p>
                            {modoCompra === 'numerada' ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {sillasSeleccionadas.map(silla => <span key={silla} style={{ backgroundColor: '#4caf50', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{silla}</span>)}
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>{cantidadGeneral} <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>x {formatearMoneda(zonaSeleccionada?.precio)}</span></p>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #2a2d3e', paddingTop: '15px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>TOTAL:</span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{formatearMoneda(totalPagar)}</span>
                        </div>
                        <button type="submit" form="formCompra" style={{ ...btnAccion, backgroundColor: '#4caf50', padding: '15px', fontSize: '16px' }}>
                            Confirmar Reserva →
                        </button>
                    </div>
                </div>

                {/* 4. SELECCIÓN DE ENTRADAS (MAPA / BLOQUE GENERAL) */}
                <div style={{ backgroundColor: '#12141d', borderRadius: '12px', padding: '30px' }}>
                    <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', borderBottom: '1px solid #2a2d3e', paddingBottom: '10px' }}>
                        🎟️ Selección de Entradas
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {localidades.map(loc => (
                            <button key={loc.id} type="button" onClick={() => cambiarZona(loc, evento.id)}
                                style={{
                                    padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    backgroundColor: zonaSeleccionada?.id === loc.id ? '#00a8ff' : '#2a2d3e', color: 'white', transition: '0.2s', whiteSpace: 'nowrap'
                                }}
                            >
                                {loc.nombre.split(' (')[0]} - {formatearMoneda(loc.precio)}
                            </button>
                        ))}
                    </div>

                    {localidades.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#ff4444', padding: '40px' }}>Sin zonas configuradas.</div>
                    ) : (
                        <>
                            {/* ESCENARIO COMPARTIDO PARA AMBAS MODALIDADES */}
                            <div style={{ width: '100%', height: '40px', backgroundColor: '#2a2d3e', borderRadius: '0 0 100px 100px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', color: '#a0a0a0', fontWeight: 'bold', letterSpacing: '2px' }}>ESCENARIO</div>
                            
                            {modoCompra === 'general' ? (
                                /* VISTA DE ZONA GENERAL (MAPA SIMULADO) */
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                    
                                    {/* Gráfico de Pista General */}
                                    <div style={{ flex: '1', minWidth: '250px', height: '200px', backgroundColor: '#00a8ff15', border: '2px dashed #00a8ff', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#00a8ff' }}>
                                        <span style={{ fontSize: '40px', marginBottom: '10px' }}>🧍‍♂️🧍‍♀️🧍</span>
                                        <h3 style={{ margin: '0 0 5px 0' }}>ZONA GENERAL</h3>
                                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Ubicación por orden de llegada</p>
                                    </div>

                                    {/* Contador de Boletas */}
                                    <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#090a0f', padding: '30px', borderRadius: '8px', border: '1px solid #2a2d3e' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#a0a0a0' }}>¿Cuántas entradas deseas?</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                                            <button type="button" onClick={() => cambiarCantidad(-1)} style={btnCounter}>-</button>
                                            <span style={{ fontSize: '36px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>{cantidadGeneral}</span>
                                            <button type="button" onClick={() => cambiarCantidad(1)} style={btnCounter}>+</button>
                                        </div>
                                        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Disponibles: <b style={{ color: '#fff' }}>{zonaSeleccionada.capacidad - entradasGeneralesVendidas}</b> de {zonaSeleccionada.capacidad}</p>
                                    </div>

                                </div>
                            ) : (
                                /* VISTA DE ZONA NUMERADA (GRILLA DE SILLAS) */
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(35px, 1fr))', gap: '8px', justifyContent: 'center', backgroundColor: '#090a0f', padding: '20px', borderRadius: '8px', border: '1px solid #2a2d3e' }}>
                                        {Array.from({ length: Math.min(zonaSeleccionada?.capacidad || 0, 1000) }, (_, i) => i + 1).map(numeroSilla => {
                                            const seleccionada = sillasSeleccionadas.includes(numeroSilla);
                                            const ocupada = sillasOcupadas.includes(numeroSilla);
                                            let bgColor = ocupada ? '#8b0000' : (seleccionada ? '#4caf50' : '#2a2d3e');
                                            let color = (ocupada || seleccionada) ? '#fff' : '#a0a0a0';
                                            return (
                                                <button key={numeroSilla} type="button" onClick={() => toggleSilla(numeroSilla)} disabled={ocupada}
                                                    style={{ width: '100%', aspectRatio: '1/1', borderRadius: '6px', border: 'none', cursor: ocupada ? 'not-allowed' : 'pointer', backgroundColor: bgColor, color: color, fontSize: '12px', fontWeight: 'bold', transition: '0.2s', opacity: ocupada ? 0.6 : 1 }}
                                                >
                                                    {numeroSilla}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#2a2d3e', borderRadius: '4px' }}></div> Disponible</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#4caf50', borderRadius: '4px' }}></div> Tu Selección</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#8b0000', borderRadius: '4px', opacity: 0.6 }}></div> Ocupada</div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#090a0f', border: '1px solid #2a2d3e', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' };
const btnAccion = { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: 'white', fontWeight: 'bold', transition: '0.2s', width: '100%' };
const btnCounter = { width: '40px', height: '40px', borderRadius: '8px', border: 'none', backgroundColor: '#2a2d3e', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' };

export default GestionSillas;