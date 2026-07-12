const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');
const categories = require('./categories');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  }
});

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

app.get('/api/dishes', (req, res) => {
  const dishes = db.getDishes(req.query.all === 'true');
  res.json({ success: true, dishes });
});

app.post('/api/dishes', (req, res) => {
  const { id, name, category, desc, image } = req.body;
  const dishName = (name || '').trim();
  if (!dishName) {
    return res.status(400).json({ success: false, error: '菜名不能为空' });
  }
  const savedId = db.saveDish({ id, name: dishName, category, desc, image });
  res.json({ success: true, id: savedId });
});

app.post('/api/dishes/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '没有收到图片' });
  }
  res.json({ success: true, image: `/uploads/${req.file.filename}` });
});

app.delete('/api/dishes/:id', (req, res) => {
  db.deleteDish(req.params.id);
  res.json({ success: true });
});

app.post('/api/dishes/seed', (req, res) => {
  const seeded = db.seedDishes(SAMPLE_DISHES);
  res.json({ success: true, seeded });
});

// ---- 订单 ----

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: db.getOrders() });
});

app.post('/api/orders', (req, res) => {
  const { items, note } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: '还没有选菜呢' });
  }
  const id = db.createOrder({ items, note });
  res.json({ success: true, id });
});

app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  if (!['pending', 'done'].includes(status)) {
    return res.status(400).json({ success: false, error: '参数不对' });
  }
  db.updateOrderStatus(req.params.id, status);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`家庭点餐网站启动: http://localhost:${PORT}`);
});
