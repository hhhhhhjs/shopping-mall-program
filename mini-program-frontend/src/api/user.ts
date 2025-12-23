import { http } from '@/http/http'
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils'

/**
 * 更新用户资料参数
 */
export interface IUpdateProfileParams {
  nickname?: string
  avatar?: string
  realName?: string
  companyName?: string
}

/**
 * 更新用户资料
 * @param data 用户资料
 */
export function updateUserProfile(data: IUpdateProfileParams) {
  return http.put<{
    id: number
    phone: string
    nickname: string
    avatar: string
    realName: string
    companyName: string
    level: number
    points: number
  }>('/user/info', data)
}

/**
 * 上传头像响应
 */
export interface IUploadAvatarRes {
  avatar: string
  user: {
    id: number
    nickname: string
    avatar: string
  } | null
}

/**
 * 上传用户头像
 * @param filePath 本地文件路径
 */
export function uploadAvatar(filePath: string): Promise<IUploadAvatarRes> {
  return new Promise((resolve, reject) => {
    const tokenStore = useTokenStore()
    const token = tokenStore.validToken
    const baseUrl = getEnvBaseUrl()

    uni.uploadFile({
      url: `${baseUrl}/user/avatar`,
      filePath,
      name: 'avatar',
      header: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data as IUploadAvatarRes)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        console.error('上传文件失败:', err)
        reject(new Error('上传文件失败'))
      },
    })
  })
}
