const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'worktrack',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name      VARCHAR(100) NOT NULL,
      email     VARCHAR(100) UNIQUE NOT NULL,
      role      VARCHAR(100) NOT NULL,
      avatar    VARCHAR(10)  NOT NULL DEFAULT '👤',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(200) NOT NULL,
      description TEXT,
      status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in-progress','completed')),
      priority    VARCHAR(10)  NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high')),
      employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
      due_date    DATE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed employees if empty
  const { rowCount } = await pool.query('SELECT 1 FROM employees LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO employees (name, email, role, avatar) VALUES
        ('Rahul Sharma',  'rahul@worktrack.io',  'Backend Developer',   '👨‍💻'),
        ('Priya Patel',   'priya@worktrack.io',  'Frontend Developer',  '👩‍💻'),
        ('Amit Kumar',    'amit@worktrack.io',   'DevOps Engineer',     '🧑‍🔧'),
        ('Sneha Reddy',   'sneha@worktrack.io',  'UI/UX Designer',      '👩‍🎨'),
        ('Vikram Singh',  'vikram@worktrack.io', 'Product Manager',     '👨‍💼');
    `);

    await pool.query(`
      INSERT INTO tasks (title, description, status, priority, employee_id, due_date)
      SELECT
        t.title, t.description, t.status, t.priority,
        (SELECT id FROM employees WHERE email = t.email), t.due_date
      FROM (VALUES
        ('Setup Kubernetes Cluster',    'Deploy production K8s cluster on AWS EKS',        'completed',  'high',   'amit@worktrack.io',   '2024-12-01'),
        ('Build REST API',              'Create Node.js Express API with PostgreSQL',       'in-progress','high',   'rahul@worktrack.io',  '2024-12-15'),
        ('Design Dashboard UI',         'Create responsive React dashboard with charts',   'in-progress','medium', 'priya@worktrack.io',  '2024-12-20'),
        ('Write Unit Tests',            'Add Jest tests for all API endpoints',             'pending',    'medium', 'rahul@worktrack.io',  '2024-12-25'),
        ('Configure CI/CD Pipeline',    'Setup GitHub Actions for auto deployment',         'pending',    'high',   'amit@worktrack.io',   '2024-12-18'),
        ('Create Wireframes',           'Design wireframes for mobile app screens',         'completed',  'low',    'sneha@worktrack.io',  '2024-11-30'),
        ('Define Product Roadmap',      'Plan Q1 2025 feature releases',                   'in-progress','high',   'vikram@worktrack.io', '2024-12-10'),
        ('Implement Redis Caching',     'Add Redis cache layer for API responses',          'pending',    'medium', 'rahul@worktrack.io',  '2024-12-28'),
        ('Setup Monitoring',            'Configure Prometheus and Grafana dashboards',      'pending',    'high',   'amit@worktrack.io',   '2024-12-22'),
        ('Code Review Process',         'Establish PR review guidelines and checklist',     'completed',  'low',    'vikram@worktrack.io', '2024-11-25')
      ) AS t(title, description, status, priority, email, due_date);
    `);
  }

  console.log('✅ Database initialized');
}

module.exports = { pool, initDB };
