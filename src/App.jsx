import { useState } from "react";
import { restaurants } from "./data/restaurants";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
const cuisines = ["Kenyan", "Burgers", "Pizza", "Indian", "Seafood", "Healthy", "Chinese", "Breakfast"];

export default function App() {
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutPage, setCheckoutPage] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [city, setCity] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [search, setSearch] = useState("");

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(item, restaurant) {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex?.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  const filtered = restaurants.filter(r => {
    const matchCity = city === "all" || r.city === city;
    const matchCuisine = cuisine === "all" || r.category === cuisine;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchCuisine && matchSearch;
  });

  if (confirmed) return <OrderConfirmed order={confirmed} onHome={() => { setConfirmed(null); setPage("home"); setCart([]); }} />;
  if (checkoutPage) return <Checkout cart={cart} total={cartTotal} onBack={() => setCheckoutPage(false)} onPlace={(details) => { setConfirmed({ ...details, id: "TRP" + Math.floor(10000 + Math.random() * 90000), items: cart, total: cartTotal }); setCheckoutPage(false); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>T</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: -0.5 }}>trampet</span>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: cartCount > 0 ? "#2563eb" : "white", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", color: cartCount > 0 ? "white" : "#64748b", fontSize: 14, fontWeight: 500 }}>
            🛒 {cartCount > 0 ? `${cartCount} items · Ksh ${cartTotal.toLocaleString()}` : "Cart"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)", padding: "56px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, color: "white", letterSpacing: -1, margin: "0 0 12px" }}>
            Food delivery across Kenya
          </h1>
          <p style={{ color: "#bfdbfe", fontSize: 16, margin: "0 0 32px" }}>
            Order from the best restaurants. Pay with M-Pesa or cash.
          </p>
          <div style={{ background: "white", borderRadius: 12, display: "flex", alignItems: "center", padding: "4px 4px 4px 16px", gap: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants or cuisines..." style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1e293b", padding: "10px 0" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#64748b", fontSize: 13 }}>Clear</button>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {["all", ...cities].map(c => (
              <button key={c} onClick={() => setCity(c)} style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid", borderColor: city === c ? "#2563eb" : "#e2e8f0", background: city === c ? "#eff6ff" : "white", color: city === c ? "#2563eb" : "#64748b", fontSize: 13, fontWeight: city === c ? 600 : 400, cursor: "pointer" }}>
                {c === "all" ? "All cities" : c}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["all", ...cuisines].map(c => (
              <button key={c} onClick={() => setCuisine(c)} style={{ padding: "5px 12px", borderRadius: 100, border: "1px solid", borderColor: cuisine === c ? "#2563eb" : "#e2e8f0", background: cuisine === c ? "#eff6ff" : "white", color: cuisine === c ? "#2563eb" : "#64748b", fontSize: 12, fontWeight: cuisine === c ? 600 : 400, cursor: "pointer" }}>
                {c === "all" ? "All cuisines" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>{filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} available</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => r.open && setSelected(r)} style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", cursor: r.open ? "pointer" : "not-allowed", opacity: r.open ? 1 : 0.7, transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { if (r.open) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}>
              <div style={{ position: "relative", height: 180 }}>
                <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {!r.open && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Closed now</span></div>}
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  {r.tags.map(t => <span key={t} style={{ background: "rgba(255,255,255,0.9)", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: "#334155" }}>{t}</span>)}
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{r.name}</h3>
                    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{r.area}, {r.city} · {r.category}</p>
                  </div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12 }}>⭐</span>
                    <span style={{ color: "#15803d", fontSize: 13, fontWeight: 600 }}>{r.rating}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>🕐 {r.deliveryTime}</span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>🛵 Ksh {r.deliveryFee}</span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>📋 Min Ksh {r.minOrder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant modal */}
      {selected && <RestaurantModal restaurant={selected} cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClose={() => setSelected(null)} onCheckout={() => { setSelected(null); setCheckoutPage(true); }} cartTotal={cartTotal} cartCount={cartCount} />}

      {/* Cart drawer */}
      {cartOpen && <CartDrawer cart={cart} total={cartTotal} onClose={() => setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutPage(true); }} />}
    </div>
  );
}

