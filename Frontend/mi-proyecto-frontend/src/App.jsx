import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const styles = {
  container: {
    width: '100vw', height: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F4F7FE', fontFamily: 'sans-serif',
    margin: 0, padding: 0, overflow: 'hidden'
  },
  card: {
    backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.06)', width: '350px',
    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'
  },
  input: {
    padding: '14px', borderRadius: '12px', border: '1px solid #E0E5F2',
    fontSize: '15px', backgroundColor: '#F9FAFB', color: '#1B254B', outline: 'none'
  },
  btnPrimary: {
    padding: '14px', backgroundColor: '#4318FF', color: '#FFFFFF',
    border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
  }
};

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '', name: '', role: 'student', title: '', desc: ''
  });

  // 1. Cargar datos al iniciar con seguridad
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role) {
          setUser(parsed);
          setView('dashboard');
        }
      }
    } catch (e) { console.error("Error cargando usuario"); }
  }, []);

  const handleLogin = () => {
    if (!formData.email) return alert("Escribe tu correo");
    const newUser = { 
      name: formData.name || "Usuario", 
      role: formData.role || "student" 
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('login');
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        
        {/* LOGIN */}
        {view === 'login' && (
          <motion.div key="L" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={styles.card}>
            <h2 style={{color:'#1B254B', margin:0}}>Iniciar Sesión</h2>
            <input 
              style={styles.input} placeholder="Email" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input type="password" style={styles.input} placeholder="Contraseña" />
            <button style={styles.btnPrimary} onClick={handleLogin}>Entrar</button>
            <p style={{fontSize:'12px', color:'#4318FF', cursor:'pointer'}} onClick={() => setView('register')}>¿No tienes cuenta? Regístrate</p>
          </motion.div>
        )}

        {/* REGISTRO */}
        {view === 'register' && (
          <motion.div key="R" initial={{opacity:0}} animate={{opacity:1}} style={styles.card}>
            <h2 style={{color:'#1B254B', margin:0}}>Registro</h2>
            <input 
              style={styles.input} placeholder="Tu nombre" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <select style={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="student">Estudiante</option>
              <option value="teacher">Profesor</option>
              <option value="parent">Padre</option>
              <option value="admin">Administrador</option>
            </select>
            <button style={styles.btnPrimary} onClick={() => setView('login')}>Volver</button>
          </motion.div>
        )}

        {/* DASHBOARD - Aquí estaba el error, ahora está protegido */}
        {view === 'dashboard' && user && (
          <motion.div key="D" initial={{opacity:0}} animate={{opacity:1}} style={{width:'400px', display:'flex', flexDirection:'column', gap:'20px'}}>
            <div style={{...styles.card, width:'100%', padding:'20px'}}>
              <h3 style={{color:'#1B254B', margin:0}}>Hola, {user?.name}</h3>
              {/* El ?. asegura que si user.role no existe todavía, no rompa la app */}
              <p style={{color:'#A3AED0', fontSize:'14px'}}>Rol: {user?.role?.toUpperCase() || 'ESTUDIANTE'}</p>
              <button style={{...styles.btnPrimary, backgroundColor:'#05CD99'}} onClick={() => setView('ticket')}>Nueva Tarea</button>
              <button style={{background:'none', border:'none', color:'#EE5D50', cursor:'pointer', marginTop:'10px'}} onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          </motion.div>
        )}

        {/* TICKET */}
        {view === 'ticket' && (
          <motion.div key="T" initial={{opacity:0}} animate={{opacity:1}} style={styles.card}>
            <h2 style={{color:'#1B254B', margin:0}}>Nueva Entrega</h2>
            <input 
              style={styles.input} placeholder="Título" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              style={{...styles.input, height:'100px'}} placeholder="Descripción..." 
              value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
            />
            <button style={{...styles.btnPrimary, backgroundColor:'#05CD99'}} onClick={() => alert("Enviado")}>Enviar</button>
            <button style={{...styles.btnPrimary, backgroundColor:'#2B3674'}} onClick={() => setView('dashboard')}>Cancelar</button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}