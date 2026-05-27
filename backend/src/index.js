const express  = require('express');
const cors     = require('cors');
const { createClient } = require('redis');
const { pool, initDB } = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Redis client (optional — app works without it)
let redisClient = null;
(async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });
    redisClient.on('error', () => { redisClient = null; });
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch {
    console.log('⚠️  Redis not available — running without cache');
    redisClient = null;
  }
})();

// Make redis available to routes
app.use((req, _res, next) => { req.redis = redisClient; next(); });

// Routes
app.use('/api/tasks',     require('./routes/tasks'));
app.use('/api/employees', require('./routes/employees'));

// Health check — used by Kubernetes liveness & readiness probes
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', db: 'connected', timestamp: new Date() });
  } catch {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
  }
});

// Stats endpoint for dashboard
app.get('/api/stats', async (_req, res) => {
  try {
    const cacheKey = 'stats';
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }

    const [tasks, employees, byStatus, byPriority] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tasks'),
      pool.query('SELECT COUNT(*) FROM employees'),
      pool.query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status'),
      pool.query('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority'),
    ]);

    const stats = {
      totalTasks:      parseInt(tasks.rows[0].count),
      totalEmployees:  parseInt(employees.rows[0].count),
      byStatus:        Object.fromEntries(byStatus.rows.map(r => [r.status, parseInt(r.count)])),
      byPriority:      Object.fromEntries(byPriority.rows.map(r => [r.priority, parseInt(r.count)])),
    };

    if (redisClient) await redisClient.setEx(cacheKey, 30, JSON.stringify(stats));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server with retry logic (waits for PostgreSQL to be ready)
async function start(retries = 10, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`🔄 Connecting to database... (attempt ${i}/${retries})`);
      await initDB();
      app.listen(PORT, () => console.log(`🚀 WorkTrack API running on port ${PORT}`));
      return;
    } catch (err) {
      console.error(`❌ DB connection failed: ${err.message}`);
      if (i === retries) { console.error('💀 Max retries reached. Exiting.'); process.exit(1); }
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
start();
