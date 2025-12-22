/**
 * 微信小程序配置
 */
export const wxConfig = {
  appId: process.env.WX_APP_ID || 'wx6e0172aae05f1d38',
  appSecret: process.env.WX_APP_SECRET || '3d6ede6f5e596659af532e7bc6aa3e4f',
}

/**
 * JWT 配置
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  expiresIn: 7200, // 2小时
}
