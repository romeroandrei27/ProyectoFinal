import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';


// --- CORRECCIÓN CLAVE: IMPORTACIÓN LOCAL ---
// Esto busca el archivo en tu carpeta real de assets
import leonImg from './assets/leon.png'; 

const styles = {
  container: {
    width: '100vw', height: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F4F7FE', fontFamily: "'Segoe UI', sans-serif", margin: 0, overflow: 'hidden'
  },
  card: {
    position: 'relative', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)', width: '380px',
    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'
  },
  lionIcon: {
    position: 'absolute', width: '100px', height: '100px', top: '-55px',
    objectFit: 'contain'
  },
  input: {
    padding: '14px', borderRadius: '12px', border: '1px solid #E0E5F2',
    fontSize: '15px', backgroundColor: '#F9FAFB', color: '#1B254B', outline: 'none'
  },
  btnPrimary: {
    padding: '14px', backgroundColor: '#4318FF', color: '#FFFFFF',
    border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
  },
  errorText: { color: '#EE5D50', fontSize: '13px', margin: 0, fontWeight: '600' }
};

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [taskCount, setTaskCount] = useState(() => Number(localStorage.getItem('taskCount')) || 0);
  const [formData, setFormData] = useState({ name: '', title: '' });

  useEffect(() => {
    localStorage.setItem('taskCount', taskCount);
  }, [taskCount]);

  const handleLogin = () => {
    // VALIDACIÓN OBLIGATORIA: No deja pasar si el nombre está vacío
    if (!formData.name.trim()) {
      setError('⚠️ ¡Por favor, escribe tu nombre para entrar!');
      return;
    }
    setError('');
    const newUser = { name: formData.name };
    setUser(newUser);
    setView('dashboard');
  };

  const handleSendTask = () => {
    if(!formData.title.trim()) return alert("Debes ponerle un título a la tarea");
    setTaskCount(prev => prev + 1);
    alert("✅ Tarea registrada correctamente");
    setView('dashboard');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Comprobante de Entrega - MicroClassroom", 20, 20);
    doc.setFontSize(12);
    doc.text(`Estudiante: ${user?.name}`, 20, 40);
    doc.text(`Tarea: ${formData.title}`, 20, 50);
    doc.text(`Total de entregas: ${taskCount}`, 20, 60);
    doc.save(`Recibo_${user?.name}.pdf`);
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={view} 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={styles.card}
        >
          {/* LEONES CARGADOS DESDE TU CARPETA ASSETS */}
          <img src={leonImg} alt="lion-left" style={{ ...styles.lionIcon, left: '-25px' }} />
          <img src={leonImg} alt="lion-right" style={{ ...styles.lionIcon, right: '-25px', transform: 'scaleX(-1)' }} />

          {view === 'login' && (
            <>
              <h2 style={{ color: '#1B254B', margin: 0 }}>Bienvenido</h2>
              <p style={{ color: '#A3AED0', fontSize: '14px' }}>Identifícate para entrar</p>
              <input 
                style={styles.input} 
                placeholder="Escribe tu nombre aquí..." 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              {error && <p style={styles.errorText}>{error}</p>}
              <button style={styles.btnPrimary} onClick={handleLogin}>Entrar al Dashboard</button>
            </>
          )}

          {view === 'dashboard' && (
            <>
              <h3 style={{ color: '#1B254B', margin: 0 }}>Panel de {user?.name}</h3>
              <div style={{ backgroundColor: '#05CD99', color: 'white', padding: '12px', borderRadius: '14px', fontWeight: 'bold' }}>
                📊 Tareas enviadas: {taskCount}
              </div>
              <button style={styles.btnPrimary} onClick={() => setView('ticket')}>Subir Nueva Tarea</button>
              <button 
                style={{ background: 'none', border: 'none', color: '#EE5D50', cursor: 'pointer', fontWeight: '600' }} 
                onClick={() => { setUser(null); setView('login'); setFormData({name:'', title:''}); }}
              >
                Cerrar Sesión
              </button>
            </>
          )}

          {view === 'ticket' && (
            <>
              <h2 style={{ color: '#1B254B', margin: 0 }}>Nueva Entrega</h2>
              <input 
                style={styles.input} 
                placeholder="Nombre de la tarea..." 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
              <button style={{ ...styles.btnPrimary, backgroundColor: '#05CD99' }} onClick={handleSendTask}>Registrar Tarea</button>
              <button style={{ ...styles.btnPrimary, backgroundColor: '#2B3674' }} onClick={generatePDF}>Descargar PDF</button>
              <button style={{ color: '#1B254B', background: 'none', border: 'none', fontWeight: 'bold' }} onClick={() => setView('dashboard')}>Cancelar</button>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}