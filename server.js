const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

console.log('------------------------------------------------');
console.log('🚀 Server Running: Admin Orders with 3D Bouncy Buttons');
console.log('✅ DB Connected Successfully!');
console.log('------------------------------------------------');

let users = [];

let products = [
  { _id: '1', name: 'Gaming Mouse Wireless RGB', price: 1290, description: 'เมาส์ไร้สายความเร็วสูง 16000 DPI', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60' },
  { _id: '2', name: 'Mechanical Keyboard RGB', price: 2590, description: 'คีย์บอร์ดแมคคานิคอล สวิตช์สัมผัสแม่นยำ', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60' },
  { _id: '3', name: 'Wireless Gaming Headset 7.1', price: 3490, description: 'หูฟังเกมมิ่งไร้สาย ระบบเสียง 7.1', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60' },
  { _id: '4', name: 'Curved Gaming Monitor 27"', price: 7900, description: 'จอมอนิเตอร์จอโค้ง 165Hz Response Time 1ms', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60' },
  { _id: '5', name: 'High-End Gaming Laptop 16"', price: 45900, description: 'โน้ตบุ๊กเกมมิ่ง Core i9, RTX 4070', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60' },
  { _id: '6', name: 'USB Studio Microphone', price: 2890, description: 'ไมโครโฟนสำหรับสตรีมมิ่ง เสียงระดับสตูดิโอ', imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60' },
  { _id: '7', name: 'Portable External SSD 1TB', price: 3290, description: 'เอ็กซ์เทอร์นัล SSD อ่านเขียนเร็ว 1050 MB/s', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60' },
  { _id: '8', name: 'Smartwatch Fitness Sport Pro', price: 4990, description: 'นาฬิกาอัจฉริยะ วัดหัวใจ มี GPS ในตัว', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: '9', name: 'Graphic Card RTX 4080 Super', price: 38500, description: 'การ์ดจอตัวแรงสำหรับการเล่นเกม 4K', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60' },
  { _id: '10', name: 'Ergonomic Gaming Chair', price: 5490, description: 'เก้าอี้เกมมิ่งเพื่อสุขภาพ ปรับ 180 องศา', imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&auto=format&fit=crop&q=60' }
];

let orders = [
  {
    _id: 'ORD-1001',
    customerName: 'Somchai Jaidee (Customer)',
    customerEmail: 'user@test.com',
    productName: 'Gaming Mouse Wireless RGB (x1)',
    totalPrice: 1290,
    status: 'ชำระเงินแล้ว (Paid)',
    orderDate: '03/11/2026 14:00'
  },
  {
    _id: 'ORD-1002',
    customerName: 'Manee Rakde (Customer)',
    customerEmail: 'manee@test.com',
    productName: 'Mechanical Keyboard RGB (x1)',
    totalPrice: 2590,
    status: 'รอการยืนยัน',
    orderDate: '03/11/2026 14:15'
  }
];

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { _id: Date.now().toString(), name, email, password: hashedPassword, role: role || 'Member', isVerified: true };
    users.push(newUser);
    res.json({ message: 'สมัครสมาชิกสำเร็จ! เข้าสู่ระบบได้ทันที' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, 'mysecretkey12345');
    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/orders', (req, res) => {
  const { customerName, customerEmail, items, totalPrice } = req.body;
  
  let productSummary = '';
  if (Array.isArray(items) && items.length > 0) {
    productSummary = items.map(i => `${i.name} (x${i.count})`).join(', ');
  } else {
    productSummary = req.body.productName || 'สินค้าไอที';
  }

  const newOrder = {
    _id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName: customerName || 'Customer Test',
    customerEmail: customerEmail || 'user@test.com',
    productName: productSummary,
    totalPrice: totalPrice || req.body.price || 0,
    status: 'รอการยืนยัน',
    orderDate: new Date().toLocaleString('th-TH')
  };

  orders.push(newOrder);
  console.log('🛒 ได้รับคำสั่งซื้อใหม่:', newOrder);
  res.json({ message: 'สั่งซื้อสำเร็จ!', order: newOrder });
});

// Admin กดเปลี่ยนสถานะ
app.post('/api/orders/:id/approve', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o._id === id);
  if (order) {
    order.status = 'ชำระเงินแล้ว (Paid)';
  }
  res.redirect('/api/orders');
});

// ตาราง Admin 3D Bouncy Table
app.get('/api/orders', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const tableRows = orders.map(o => {
      const priceText = (o.totalPrice || 0).toLocaleString();
      const isPaid = o.status && (o.status.includes('Paid') || o.status.includes('ชำระเงินแล้ว'));

      const actionButton = isPaid 
        ? '<span class="badge-paid">✅ ชำระเงินแล้ว</span>'
        : '<form action="/api/orders/' + o._id + '/approve" method="POST" style="margin:0;">' +
             '<button type="submit" class="btn-approve-3d">' +
               '👉 กดยืนยันชำระเงิน' +
             '</button>' +
           '</form>';

      return '<tr>' +
        '<td><strong>' + o._id + '</strong></td>' +
        '<td>' + o.customerName + '<br><small style="color:#7a4652">' + o.customerEmail + '</small></td>' +
        '<td>' + o.productName + '</td>' +
        '<td class="price">' + priceText + ' บาท</td>' +
        '<td>' + actionButton + '</td>' +
        '<td>' + o.orderDate + '</td>' +
        '</tr>';
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>Admin Order Management</title>
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&family=Prompt:wght@500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            background: radial-gradient(circle at 50% 20%, #fefcf9 0%, #f5efe6 70%, #eae2d5 100%);
            color: #4a101d;
            font-family: 'Kanit', sans-serif;
            padding: 2.5rem 1.5rem;
            margin: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 26px;
            padding: 2.5rem;
            box-shadow: 0 20px 45px rgba(74, 16, 29, 0.12), inset 0 1px 0 #ffffff;
            border: 1px solid rgba(132, 30, 51, 0.2);
          }
          .header { text-align: center; margin-bottom: 2rem; }
          h1 {
            font-family: 'Prompt', sans-serif;
            font-weight: 700;
            color: #841e33;
            font-size: 2.2rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(74,16,29,0.08);
          }
          p { color: #7a4652; font-size: 0.95rem; font-family: 'Kanit', sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; overflow: hidden; border-radius: 18px; box-shadow: 0 8px 20px rgba(74,16,29,0.05); }
          th, td { padding: 1.1rem 1rem; text-align: left; }
          th {
            background: linear-gradient(180deg, #841e33 0%, #631424 100%);
            color: #ffffff;
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          tr { border-bottom: 1px solid rgba(132, 30, 51, 0.1); transition: all 0.2s ease; }
          tr:hover { background-color: #fdfbf7; }
          td { font-family: 'Kanit', sans-serif; font-size: 0.95rem; }
          .price {
            font-family: 'Prompt', sans-serif;
            color: #841e33;
            font-weight: 800;
            font-size: 1.15rem;
          }

          /* 🟢 ปุ่มยืนยันชำระเงิน 3D Glossy Bouncy */
          .btn-approve-3d {
            background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important;
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            padding: 0.5rem 1.05rem !important;
            border-radius: 50px !important;
            font-family: 'Prompt', sans-serif !important;
            font-size: 0.88rem !important;
            font-weight: 700 !important;
            cursor: pointer;
            box-shadow: 
              0 4px 14px rgba(4, 120, 87, 0.35),
              inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2) !important;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
          }
          .btn-approve-3d:hover {
            transform: translateY(-3px) scale(1.06) !important;
            box-shadow: 
              0 8px 20px rgba(4, 120, 87, 0.48),
              inset 0 1.5px 0 rgba(255, 255, 255, 0.7) !important;
          }
          .btn-approve-3d:active {
            transform: translateY(1px) scale(0.96) !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important;
          }

          /* 🟢 ป้ายสถานะชำระเงินแล้ว 3D */
          .badge-paid {
            color: #065f46;
            background: linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%);
            border: 1.5px solid rgba(16, 185, 129, 0.35);
            padding: 0.45rem 1rem;
            border-radius: 50px;
            font-family: 'Prompt', sans-serif;
            font-weight: 700;
            font-size: 0.88rem;
            box-shadow: 0 4px 10px rgba(16, 185, 129, 0.15), inset 0 1px 0 #ffffff;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 รายการสั่งซื้อของลูกค้า (Admin Orders)</h1>
            <p>ระบบจัดการคำสั่งซื้อหลังบ้าน IT Store Project</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>เลขที่คำสั่งซื้อ</th>
                <th>ข้อมูลลูกค้า</th>
                <th>รายการสินค้าทั้งหมด</th>
                <th>ราคารวมทั้งสิ้น</th>
                <th>สถานะการชำระเงิน</th>
                <th>วัน-เวลาที่สั่งซื้อ</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    return res.send(htmlContent);
  }
  res.json(orders);
});

app.listen(5000, () => console.log('Backend running on port 5000'));