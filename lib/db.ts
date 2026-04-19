import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '20091',
  database: 'visitrack_next',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(sql: string, params?: (string | number | boolean | null)[]) {
  const [rows] = await pool.execute(sql, params || [])
  return rows
}

export default pool