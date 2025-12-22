import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config'

/**
 * Token 载荷类型
 */
export interface TokenPayload {
  openid: string
  phoneNumber: string
  [key: string]: any
}

/**
 * 生成 JWT Token
 * @param payload Token 载荷
 * @returns JWT Token 字符串
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  })
}

/**
 * 验证 JWT Token
 * @param token JWT Token 字符串
 * @returns 解码后的载荷，验证失败返回 null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Token 验证失败:', error)
    return null
  }
}

/**
 * 解析 Token（不验证签名）
 * @param token JWT Token 字符串
 * @returns 解码后的载荷
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch (error) {
    return null
  }
}
