import mysql from 'mysql2/promise'
import { dbConfig } from '../config'

/**
 * 数据库连接池
 */
const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: dbConfig.connectionLimit,
  waitForConnections: dbConfig.waitForConnections,
  queueLimit: dbConfig.queueLimit,
})

/**
 * 执行 SQL 查询
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params)
  return rows as T
}

/**
 * 获取单条记录
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * 插入记录并返回插入的 ID
 */
export async function insert(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, params) as any
  return result.insertId
}

/**
 * 更新记录并返回影响的行数
 */
export async function update(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, params) as any
  return result.affectedRows
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * 关闭连接池
 */
export async function closePool(): Promise<void> {
  await pool.end()
  console.log('Database pool closed')
}

export default pool
