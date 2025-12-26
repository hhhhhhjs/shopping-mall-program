import path from 'path'

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

/**
 * 静态文件配置
 */
export const staticConfig = {
  // 静态文件根目录
  root: path.resolve(__dirname, '../../static'),
  // 静态文件访问基础URL（用于拼接完整URL存入数据库）
  baseUrl: process.env.STATIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}/static`,
  // 上传文件配置
  upload: {
    // 头像上传目录
    avatarDir: 'uploads/avatars',
    // 商品图片上传目录
    goodsImageDir: 'images',
    // 商品图片临时目录
    tempDir: 'uploads/temp',
    // 头像最大大小 2MB
    maxSize: 2 * 1024 * 1024,
    // 商品图片最大大小 10MB
    goodsImageMaxSize: 10 * 1024 * 1024,
    // 允许的图片类型
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  // 图片处理配置
  imageProcess: {
    // 商品图片固定宽度
    goodsImageWidth: 450,
    // JPEG 压缩质量 (1-100)
    jpegQuality: 80,
  },
}