function RestaurantModal({ restaurant: r, cart, onAdd, onRemove, onClose, onCheckout, cartTotal, cartCount }) {
  const [activeCat, setActiveCat] = useState(null);
  const cats = [...new Set(r.menu.map(i => i.category))];
  const items = activeCat ? r.menu.filter(i => i.category === activeCat) : r.menu;
  const getQty = id => cart.find(i => i.id === id)?.qty || 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 720, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ position: "relative", height: 200 }}>
          <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 14, left: 20 }}>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>{r.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{r.area}, {r.city} · ⭐ {r.rating} · {r.deliveryTime}</p>
          </div>
        </div>
        <div style={{ padding: "16px 20px 100px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={() => setActiveCat(null)} style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid", borderColor: !activeCat ? "#2563eb" : "#e2e8f0", background: !activeCat ? "#eff6ff" : "white", color: !activeCat ? "#2563eb" : "#64748b", fontSize: 13, cursor: "pointer" }}>All</button>
            {cats.map(c => <button key={c} onClick={() => setActiveCat(c)} style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid", borderColor: activeCat === c ? "#2563eb" : "#e2e8f0", background: activeCat === c ? "#eff6ff" : "white", color: activeCat === c ? "#2563eb" : "#64748b", fontSize: 13, cursor: "pointer" }}>{c}</button>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: 0 }}>{item.name}</p>
                      {item.popular && <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 100, border: "1px solid #bfdbfe" }}>Popular</span>}
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 6px", lineHeight: 1.4 }}>{item.desc}</p>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Ksh {item.price.toLocaleString()}</span>
                  </div>
                  <div style={{ marginLeft: 16 }}>
                    {qty === 0 ? (
                      <button onClick={() => onAdd(item, r)} style={{ width: 34, height: 34, borderRadius: 10, background: "#2563eb", border: "none", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => onRemove(item.id)} style={{ width: 30, height: 30, borderRadius: 8, background: "white", border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 16 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: "center" }}>{qty}</span>
                        <button onClick={() => onAdd(item, r)} style={{ width: 30, height: 30, borderRadius: 8, background: "#2563eb", border: "none", color: "white", cursor: "pointer", fontSize: 16 }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {cartCount > 0 && (
          <div style={{ position: "sticky", bottom: 0, padding: "16px 20px", background: "white", borderTop: "1px solid #e2e8f0" }}>
            <button onClick={onCheckout} style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: 12, padding: "15px", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 10px" }}>{cartCount}</span>
              <span>View Cart</span>
              <span>Ksh {cartTotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CartDrawer({ cart, total, onClose, onAdd, onRemove, onCheckout }) {
  const grand = total + 80;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(400px,100vw)", background: "white", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Your cart</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <p style={{ fontSize: 15 }}>Your cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{item.name}</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Ksh {item.price.toLocaleString()} each</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => onRemove(item.id)} style={{ width: 28, height: 28, borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", cursor: "pointer" }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                <button onClick={() => onAdd(item, { id: item.restaurantId })} style={{ width: 28, height: 28, borderRadius: 6, background: "#2563eb", border: "none", color: "white", cursor: "pointer" }}>+</button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 70, textAlign: "right" }}>Ksh {(item.price * item.qty).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Subtotal</span>
                <span style={{ fontSize: 14 }}>Ksh {total.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Delivery</span>
                <span style={{ fontSize: 14 }}>Ksh 80</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>Ksh {grand.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={onCheckout} style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: 12, padding: "14px", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

function Checkout({ cart, total, onBack, onPlace }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const grand = total + 80;

  function handlePlace() {
    if (!name || !address || !city) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onPlace({ name, address, city, phone, paymentMethod: payment }); }, 1500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer" }}>← Back</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginLeft: 16 }}>Checkout</h1>
      </nav>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <Section title="Delivery details">
          {[["Full name", name, setName, "Jane Wanjiku"], ["Delivery address", address, setAddress, "Street, estate, building..."]].map(([label, val, setter, ph]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
              <input value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none" }} />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>City</label>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "white" }}>
                <option value="">Select city...</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none" }} />
            </div>
          </div>
        </Section>

        <Section title="Payment">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["mpesa", "📱", "M-Pesa", "STK push"], ["cash", "💵", "Cash", "Pay on delivery"]].map(([val, icon, label, sub]) => (
              <button key={val} onClick={() => setPayment(val)} style={{ background: payment === val ? "#eff6ff" : "#f8fafc", border: `2px solid ${payment === val ? "#2563eb" : "#e2e8f0"}`, borderRadius: 12, padding: "14px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{label}</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{sub}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Order summary">
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#374151", fontSize: 14 }}>{item.name} × {item.qty}</span>
              <span style={{ color: "#374151", fontSize: 14 }}>Ksh {(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>Ksh {grand.toLocaleString()}</span>
          </div>
        </Section>

        <button onClick={handlePlace} disabled={loading} style={{ width: "100%", background: loading ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 12, padding: "16px", color: "white", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Placing order..." : `Place order · Ksh ${grand.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>{title}</h3>
      {children}
    </div>
  );
}

function OrderConfirmed({ order, onHome }) {
  const [stage, setStage] = useState(0);
  useState(() => {
    const t = [setTimeout(() => setStage(1), 3000), setTimeout(() => setStage(2), 7000), setTimeout(() => setStage(3), 12000)];
    return () => t.forEach(clearTimeout);
  });
  const stages = [{ icon: "✅", label: "Order confirmed" }, { icon: "👨‍🍳", label: "Preparing your food" }, { icon: "🛵", label: "Rider on the way" }, { icon: "📍", label: "Almost there!" }];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "white", fontWeight: 800, fontSize: 22 }}>T</div>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "28px 24px", marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Order placed!</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>#{order.id}</p>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px", marginBottom: 20 }}>
            <p style={{ color: "#1d4ed8", fontSize: 12, margin: "0 0 4px", fontWeight: 600 }}>Estimated arrival</p>
            <p style={{ color: "#1e40af", fontSize: 28, fontWeight: 800, margin: 0 }}>25–40 min</p>
          </div>
          {stages.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none", opacity: i <= stage ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: i < stage ? "#f0fdf4" : i === stage ? "#eff6ff" : "#f8fafc", border: `2px solid ${i < stage ? "#16a34a" : i === stage ? "#2563eb" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {i < stage ? "✓" : s.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: i === stage ? 600 : 400, color: i === stage ? "#0f172a" : "#64748b" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onHome} style={{ width: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Back to home</button>
      </div>
    </div>
  );
}
