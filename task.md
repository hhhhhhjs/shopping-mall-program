# 前后端商品上传/展示交互逻辑
## 前端：
1. 上传商品图片，需要支持批量上传商品图片，上传的时候前端需要将图片的高度，宽度，以及图片的文件都发送给后端
（这里在后台做，现在先不做，只是让你知道有这么一回事）
2. 前端通过 goods/list 接口拿到相关商品数据，这里后端返回的接口中需要有图片的 width, height 值
   以及宽高比；
3. 在商品展示页面 image 标签前端按照现在的处理逻辑正常处理显示图片（现在是宽度固定，高度按照宽高比压缩  的），所以宽度前端自适应处理即可，高度则直接按照后端返回的宽高比来进行适配即可
4. 瀑布流逻辑：前端拿到数据之后直接根据后端返回的相应商品对象中的 height 当作图片的高度即可，就不用专门来
   计算图片的高度了（因为 vue 是数据驱动视图，等到图片渲染之后前端才能拿到准确的宽高），所以这里的 瀑布流左右 list 高度直接使用后端给的相应的 height 进行相加即可；
   并且不要计算卡片中的商品介绍以及价格高度（因为这里前端做了限制，介绍以及价格的区域限制死了）
   所以直接通过每一列中有哪些商品，直接比对相关商品累加的 height 值即可；
   哪一列的 height 累加值少，则将下一个商品插入哪一列中，这样可精准插入
5. 前端还需要做图片懒加载，lazy-load 一行配置的事情（现在我不确定做没做，如果做了保留，如果没做做一下）



## 后端：
1. 编写商品上传接口，需要支持批量上传
2. 后端拿到前端传递过来的图片，拿到图片的 宽高，以及图片源文件，然后需要做相关处理：
    2.1：传递过来的图片进行定宽（450px），高度随原图比例自动缩放；
    这里是示例代码，供参考（主要参考核心代码）：

import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import multer from '@koa/multer';
import serve from 'koa-static';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// --- 配置常量 ---
const PORT = 3000;
// 原始图片上传目录
const UPLOAD_DIR = path.join(__dirname, '../uploads/temp');
// 处理后图片存放目录
const THUMB_DIR = path.join(__dirname, '../uploads/thumbs');

// --- 初始化工具函数：确保目录存在 ---
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// 启动时检查目录
ensureDir(UPLOAD_DIR);
ensureDir(THUMB_DIR);

// --- 初始化 Koa 应用 ---
const app = new Koa();
const router = new Router();

// --- 中间件配置 ---
// 1. 跨域支持
app.use(cors());

// 2. 静态资源托管 (让我们能通过 URL 访问处理后的图片)
// 访问 http://localhost:3000/thumbs/xxx.jpg
app.use(serve(path.join(__dirname, '../uploads')));

// 3. Multer 上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，防止覆盖：时间戳-随机数.后缀
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// --- 路由定义 ---

/**
 * POST /api/upload
 * 接收字段名为 "file" 的文件
 */
router.post('/api/upload', upload.single('file'), async (ctx) => {
  // 检查是否有文件上传
  if (!ctx.file) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请上传图片文件' };
    return;
  }

  const originalFilePath = ctx.file.path;
  const filename = ctx.file.filename;
  
  // 构造输出文件的路径
  // 注意：这里我们强制转为 jpg，或者你可以保留原后缀
  const outputFilename = `thumb_${filename.replace(/\.[^/.]+$/, "")}.jpg`;
  const outputFilePath = path.join(THUMB_DIR, outputFilename);

  try {
    // ==========================================
    // 核心代码：Sharp 处理 (对应你的 Java 需求)
    // ==========================================
    await sharp(originalFilePath)
      // 1. 对应 .width(450)
      // 高度不传，sharp 默认保持宽高比 (keepAspectRatio)
      .resize({ width: 450 }) 
      
      // 2. 对应 .outputQuality(0.8)
      // sharp 使用 1-100 的整数，所以 0.8 * 100 = 80
      .jpeg({ quality: 80 }) 
      
      // 3. 对应 .toFile(thumbFile)
      .toFile(outputFilePath);

    // (可选) 这里的逻辑是保留原图。
    // 如果你想处理完删除原图，取消下面这行的注释：
    // fs.unlinkSync(originalFilePath);

    // 返回成功响应
    ctx.body = {
      code: 200,
      message: '处理成功',
      data: {
        // 返回前端可以直接访问的图片地址
        // 假设 koa-static 托管了 uploads 目录，那么 thumbs 在根目录下
        url: `http://localhost:${PORT}/thumbs/${outputFilename}`,
        originalFile: filename,
        width: 450,
        quality: 0.8
      }
    };

  } catch (error) {
    console.error('Image processing failed:', error);
    
    // 如果处理失败，尝试清理上传的临时文件
    if (fs.existsSync(originalFilePath)) {
      fs.unlinkSync(originalFilePath);
    }

    ctx.status = 500;
    ctx.body = { code: 500, message: '图片处理失败', error: String(error) };
  }
});

// --- 注册路由并启动 ---
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Upload API: POST http://localhost:${PORT}/api/upload`);
});

上述后端代码完成图片压缩工作；

3. 将处理好的图片，分配特定图片 id 以及 图片名（图片名按照 image_[图片 id 来命名]，直接存放在后端 static/image 文件夹下即可），并且计算宽高比；并且将处理完毕的宽 高，以及宽高比；图片的 url 都需要存放到数据库中；


4. 增强 goods/list 接口功能；在相关商品返回的数据中增加 相关商品的 width , height ,以及宽高比


注意：因为现在后台还没有开发，所以后端先预留数据库相关字段以及接口处理逻辑即可，现在前端还不会调用上传图片接口




