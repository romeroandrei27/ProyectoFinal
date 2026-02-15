import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

// --- ICONO ---
const BookIcon = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 20H75C77.7614 20 80 22.2386 80 25V75C80 77.7614 77.7614 80 75 80H25C22.2386 80 20 77.7614 20 75V25C20 22.2386 22.2386 20 25 20Z" fill="#F3D592" stroke="#2B1B17" strokeWidth="3"/>
    <path d="M20 70H75" stroke="#2B1B17" strokeWidth="3"/>
    <path d="M35 20V70" stroke="#2B1B17" strokeWidth="2" strokeDasharray="4 2"/>
  </svg>
);

const theme = {
  estudiante: { main: '#4318FF', bg: '#F4F7FE', label: 'Estudiante' },
  profesor: { main: '#05CD99', bg: '#F0FFF4', label: 'Profesor' },
  director: { main: '#EE5D50', bg: '#FFF5F5', label: 'Director' },
  coordinador: { main: '#FFA800', bg: '#FFF9F0', label: 'Coordinador' },
  default: { main: '#718096', bg: '#F7FAFC', label: 'Usuario' }
};

const dbSimulada = {
  estudiantes: ["Juan Pérez", "María García", "Carlos López"],
  clases: ["Matemáticas", "Historia", "Física"],
  profesores: ["Prof. Alberto R.", "Dra. Elena M."]
};

