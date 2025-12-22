/**
 * 用户状态枚举
 */
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 用户等级枚举 (1-4级，不同等级对应不同价格)
 */
export enum UserLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
}

/**
 * 用户实体
 */
export interface User {
  id: number
  phone: string
  openid: string | null
  unionid: string | null
  nickname: string | null
  avatar: string | null
  realName: string | null
  companyName: string | null
  level: UserLevel
  points: number
  productLibraryId: number | null
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

/**
 * 创建用户参数
 */
export interface CreateUserParams {
  phone: string
  openid?: string
  unionid?: string
  nickname?: string
  avatar?: string
  realName?: string
  companyName?: string
  level?: UserLevel
}

/**
 * 更新用户参数
 */
export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  realName?: string
  companyName?: string
  level?: UserLevel
  points?: number
  status?: UserStatus
}

/**
 * 用户收货地址
 */
export interface UserAddress {
  id: number
  userId: number
  contactName: string
  contactPhone: string
  province: string | null
  city: string | null
  district: string | null
  address: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 积分记录类型
 */
export enum PointsRecordType {
  CONSUME_EARN = 1, // 消费获得
  EXCHANGE = 2,     // 积分兑换
  ADMIN_ADJUST = 3, // 后台调整
  REFUND = 4,       // 退款返还
}

/**
 * 积分记录
 */
export interface PointsRecord {
  id: number
  userId: number
  points: number
  balance: number
  type: PointsRecordType
  orderId: number | null
  remark: string | null
  createdAt: Date
}
