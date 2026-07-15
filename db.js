const path = require('path');
const fs = require('fs');

const onReplit = !!process.env.REPL_ID;

const dataDir = path.join(__dirname, 'data');
if (!onReplit && !fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dishesFile = path.join(dataDir, 'dishes.json');
const ordersFile = path.join(dataDir, 'orders.json');

let replitDbClient = null;
function getReplitDb() {
  if (!replitDbClient) {
    const Client = require('@replit/database');
    replitDbClient = new Client();
  }
  return replitDbClient;
}

async function loadCollection(replitKey, file) {
  if (onReplit) {
    const res = await getReplitDb().get(replitKey);
    return res.ok && res.value ? res.value : [];
  }
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function saveCollection(replitKey, file, rows) {
  if (onReplit) {
    await getReplitDb().set(replitKey, rows);
    return;
  }
  fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

const loadDishes = () => loadCollection('dishes', dishesFile);
const saveDishes = (rows) => saveCollection('dishes', dishesFile, rows);
const loadOrders = () => loadCollection('orders', ordersFile);
const saveOrders = (rows) => saveCollection('orders', ordersFile, rows);

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

module.exports = {
  async getDishes(includeUnavailable) {
    const dishes = await loadDishes();
    const filtered = includeUnavailable ? dishes : dishes.filter((d) => d.available);
    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async saveDish({ id, name, category, desc, image }) {
    const dishes = await loadDishes();
    if (id) {
      const dish = dishes.find((d) => d.id === Number(id));
      if (dish) {
        dish.name = name;
        dish.category = category || '';
        dish.desc = desc || '';
        if (image) dish.image = image;
      }
      await saveDishes(dishes);
      return id;
    }
    const newDish = {
      id: nextId(dishes),
      name,
      category: category || '',
      desc: desc || '',
      image: image || '',
      available: true,
      created_at: new Date().toISOString()
    };
    dishes.push(newDish);
    await saveDishes(dishes);
    return newDish.id;
  },

  async deleteDish(id) {
    const dishes = await loadDishes();
    const dish = dishes.find((d) => d.id === Number(id));
    if (dish) dish.available = false;
    await saveDishes(dishes);
  },

  async seedDishes(sampleDishes) {
    const dishes = await loadDishes();
    if (dishes.length > 0) return 0;
    sampleDishes.forEach((d) => {
      dishes.push({
        id: nextId(dishes),
        name: d.name,
        category: d.category,
        desc: d.desc || '',
        image: '',
        available: true,
        created_at: new Date().toISOString()
      });
    });
    await saveDishes(dishes);
    return sampleDishes.length;
  },

  async getOrders() {
    const orders = await loadOrders();
    return orders.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
  },

  async createOrder({ items, note }) {
    const orders = await loadOrders();
    const newOrder = {
      id: nextId(orders),
      items,
      note: note || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    await saveOrders(orders);
    return newOrder.id;
  },

  async updateOrderStatus(id, status) {
    const orders = await loadOrders();
    const order = orders.find((o) => o.id === Number(id));
    if (order) order.status = status;
    await saveOrders(orders);
  }
};
