const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dishesFile = path.join(dataDir, 'dishes.json');
const ordersFile = path.join(dataDir, 'orders.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

module.exports = {
  getDishes(includeUnavailable) {
    const dishes = readJSON(dishesFile);
    const filtered = includeUnavailable ? dishes : dishes.filter((d) => d.available);
    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  saveDish({ id, name, category, desc, image }) {
    const dishes = readJSON(dishesFile);
    if (id) {
      const dish = dishes.find((d) => d.id === Number(id));
      if (dish) {
        dish.name = name;
        dish.category = category || '';
        dish.desc = desc || '';
        if (image) dish.image = image;
      }
      writeJSON(dishesFile, dishes);
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
    writeJSON(dishesFile, dishes);
    return newDish.id;
  },

  deleteDish(id) {
    const dishes = readJSON(dishesFile);
    const dish = dishes.find((d) => d.id === Number(id));
    if (dish) dish.available = false;
    writeJSON(dishesFile, dishes);
  },

  seedDishes(sampleDishes) {
    const dishes = readJSON(dishesFile);
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
    writeJSON(dishesFile, dishes);
    return sampleDishes.length;
  },

  getOrders() {
    const orders = readJSON(ordersFile);
    return orders.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
  },

  createOrder({ items, note }) {
    const orders = readJSON(ordersFile);
    const newOrder = {
      id: nextId(orders),
      items,
      note: note || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    writeJSON(ordersFile, orders);
    return newOrder.id;
  },

  updateOrderStatus(id, status) {
    const orders = readJSON(ordersFile);
    const order = orders.find((o) => o.id === Number(id));
    if (order) order.status = status;
    writeJSON(ordersFile, orders);
  }
};
