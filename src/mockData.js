export const markets = [
  {
    id: 'market-1',
    name: 'Community Ground',
    area: 'Madhapur',
    address: 'Near Community Hall, Madhapur',
    openTime: '3:00 PM',
    closeTime: '10:00 PM',
    days: 'Daily',
    status: 'Open',
    vendorCount: 12,
    totalItems: 150,
    distance: '1.2 km',
  },
  {
    id: 'market-2',
    name: 'Yusufguda Market',
    area: 'Yusufguda',
    address: 'Behind City Plaza',
    openTime: '4:00 PM',
    closeTime: '9:30 PM',
    days: 'Mon-Sat',
    status: 'Open',
    vendorCount: 9,
    totalItems: 98,
    distance: '2.4 km',
  },
  {
    id: 'market-3',
    name: 'Banjara Hills Fresh Basket',
    area: 'Banjara Hills',
    address: 'Opposite Banjara Complex',
    openTime: '2:30 PM',
    closeTime: '9:00 PM',
    days: 'Daily',
    status: 'Closing Soon',
    vendorCount: 7,
    totalItems: 72,
    distance: '3.1 km',
  },
];

export const vendors = [
  {
    id: 'vendor-1',
    name: 'Fresh Harvest',
    marketId: 'market-1',
    rating: 4.8,
    specialty: 'Fresh vegetables',
    open: true,
    preferred: true,
    items: [
      { id: 'tomato', name: 'Tomato', unit: 'kg', price: 38, stock: 18, fresh: true },
      { id: 'potato', name: 'Potato', unit: 'kg', price: 32, stock: 26, fresh: true },
      { id: 'onion', name: 'Onion', unit: 'kg', price: 42, stock: 12, fresh: false },
      { id: 'green-chilli', name: 'Green Chilli', unit: 'kg', price: 75, stock: 8, fresh: true },
      { id: 'coriander', name: 'Coriander', unit: 'bunch', price: 20, stock: 30, fresh: true },
    ],
  },
  {
    id: 'vendor-2',
    name: 'Farm Basket',
    marketId: 'market-1',
    rating: 4.6,
    specialty: 'Organic greens',
    open: true,
    preferred: false,
    items: [
      { id: 'tomato', name: 'Tomato', unit: 'kg', price: 42, stock: 15, fresh: true },
      { id: 'potato', name: 'Potato', unit: 'kg', price: 30, stock: 20, fresh: false },
      { id: 'onion', name: 'Onion', unit: 'kg', price: 39, stock: 25, fresh: true },
      { id: 'spinach', name: 'Spinach', unit: 'bundle', price: 28, stock: 16, fresh: true },
      { id: 'cabbage', name: 'Cabbage', unit: 'kg', price: 35, stock: 19, fresh: false },
    ],
  },
  {
    id: 'vendor-3',
    name: 'Green Valley',
    marketId: 'market-1',
    rating: 4.9,
    specialty: 'Farm direct produce',
    open: true,
    preferred: true,
    items: [
      { id: 'tomato', name: 'Tomato', unit: 'kg', price: 36, stock: 21, fresh: true },
      { id: 'potato', name: 'Potato', unit: 'kg', price: 34, stock: 32, fresh: true },
      { id: 'onion', name: 'Onion', unit: 'kg', price: 44, stock: 10, fresh: true },
      { id: 'capsicum', name: 'Capsicum', unit: 'kg', price: 68, stock: 9, fresh: true },
      { id: 'coriander', name: 'Coriander', unit: 'bunch', price: 18, stock: 28, fresh: true },
    ],
  },
  {
    id: 'vendor-4',
    name: 'Local Roots',
    marketId: 'market-2',
    rating: 4.7,
    specialty: 'Daily vegetables',
    open: true,
    preferred: false,
    items: [
      { id: 'tomato', name: 'Tomato', unit: 'kg', price: 40, stock: 17, fresh: true },
      { id: 'potato', name: 'Potato', unit: 'kg', price: 31, stock: 22, fresh: true },
      { id: 'onion', name: 'Onion', unit: 'kg', price: 41, stock: 18, fresh: false },
      { id: 'carrot', name: 'Carrot', unit: 'kg', price: 48, stock: 11, fresh: true },
    ],
  },
  {
    id: 'vendor-5',
    name: 'Hari Veg Mart',
    marketId: 'market-3',
    rating: 4.5,
    specialty: 'Budget veggies',
    open: true,
    preferred: false,
    items: [
      { id: 'tomato', name: 'Tomato', unit: 'kg', price: 35, stock: 14, fresh: true },
      { id: 'potato', name: 'Potato', unit: 'kg', price: 29, stock: 30, fresh: true },
      { id: 'onion', name: 'Onion', unit: 'kg', price: 37, stock: 21, fresh: false },
      { id: 'brinjal', name: 'Brinjal', unit: 'kg', price: 52, stock: 7, fresh: true },
    ],
  },
];

export const customerOrders = [
  {
    id: '#1024',
    vendor: 'Fresh Harvest',
    items: 'Tomato, Potato, Onion',
    total: 230,
    status: 'Ready for Pickup',
    time: 'Today, 8:30 PM',
  },
  {
    id: '#1021',
    vendor: 'Green Valley',
    items: 'Coriander, Capsicum',
    total: 160,
    status: 'Preparing',
    time: 'Today, 7:45 PM',
  },
  {
    id: '#1018',
    vendor: 'Fresh Harvest',
    items: 'Tomato, Green Chilli',
    total: 190,
    status: 'Completed',
    time: 'Yesterday',
  },
];

export const notifications = [
  'Fresh Harvest accepted your order.',
  'Market closes in 30 minutes.',
  'Your preferred vendor is open today.',
  'New stock for tomatoes added by Green Valley.',
];

export const vendorInventory = [
  { id: 'inv-1', name: 'Tomato', price: 38, stock: 18, unit: 'kg', fresh: true, status: 'Available' },
  { id: 'inv-2', name: 'Potato', price: 32, stock: 26, unit: 'kg', fresh: true, status: 'Available' },
  { id: 'inv-3', name: 'Onion', price: 42, stock: 12, unit: 'kg', fresh: false, status: 'Low Stock' },
  { id: 'inv-4', name: 'Green Chilli', price: 75, stock: 8, unit: 'kg', fresh: true, status: 'Available' },
  { id: 'inv-5', name: 'Coriander', price: 20, stock: 30, unit: 'bunch', fresh: true, status: 'Available' },
];

export const vendorOrders = [
  { id: '#2010', customer: 'Ananya', items: 'Tomato 2kg + Onion 1kg', total: 180, status: 'Pending' },
  { id: '#2009', customer: 'Suresh', items: 'Potato 3kg', total: 96, status: 'Accepted' },
  { id: '#2008', customer: 'Naveen', items: 'Coriander 4 bunch', total: 80, status: 'Ready' },
  { id: '#2007', customer: 'Lakshmi', items: 'Green Chilli 1kg', total: 75, status: 'Completed' },
];

export const adminStats = {
  markets: 18,
  vendors: 142,
  customers: 2480,
  ordersToday: 382,
};

export const pendingApprovals = [
  { id: 'v-101', name: 'Srinivasa Vegs', status: 'Pending' },
  { id: 'v-102', name: 'Sai Greens', status: 'Pending' },
  { id: 'v-103', name: 'Ammu Market Basket', status: 'Review' },
];

export const marketHealth = [
  { name: 'Community Ground', open: true, orders: 64 },
  { name: 'Yusufguda Market', open: true, orders: 38 },
  { name: 'Banjara Hills Fresh Basket', open: false, orders: 21 },
];
