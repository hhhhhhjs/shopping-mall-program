import { wxConfig } from '../config'

const WX_API_BASE = 'https://api.weixin.qq.com'

// 缓存 access_token
let accessTokenCache: { token: string; expiresAt: number } | null = null

/**
 * 微信 API 响应基础类型
 */
interface WxBaseResponse {
  errcode?: number
  errmsg?: string
}

/**
 * code2Session 响应
 */
interface Code2SessionResponse extends WxBaseResponse {
  openid?: string
  session_key?: string
  unionid?: string
}

/**
 * getPhoneNumber 响应
 */
interface GetPhoneNumberResponse extends WxBaseResponse {
  phone_info?: {
    phoneNumber: string
    purePhoneNumber: string
    countryCode: string
    watermark: {
      timestamp: number
      appid: string
    }
  }
}

/**
 * access_token 响应
 */
interface AccessTokenResponse extends WxBaseResponse {
  access_token?: string
  expires_in?: number
}

/**
 * 微信服务
 */
export const wxService = {
  /**
   * 获取 access_token
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存
    if (accessTokenCache && Date.now() < accessTokenCache.expiresAt) {
      return accessTokenCache.token
    }

    const url = `${WX_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${wxConfig.appId}&secret=${wxConfig.appSecret}`

    const response = await fetch(url)
    const data = (await response.json()) as AccessTokenResponse

    if (data.errcode) {
      throw new Error(`获取 access_token 失败: ${data.errmsg}`)
    }

    if (!data.access_token) {
      throw new Error('获取 access_token 失败: 响应无效')
    }

    // 缓存 token，提前 5 分钟过期
    accessTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in! - 300) * 1000,
    }

    return data.access_token
  },

  /**
   * 通过 code 获取 session_key 和 openid
   * @param code 小程序登录时获取的 code
   */
  async code2Session(code: string): Promise<Code2SessionResponse> {
    const url = `${WX_API_BASE}/sns/jscode2session?appid=${wxConfig.appId}&secret=${wxConfig.appSecret}&js_code=${code}&grant_type=authorization_code`

    const response = await fetch(url)
    const data = (await response.json()) as Code2SessionResponse

    return data
  },

  /**
   * 获取用户手机号
   * @param phoneCode 手机号授权返回的 code
   */
  async getPhoneNumber(phoneCode: string): Promise<GetPhoneNumberResponse> {
    const accessToken = await this.getAccessToken()
    const url = `${WX_API_BASE}/wxa/business/getuserphonenumber?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: phoneCode }),
    })

    const data = (await response.json()) as GetPhoneNumberResponse

    return data
  },
}