export default function App() {
  const [view, setView] = useState('role-select'); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);
  const [className, setClassName] = useState('');
  const [inClass, setInClass] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [avisoText, setAvisoText] = useState('');
  const [coordQuery, setCoordQuery] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', fileName: '' });

  const currentTheme = theme[selectedRole] || theme.default;

  const onLogin = (e) => {
    e.preventDefault();
    setUser({ name: formData.email || "Usuario", role: selectedRole });
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('role-select');
    setUser(null);
    setSelectedRole(null);
    setInClass(false);
    setClassName('');
    setCoordQuery(null);
    setUploads([]);
  };

  const exportarPDF = () => {
    if (!user) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`REPORTE MICROCLASSROOM`, 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Rol: ${theme[user.role].label} | Usuario: ${user.name}`, 20, 35);
    doc.line(20, 40, 190, 40);

    if (user.role === 'estudiante') {
      doc.text(`Tareas Pendientes en: ${className}`, 20, 50);
      const tasks = className.toLowerCase().includes('matem') ? ["Tarea 1: Fracciones", "Proyecto: Álgebra"] : ["Sin pendientes"];
      tasks.forEach((t, i) => doc.text(`• ${t}`, 25, 60 + (i * 10)));
    } else if (user.role === 'profesor') {
      doc.text(`Historial de Cargas en: ${className}`, 20, 50);
      uploads.forEach((u, i) => doc.text(`${i+1}. [${u.category}] ${u.fileName}`, 20, 60 + (i*10)));
    } else if (user.role === 'director') {
      doc.text("Aviso Institucional:", 20, 50);
      doc.text(doc.splitTextToSize(avisoText || "Sin mensaje", 170), 20, 60);
    } else if (user.role === 'coordinador') {
      doc.text(`Lista de ${coordQuery}:`, 20, 50);
      dbSimulada[coordQuery].forEach((item, i) => doc.text(`- ${item}`, 20, 60 + (i*10)));
    }
    doc.save("MicroClassroom_Reporte.pdf");
  };

  return (
    <div style={{ ...containerStyle, backgroundColor: currentTheme.bg }}>
      <AnimatePresence mode="wait">
        
        {/* SELECCIÓN DE ROL */}
        {view === 'role-select' && (
          <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={cardStyle}>
            <BookIcon />
            <h1 style={titleStyle}>MicroClassroom</h1>
            <p style={subtitleStyle}>Selecciona tu perfil para ingresar</p>
            <div style={gridStyle}>
              {['estudiante', 'profesor', 'director', 'coordinador'].map(role => (
                <button key={role} onClick={() => { setSelectedRole(role); setView('login'); }} style={{ ...roleBtnStyle, border: `2px solid ${theme[role].main}`, color: theme[role].main }}>
                  {theme[role].label.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* LOGIN */}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
            <h2 style={{ color: currentTheme.main, marginBottom: '20px' }}>Acceso {currentTheme.label}</h2>
            <form onSubmit={onLogin} style={formStyle}>
              <label style={labelStyle}>Nombre de Usuario</label>
              <input style={inputStyle} placeholder="Ej: Juan Perez" onChange={e => setFormData({...formData, email: e.target.value})} required />
              <label style={labelStyle}>Contraseña</label>
              <input type="password" style={inputStyle} placeholder="••••••••" required />
              <button style={{ ...btnPrimary, backgroundColor: currentTheme.main }}>INICIAR SESIÓN</button>
            </form>
            <button onClick={() => { setView('role-select'); setSelectedRole(null); }} style={backBtn}>← REGRESAR</button>
          </motion.div>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && user && (
          <motion.div key="dash" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...cardStyle, width: '420px' }}>
            <div style={{ ...headerStyle, backgroundColor: theme[user.role].main }}>
              <div style={{textAlign: 'left'}}>
                <h3 style={{margin: 0, fontSize: '20px'}}>{user.role.toUpperCase()}</h3>
                <p style={{margin: 0, opacity: 0.9}}>{user.name}</p>
              </div>
              {/* BOTÓN PDF: Solo aparece si está en clase o tiene datos */}
              {(inClass || avisoText || coordQuery) && (
                <button onClick={exportarPDF} style={pdfMiniBtn}>📄 EXPORTAR PDF</button>
              )}
            </div>

            <div style={sectionStyle}>
              {/* COORDINADOR */}
              {user.role === 'coordinador' && (
                <div style={sectionStyle}>
                  <p style={labelStyle}>Gestión de Registros:</p>
                  <button onClick={() => setCoordQuery('estudiantes')} style={{...btnPrimary, backgroundColor: theme.coordinador.main}}>VER ESTUDIANTES</button>
                  <button onClick={() => setCoordQuery('clases')} style={{...btnPrimary, backgroundColor: theme.coordinador.main}}>VER CLASES</button>
                  <button onClick={() => setCoordQuery('profesores')} style={{...btnPrimary, backgroundColor: theme.coordinador.main}}>VER PROFESORES</button>
                  {coordQuery && (
                    <div style={uploadBox}>
                      <h4 style={{marginTop: 0, borderBottom: '1px solid #ddd'}}>Registros de {coordQuery}</h4>
                      {dbSimulada[coordQuery].map((item, i) => <li key={i} style={{fontSize: '15px', padding: '5px 0'}}>{item}</li>)}
                    </div>
                  )}
                </div>
              )}

              {/* DIRECTOR */}
              {user.role === 'director' && (
                <div style={sectionStyle}>
                  <p style={labelStyle}>Redactar Aviso Oficial:</p>
                  <textarea style={{ ...inputStyle, height: '120px', fontSize: '15px' }} placeholder="Escriba aquí el mensaje para la comunidad..." value={avisoText} onChange={(e) => setAvisoText(e.target.value)} />
                  <button onClick={() => alert("Mensaje publicado")} style={{ ...btnPrimary, backgroundColor: theme.director.main }}>PUBLICAR AVISO</button>
                </div>
              )}

              {/* ESTUDIANTE / PROFESOR */}
              {(user.role === 'estudiante' || user.role === 'profesor') && (
                <>
                  {!inClass ? (
                    <div style={sectionStyle}>
                      <p style={labelStyle}>Nombre de la Materia:</p>
                      <input style={inputStyle} placeholder="Ej: Matemáticas" value={className} onChange={e => setClassName(e.target.value)} />
                      <button disabled={!className} onClick={() => setInClass(true)} style={{ ...btnPrimary, backgroundColor: theme[user.role].main }}>ENTRAR A CLASE</button>
                    </div>
                  ) : (
                    <div style={sectionStyle}>
                      <div style={{background: '#eee', padding: '10px', borderRadius: '10px'}}>
                        <p style={{margin: 0, fontSize: '14px', color: '#666'}}>Materia Activa:</p>
                        <strong style={{fontSize: '18px'}}>{className}</strong>
                      </div>

                      {user.role === 'estudiante' && (
                        <div style={pendingBox}>
                          <h4 style={{margin: '0 0 10px 0'}}>📋 Pendientes:</h4>
                          {className.toLowerCase().includes('matem') ? (
                            <ul style={{margin: 0, paddingLeft: '20px'}}>
                              <li>Tarea 1: Fracciones</li>
                              <li>Proyecto: Álgebra</li>
                            </ul>
                          ) : <p style={{color: '#05CD99', margin: 0}}>✅ No tienes tareas pendientes.</p>}
                        </div>
                      )}

                      {(user.role === 'profesor' || (user.role === 'estudiante' && className.toLowerCase().includes('matem'))) && (
                        <div style={btnGrid}>
                          <button onClick={() => setActiveCategory('Tarea')} style={actionBtn}>+ TAREA</button>
                          <button onClick={() => setActiveCategory('Proyecto')} style={actionBtn}>+ PROYECTO</button>
                          <button onClick={() => setActiveCategory('Examen')} style={actionBtn}>+ EXAMEN</button>
                        </div>
                      )}

                      {activeCategory && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={uploadBox}>
                          <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Subir {activeCategory}:</p>
                          <input style={inputStyle} placeholder="Nombre del archivo..." value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} />
                          <button onClick={() => {
                            if (user.role === 'profesor') setUploads([...uploads, {category: activeCategory, fileName: formData.fileName}]);
                            alert("Archivo cargado con éxito");
                            setFormData({...formData, fileName: ''});
                            setActiveCategory(null);
                          }} style={{ ...btnPrimary, backgroundColor: theme[user.role].main }}>CONFIRMAR SUBIDA</button>
                        </motion.div>
                      )}
                      <button onClick={() => {setInClass(false); setActiveCategory(null);}} style={backBtn}>CERRAR CLASE</button>
                    </div>
                  )}
                </>
              )}
            </div>
            <button onClick={handleLogout} style={logoutBtn}>CERRAR SESIÓN TOTAL</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- ESTILOS MEJORADOS (TEXTO CLARO) ---
const containerStyle = { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' };
const cardStyle = { backgroundColor: '#FFF', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '380px', textAlign: 'center' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#1B254B', margin: '10px 0' };
const subtitleStyle = { fontSize: '15px', color: '#718096', marginBottom: '25px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const roleBtnStyle = { padding: '18px 10px', borderRadius: '15px', background: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E0E5F2', marginBottom: '15px', boxSizing: 'border-box', fontSize: '16px' };
const labelStyle = { display: 'block', textAlign: 'left', fontWeight: 'bold', color: '#2B3674', marginBottom: '5px', fontSize: '14px' };
const formStyle = { display: 'flex', flexDirection: 'column', marginTop: '10px' };
const btnPrimary = { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', color: '#FFF', fontWeight: '800', cursor: 'pointer', fontSize: '15px', letterSpacing: '1px' };
const headerStyle = { width: '100%', padding: '25px', borderRadius: '20px', color: '#FFF', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' };
const pdfMiniBtn = { background: '#FFF', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#333' };
const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const btnGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' };
const actionBtn = { padding: '12px 5px', fontSize: '11px', borderRadius: '10px', border: '2px solid #4318FF', color: '#4318FF', background: 'white', fontWeight: 'bold', cursor: 'pointer' };
const pendingBox = { background: '#FFF9F0', padding: '15px', borderRadius: '15px', border: '1px solid #FFE0B2', textAlign: 'left' };
const uploadBox = { background: '#F4F7FE', padding: '20px', borderRadius: '15px', border: '2px dashed #4318FF', textAlign: 'left' };
const backBtn = { background: 'none', border: 'none', color: '#A3AED0', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', fontSize: '13px' };
const logoutBtn = { marginTop: '30px', color: '#EE5D50', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline' };
