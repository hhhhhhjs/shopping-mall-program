/**
 * 图片处理服务
 * 负责商品图片的压缩、存储和管理
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { staticConfig } from '../config'
import type { ImageUploadResult } from '../types/goods'

// 确保目录存在
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 创建目录: ${dir}`)
  }
}

// 初始化目录
const imagesDir = path.join(staticConfig.root, staticConfig.upload.goodsImageDir)
const tempDir = path.join(staticConfig.root, staticConfig.upload.tempDir)
ensureDir(imagesDir)
ensureDir(tempDir)

/**
 * 生成唯一的图片ID
 */
function generateImageId(): string {
  const timestamp = Date.now()
  const random = Math.round(Math.random() * 1e9)
  return `${timestamp}-${random}`
}

/**
 * 处理并保存商品图片
 * - 定宽450px，高度按比例缩放
 * - 压缩为JPEG格式，质量80%
 * - 返回处理后的图片信息
 */
export async function processAndSaveImage(
  inputBuffer: Buffer,
  originalName: string,
  providedWidth?: number,
  providedHeight?: number
): Promise<ImageUploadResult> {
  const imageId = generateImageId()
  const outputFilename = `image_${imageId}.jpg`
  const outputPath = path.join(imagesDir, outputFilename)

  const { goodsImageWidth, jpegQuality } = staticConfig.imageProcess

  try {
    // 获取原始图片信息
    const metadata = await sharp(inputBuffer).metadata()
    const originalWidth = providedWidth || metadata.width || 0
    const originalHeight = providedHeight || metadata.height || 0

    if (!originalWidth || !originalHeight) {
      throw new Error('无法获取图片尺寸信息')
    }

    // 计算缩放后的高度（保持宽高比）
    const scaledHeight = Math.round((goodsImageWidth / originalWidth) * originalHeight)
    const aspectRatio = Number((goodsImageWidth / scaledHeight).toFixed(4))

    // 处理图片：定宽、压缩
    await sharp(inputBuffer)
      .resize({ width: goodsImageWidth })
      .jpeg({ quality: jpegQuality })
      .toFile(outputPath)

    // 构造访问URL
    const url = `${staticConfig.baseUrl}/${staticConfig.upload.goodsImageDir}/${outputFilename}`

    console.log(`📸 图片处理完成: ${originalName} -> ${outputFilename}`)
    console.log(`   尺寸: ${originalWidth}x${originalHeight} -> ${goodsImageWidth}x${scaledHeight}`)
    console.log(`   宽高比: ${aspectRatio}`)

    return {
      url,
      width: goodsImageWidth,
      height: scaledHeight,
      aspectRatio,
      originalName,
    }
  } catch (error) {
    console.error('图片处理失败:', error)
    throw new Error(`图片处理失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 批量处理商品图片
 */
export async function processBatchImages(
  images: Array<{
    buffer: Buffer
    originalName: string
    width?: number
    height?: number
  }>
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = []

  for (const image of images) {
    const result = await processAndSaveImage(
      image.buffer,
      image.originalName,
      image.width,
      image.height
    )
    results.push(result)
  }

  return results
}

/**
 * 删除商品图片
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // 从URL中提取文件名
    const filename = imageUrl.split('/').pop()
    if (!filename) {
      return false
    }

    const filePath = path.join(imagesDir, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`🗑️ 删除图片: ${filename}`)
      return true
    }
    return false
  } catch (error) {
    console.error('删除图片失败:', error)
    return false
  }
}

/**
 * 获取图片信息（从文件）
 */
export async function getImageInfo(imagePath: string): Promise<{
  width: number
  height: number
  aspectRatio: number
} | null> {
  try {
    const metadata = await sharp(imagePath).metadata()
    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: Number((metadata.width / metadata.height).toFixed(4)),
      }
    }
    return null
  } catch (error) {
    console.error('获取图片信息失败:', error)
    return null
  }
}
