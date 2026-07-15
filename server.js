const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');
const categories = require('./categories');

const app = express();
const PORT = process.env.PORT || 3000;
const onReplit = !!process.env.REPL_ID;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!onReplit && !fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

let objectStorageClient = null;
function getObjectStorage() {
  if (!objectStorageClient) {
    const { Client } = require('@replit/object-storage');
    objectStorageClient = new Client();
  }
  return objectStorageClient;
}

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  }
});

// 包一层，把 async 路由里的异常转成 500，避免 Express 4 下请求卡死
function ah(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SAMPLE_DISHES = [
  { name: '番茄炒蛋', category: '菜菜', desc: '番茄2个・鸡蛋3个・葱花适量' },
  { name: '红烧排骨', category: '肉肉', desc: '排骨500g・姜片适量・冰糖少许' },
  { name: '清炒时蔬', category: '菜菜', desc: '时蔬适量・蒜末1勺・盐少许' },
  { name: '紫菜蛋花汤', category: '早餐', desc: '紫菜适量・鸡蛋1个・虾皮少许' },
  { name: '白米饭', category: '主食', desc: '大米适量・水（米水比例1:1.2）' }
];

// ---- 分类 ----

app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories });
});

// ---- 菜品 ----

app.get('/api/dishes', ah(async (req, res) => {
  const dishes = await db.getDishes(req.query.all === 'true');
  res.json({ success: true, dishes });
}));

app.post('/api/dishes', ah(async (req, res) => {
  const { id, name, category, desc, image } = req.body;
  const dishName = (name || '').trim();
  if (!dishName) {
    return res.status(400).json({ success: false, error: '菜名不能为空' });
  }
  const savedId = await db.saveDish({ id, name: dishName, category, desc, image });
  res.json({ success: true, id: savedId });
}));

app.post('/api/dishes/upload-image', upload.single('image'), ah(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '没有收到图片' });
  }
  const ext = path.extname(req.file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  if (onReplit) {
    const result = await getObjectStorage().uploadFromBytes(filename, req.file.buffer);
    if (!result.ok) {
      return res.status(500).json({
        success: false,
        error: '图片上传失败，请确认 Replit 项目里已经启用 Object Storage'
      });
    }
  } else {
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
  }

  res.json({ success: true, image: `/uploads/${filename}` });
}));

app.get('/uploads/:filename', ah(async (req, res) => {
  const { filename } = req.params;
  if (!/^[\w.-]+$/.test(filename)) {
    return res.status(400).end();
  }

  if (onReplit) {
    const result = await getObjectStorage().downloadAsBytes(filename);
    if (!result.ok) return res.status(404).end();
    res.set('Content-Type', MIME_BY_EXT[path.extname(filename).toLowerCase()] || 'application/octet-stream');
    return res.send(result.value[0]);
  }

  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.sendFile(filePath);
}));

app.delete('/api/dishes/:id', ah(async (req, res) => {
  await db.deleteDish(req.params.id);
  res.json({ success: true });
}));

app.post('/api/dishes/seed', ah(async (req, res) => {
  const seeded = await db.seedDishes(SAMPLE_DISHES);
  res.json({ success: true, seeded });
}));

// ---- 订单 ----

app.get('/api/orders', ah(async (req, res) => {
  res.json({ success: true, orders: await db.getOrders() });
}));

app.post('/api/orders', ah(async (req, res) => {
  const { items, note } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: '还没有选菜呢' });
  }
  const id = await db.createOrder({ items, note });
  res.json({ success: true, id });
}));

app.patch('/api/orders/:id', ah(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'done'].includes(status)) {
    return res.status(400).json({ success: false, error: '参数不对' });
  }
  await db.updateOrderStatus(req.params.id, status);
  res.json({ success: true });
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: '服务器出错了' });
});

app.listen(PORT, () => {
  console.log(`家庭点餐网站启动: http://localhost:${PORT}${onReplit ? '（Replit 模式：数据库 + Object Storage）' : '（本地模式：JSON 文件）'}`);
});
