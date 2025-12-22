/**
 * 微信小程序配置
 */
export const wxConfig = {
  appId: process.env.WX_APP_ID || '',
  appSecret: process.env.WX_APP_SECRET || '',
}

/**
 * JWT 配置
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret',
  expiresIn: 7200, // 2小时
}

/**
 * MySQL 数据库配置
 */
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopping_mall',
  // 连接池配置
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
}
