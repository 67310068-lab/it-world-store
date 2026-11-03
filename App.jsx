import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState('store');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', role: 'Member' });

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id 
            ? { ...item, count: Math.min(100, item.count + 1) } 
            : item
        );
      }
      return [...prevCart, { ...product, count: 1 }];
    });
    alert(`🛒 เพิ่ม "${product.name}" ลงตะกร้าเรียบร้อย!`);
  };

  const handleQuantityChange = (id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 100) qty = 100;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === id ? { ...item, count: qty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.count, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าลงตะกร้าก่อนสั่งซื้อ');
      return;
    }

    const customerName = user ? `${user.name} (${user.role})` : 'ลูกค้าทั่วไป (Customer)';
    const customerEmail = user ? user.email : 'customer@test.com';

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          items: cart,
          totalPrice
        })
      });

      if (res.ok) {
        alert(`🎉 สั่งซื้อสำเร็จ! ราคารวมทั้งสิ้น ${totalPrice.toLocaleString()} บาท\nรายการถูกบันทึกไปหน้า Admin เรียบร้อยแล้ว`);
        setCart([]);
        setPage('store');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setPage('store');
    alert('ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setPage('store');
        alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${data.user.name}`);
      } else {
        alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setPage('login');
      } else {
        alert(data.message || 'สมัครสมาชิกไม่สำเร็จ');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div>
      {/* Navbar 3D Bouncy */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setPage('store')}>
          🏛️ IT World Co., Ltd.
        </div>

        <div className="nav-menu">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setPage('store'); }}>
            หน้าหลัก
          </a>

          <button className="nav-cart-btn" onClick={() => setPage('cart')}>
            🛒 ตะกร้า ({totalItemsCount})
          </button>

          {user ? (
            <>
              <div className="user-badge">
                👋 สวัสดี, <strong>{user.name} [{user.role}]</strong>
              </div>

              {user.role === 'Admin' && (
                <a 
                  href="http://localhost:5000/api/orders" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="nav-link"
                  style={{ color: '#841e33', fontWeight: 'bold' }}
                >
                  ⚙️ จัดการหลังบ้าน
                </a>
              )}

              <button className="nav-logout-btn" onClick={handleLogout}>
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setPage('login'); }}>
                เข้าสู่ระบบ
              </a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setPage('register'); }}>
                สมัครสมาชิก
              </a>
            </>
          )}
        </div>
      </nav>

      {/* หน้าแสดงสินค้า */}
      {page === 'store' && (
        <>
          <div className="hero">
            <h1>IT World Co., Ltd.</h1>
            <p>ศูนย์รวมอุปกรณ์ IT ฮาร์ดแวร์ และเกมมิ่งเกียร์ระดับพรีเมียม</p>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#4a101d', fontFamily: 'Prompt' }}>
              รายการสินค้าไอที
            </h2>
            <div className="product-grid">
              {products.map((p) => (
                <div className="card" key={p._id}>
                  <img src={p.imageUrl} alt={p.name} />
                  <div className="card-body">
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <div className="price">{p.price.toLocaleString()} บาท</div>
                    <button onClick={() => addToCart(p)}>
                      ➕ เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 🛒 หน้าตะกร้าสินค้าสไตล์ 3D Bouncy & Glossy */}
      {page === 'cart' && (
        <div className="cart-box">
          <h2 style={{ color: '#841e33', fontSize: '2.2rem', marginBottom: '1.8rem', textAlign: 'center', fontFamily: 'Prompt', textShadow: '0 2px 4px rgba(74,16,29,0.1)' }}>
            🛒 ตะกร้าสินค้าของคุณ
          </h2>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#7a4652' }}>
              <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'Kanit' }}>ยังไม่มีสินค้าในตะกร้า</p>
              <button onClick={() => setPage('store')} className="btn-secondary-3d">
                กลับไปเลือกซื้อสินค้า
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.2rem' }}>
                {cart.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: '75px', height: '75px', borderRadius: '14px', border: '1px solid rgba(132,30,51,0.15)' }} />
                      <div>
                        <h4 style={{ color: '#4a101d', fontSize: '1.1rem', fontFamily: 'Prompt', fontWeight: '700' }}>{item.name}</h4>
                        <p style={{ color: '#841e33', fontWeight: 'bold', fontFamily: 'Prompt', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                          {item.price.toLocaleString()} บาท/ชิ้น <span style={{ color: '#7a4652', fontWeight: 'normal', fontSize: '0.9rem' }}>(รวม: {(item.price * item.count).toLocaleString()} บาท)</span>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <button 
                        className="btn-qty"
                        onClick={() => handleQuantityChange(item._id, item.count - 1)}
                        disabled={item.count <= 1}
                        style={{ opacity: item.count <= 1 ? 0.4 : 1, cursor: item.count <= 1 ? 'not-allowed' : 'pointer' }}
                      >
                        -
                      </button>

                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={item.count} 
                        className="cart-qty-input"
                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      />

                      <button 
                        className="btn-qty"
                        onClick={() => handleQuantityChange(item._id, item.count + 1)}
                        disabled={item.count >= 100}
                        style={{ opacity: item.count >= 100 ? 0.4 : 1, cursor: item.count >= 100 ? 'not-allowed' : 'pointer' }}
                      >
                        +
                      </button>

                      <button 
                        className="btn-delete"
                        onClick={() => removeFromCart(item._id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปราคารวมและปุ่มกดสั่งซื้อ 3D */}
              <div style={{ borderTop: '2px dashed rgba(132,30,51,0.2)', paddingTop: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.15rem', color: '#4a101d', fontFamily: 'Kanit' }}>ราคารวมทั้งสิ้น: </span>
                  <span style={{ fontSize: '2.2rem', color: '#841e33', fontWeight: '800', marginLeft: '0.6rem', fontFamily: 'Prompt', textShadow: '0 2px 4px rgba(132,30,51,0.15)' }}>
                    {totalPrice.toLocaleString()} บาท
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.2rem' }}>
                  <button 
                    onClick={() => setPage('store')}
                    className="btn-secondary-3d"
                  >
                    เลือกสินค้าเพิ่ม
                  </button>
                  <button 
                    onClick={handleCheckout}
                    className="btn-confirm-3d"
                  >
                    ✅ ยืนยันการสั่งซื้อ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* หน้าเข้าสู่ระบบ */}
      {page === 'login' && (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#ffffff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(74,16,29,0.12)', border: '1px solid rgba(132,30,51,0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#841e33', fontFamily: 'Prompt' }}>เข้าสู่ระบบ</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>อีเมล:</label>
              <input 
                type="email" 
                required 
                style={{ width: '100%' }}
                value={loginForm.email} 
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>รหัสผ่าน:</label>
              <input 
                type="password" 
                required 
                style={{ width: '100%' }}
                value={loginForm.password} 
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
              />
            </div>
            <button type="submit" style={{ marginTop: '0.8rem' }}>เข้าสู่ระบบ</button>
          </form>
        </div>
      )}

      {/* หน้าสมัครสมาชิก */}
      {page === 'register' && (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#ffffff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(74,16,29,0.12)', border: '1px solid rgba(132,30,51,0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#841e33', fontFamily: 'Prompt' }}>สมัครสมาชิก</h2>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>ชื่อ-นามสกุล:</label>
              <input 
                type="text" 
                required 
                style={{ width: '100%' }}
                value={regForm.name} 
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>อีเมล:</label>
              <input 
                type="email" 
                required 
                style={{ width: '100%' }}
                value={regForm.email} 
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>รหัสผ่าน:</label>
              <input 
                type="password" 
                required 
                style={{ width: '100%' }}
                value={regForm.password} 
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#4a101d' }}>สิทธิ์ผู้ใช้งาน (Role):</label>
              <select 
                style={{ width: '100%' }}
                value={regForm.role} 
                onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
              >
                <option value="Member">Member (ลูกค้าทั่วไป)</option>
                <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
              </select>
            </div>
            <button type="submit" style={{ marginTop: '0.8rem' }}>สมัครสมาชิก</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;