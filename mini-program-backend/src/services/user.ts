import { query, queryOne, insert, update } from '../db'
import type { User, CreateUserParams, UpdateUserParams } from '../types/user'
import { UserStatus, UserLevel } from '../types/user'

/**
 * 数据库记录转换为 User 对象
 */
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    phone: row.phone,
    openid: row.openid,
    unionid: row.unionid,
    nickname: row.nickname,
    avatar: row.avatar,
    realName: row.real_name,
    companyName: row.company_name,
    level: row.level,
    points: row.points,
    productLibraryId: row.product_library_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  }
}

/**
 * 用户服务
 */
export const userService = {
  /**
   * 根据手机号查找用户
   */
  async findByPhone(phone: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE phone = ?'
    const row = await queryOne(sql, [phone])
    return row ? mapRowToUser(row) : null
  },

  /**
   * 根据 openid 查找用户
   */
  async findByOpenid(openid: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE openid = ?'
    const row = await queryOne(sql, [openid])
    return row ? mapRowToUser(row) : null
  },

  /**
   * 根据 ID 查找用户
   */
  async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?'
    const row = await queryOne(sql, [id])
    return row ? mapRowToUser(row) : null
  },

  /**
   * 创建用户
   */
  async create(params: CreateUserParams): Promise<User> {
    const sql = `
      INSERT INTO users (phone, openid, unionid, nickname, avatar, real_name, company_name, level, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `
    const id = await insert(sql, [
      params.phone,
      params.openid || null,
      params.unionid || null,
      params.nickname || null,
      params.avatar || null,
      params.realName || null,
      params.companyName || null,
      params.level || UserLevel.LEVEL_1,
    ])

    console.log(`✅ 新用户创建成功: id=${id}, phone=${params.phone}`)
    
    return (await this.findById(id))!
  },

  /**
   * 根据手机号查找或创建用户
   * B2B 项目核心逻辑：手机号为唯一标识
   */
  async findOrCreateByPhone(phone: string, openid?: string): Promise<User> {
    // 1. 先通过手机号查找
    let user = await this.findByPhone(phone)
    
    if (user) {
      console.log(`👤 用户已存在: id=${user.id}, phone=${phone}`)
      
      // 用户已存在，更新 openid（如果提供且不同）
      if (openid && user.openid !== openid) {
        await this.updateOpenid(user.id, openid)
        user.openid = openid
        console.log(`🔄 更新用户 openid: id=${user.id}`)
      }
      // 更新最后登录时间
      await this.updateLastLogin(user.id)
      return user
    }

    // 2. 用户不存在，创建新用户
    console.log(`🆕 创建新用户: phone=${phone}, openid=${openid}`)
    user = await this.create({
      phone,
      openid,
      nickname: `用户${phone.slice(-4)}`,
    })

    return user
  },

  /**
   * 更新用户 openid
   */
  async updateOpenid(userId: number, openid: string): Promise<void> {
    const sql = 'UPDATE users SET openid = ? WHERE id = ?'
    await update(sql, [openid, userId])
  },

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(userId: number): Promise<void> {
    const sql = 'UPDATE users SET last_login_at = NOW() WHERE id = ?'
    await update(sql, [userId])
  },

  /**
   * 更新用户信息
   */
  async updateUser(userId: number, params: UpdateUserParams): Promise<User | null> {
    const fields: string[] = []
    const values: any[] = []

    if (params.nickname !== undefined) {
      fields.push('nickname = ?')
      values.push(params.nickname)
    }
    if (params.avatar !== undefined) {
      fields.push('avatar = ?')
      values.push(params.avatar)
    }
    if (params.realName !== undefined) {
      fields.push('real_name = ?')
      values.push(params.realName)
    }
    if (params.companyName !== undefined) {
      fields.push('company_name = ?')
      values.push(params.companyName)
    }
    if (params.level !== undefined) {
      fields.push('level = ?')
      values.push(params.level)
    }
    if (params.points !== undefined) {
      fields.push('points = ?')
      values.push(params.points)
    }
    if (params.status !== undefined) {
      fields.push('status = ?')
      values.push(params.status)
    }

    if (fields.length === 0) {
      return this.findById(userId)
    }

    values.push(userId)
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    await update(sql, values)

    return this.findById(userId)
  },

  /**
   * 检查用户状态
   */
  async checkUserStatus(userId: number): Promise<boolean> {
    const user = await this.findById(userId)
    return user?.status === UserStatus.ENABLED
  },

  /**
   * 更新用户积分
   */
  async updatePoints(userId: number, pointsDelta: number): Promise<number> {
    // 使用原子操作更新积分
    const sql = 'UPDATE users SET points = points + ? WHERE id = ? AND points + ? >= 0'
    const affected = await update(sql, [pointsDelta, userId, pointsDelta])
    
    if (affected === 0) {
      throw new Error('积分不足或用户不存在')
    }

    const user = await this.findById(userId)
    return user?.points ?? 0
  },
}
