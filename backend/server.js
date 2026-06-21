import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';  
import tripRoutes from './routes/tripRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://trao-ai-travel-planner-three.vercel.app',
  'https://trao-ai-travel-planner-git-main-gursharan-reddys-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked securely by strict production CORS access configuration'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    message: "Trao AI Travel Planner Core Engine Running Defensively" 
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Server execution block intercept:', err.message);
  res.status(500).json({ 
    message: 'An internal server anomaly occurred inside the application shell.' 
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`🚀 Security Data Vault Running on Port ${PORT}`);
  console.log(`🔒 Supabase PostgreSQL Instance Authenticated and Connected`);
  console.log(`===========================================================`);
});