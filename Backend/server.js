// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/microClassroom');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student', 'parent'], default: 'student' }
});

const TicketSchema = new mongoose.Schema({
  title: String,
  desc: String,
  userId: String,
  type: String, // 'task', 'support', 'purchase'
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);

// Middleware RBAC mejorado
const auth = (roles = []) => (req, res, next) => {
  const token = req.cookies.token; // Uso de cookies para seguridad
  if (!token) return res.status(401).send('No autenticado');

  jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
    if (err || (roles.length && !roles.includes(decoded.role))) {
      return res.status(403).send('Sin permisos');
    }
    req.user = decoded;
    next();
  });
};

// Endpoints
app.post('/auth/register', async (req, res) => {
  const { email, password, role, name } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ message: "Usuario creado" });
  } catch (e) { res.status(400).send("Error en registro"); }
});

app.post('/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, 'SECRET_KEY');
    res.cookie('token', token, { httpOnly: true }).json({ role: user.role, name: user.name });
  } else {
    res.status(400).send('Credenciales inválidas');
  }
});

app.post('/tickets', auth(), async (req, res) => {
  const ticket = await Ticket.create({ ...req.body, userId: req.user.id });
  res.json(ticket);
});

app.listen(5000);
const PORT = 5000;
app.listen(PORT, () => {
  console.log('==============================================');
  console.log(`🚀 SERVIDOR EJECUTÁNDOSE EN: http://localhost:${PORT}`);
  console.log(`📅 ESTADO: Conectando a MongoDB...`);
  console.log('==============================================');
});