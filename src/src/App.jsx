import { useState, useEffect, useCallback } from "react";
import * as api from "./api.js";

const CITIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret"];
const CUISINES = ["Kenyan","Burgers","Pizza","Indian","Seafood","Healthy","Chinese","Breakfast"];
const CUISINE_ICONS = { Kenyan:"🍖", Burgers:"🍔", Pizza:"🍕", Indian:"🍛", Seafood:"🐟", Healthy:"🥗", Chinese:"🥡", Breakfast:"🍳" };

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [page, setPage] = useState("home"); // home | checkout | confirmed
  const [order, setOrder] = useState(null);
  const [city, setCity] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(api.getUser);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const cartTotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s,i) => s + i.qty, 0);

  useEffect(() => { loadRestaurants(); }, [city, cuisine]);

  async function loadRestaurants() {
    setLoading(true);
    try { setRestaurants(await api.fetchRestaurants(city, cuisine, search) || []); }
    catch { setRestaurants([]); }
    finally { setLoading(false); }
  }

  function handleSearch(e) {
    if (e.key === "Enter") loadRestaurants();
  }

  function addToCart(item, restaurant) {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? {...i, qty: i.qty+1} : i);
      return [...prev, {...item, qty:1, restaurantId: restaurant.id, restaurantName: restaurant.name}];
    });
  }

  function removeFromCart(id) {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex?.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? {...i, qty: i.qty-1} : i);
    });
  }

  async function handlePlaceOrder(details) {
    if (!user) { setShowAuth(true); return false; }
    const o = {
      restaurant_id: cart[0]?.restaurantId,
      items: cart.map(i => ({ id: i.id, quantity: i.qty })),
      delivery_address: details.address,
      delivery_city: details.city,
      payment_method: details.payment,
      customer_name: details.name,
      customer_phone: details.phone,
    };
    const result = await api.placeOrder(o);
    if (details.payment === "mpesa" && details.phone) {
      try { await api.initiateMpesa(result.order.id, details.phone); } catch {}
    }
    setOrder({ ...result.order, items: cart, total: cartTotal, ...details });
    setCart([]);
    setPage("confirmed");
    return true;
  }

  async function handleLogin(phone, password) {
    const data = await api.login(phone, password);
    setUser(data.user);
    setShowAuth(false);
  }

  async function handleRegister(name, phone, password) {
    const data = await api.register(name, phone, password, "customer");
    setUser(data.user);
    setShowAuth(false);
  }

  if (page === "checkout") return <CheckoutPage cart={cart} total={cartTotal} user={user} onBack={() => setPage("home")} onPlace={handlePlaceOrder} />;
  if (page === "confirmed") return <ConfirmedPage order={order} onHome={() => { setPage("home"); setOrder(null); }} />;

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* ── NAVBAR ── */}
      <nav style={{background:"white", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
        <div style={{maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:18, boxShadow:"0 2px 8px rgba(37,99,235,0.3)"}}>T</div>
            <div>
              <span style={{fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:-0.5}}>trampet</span>
              <span style={{fontSize:11, color:"#2563eb", fontWeight:600, marginLeft:6, background:"#eff6ff", padding:"2px 6px", borderRadius:4}}>BETA</span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            {user ? (
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"6px 12px"}}>
                  <div style={{width:28, height:28, borderRadius:"50%", background:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontWeight:700}}>{user.name?.[0]?.toUpperCase()}</div>
                  <span style={{fontSize:13, fontWeight:500, color:"#374151"}}>{user.name?.split(" ")[0]}</span>
                </div>
                <button onClick={() => { api.logout(); setUser(null); }} style={{background:"none", border:"1px solid #e2e8f0", borderRadius:8, color:"#64748b", padding:"6px 12px", fontSize:12, cursor:"pointer"}}>Sign out</button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode("login"); setShowAuth(true); }} style={{background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, color:"#2563eb", padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer"}}>Sign in</button>
            )}
            <button onClick={() => setCartOpen(true)} style={{display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background: cartCount>0 ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "white", border:"1px solid #e2e8f0", borderRadius:10, cursor:"pointer", color: cartCount>0 ? "white" : "#64748b", fontSize:14, fontWeight:500, boxShadow: cartCount>0 ? "0 2px 8px rgba(37,99,235,0.25)" : "none", transition:"all 0.2s"}}>
              <span>🛒</span>
              {cartCount > 0 ? <span>{cartCount} · Ksh {cartTotal.toLocaleString()}</span> : <span>Cart</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{background:"linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)", padding:"72px 24px 56px", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute", bottom:-50, left:-50, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.04)"}}/>
        <div style={{maxWidth:680, margin:"0 auto", textAlign:"center", position:"relative"}}>
          <div style={{display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:100, padding:"6px 16px", marginBottom:24}}>
            <span style={{fontSize:14}}>🇰🇪</span>
            <span style={{color:"white", fontSize:12, fontWeight:600, letterSpacing:0.5}}>DELIVERING ACROSS KENYA</span>
          </div>
          <h1 style={{fontSize:"clamp(32px,6vw,60px)", fontWeight:800, color:"white", letterSpacing:-2, lineHeight:1.05, margin:"0 0 16px"}}>
            Order food from the<br/>
            <span style={{background:"linear-gradient(90deg,#fbbf24,#f59e0b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>best spots near you</span>
          </h1>
          <p style={{color:"rgba(255,255,255,0.8)", fontSize:17, margin:"0 0 36px", lineHeight:1.6}}>
            Restaurants across Nairobi, Mombasa, Kisumu and beyond.<br/>Pay with M-Pesa or cash on delivery.
          </p>
          <div style={{background:"white", borderRadius:14, display:"flex", alignItems:"center", padding:"6px 6px 6px 20px", gap:10, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", maxWidth:540, margin:"0 auto"}}>
            <span style={{fontSize:20, opacity:0.5}}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} placeholder="Search restaurants, cuisines, or areas..." style={{flex:1, border:"none", outline:"none", fontSize:15, color:"#0f172a", padding:"10px 0", background:"transparent"}}/>
            <button onClick={loadRestaurants} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)", border:"none", borderRadius:10, color:"white", padding:"11px 22px", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap"}}>Search</button>
          </div>
          <div style={{display:"flex", gap:24, justifyContent:"center", marginTop:32, flexWrap:"wrap"}}>
            {[["🏪","50+ restaurants"],["⚡","Fast delivery"],["📱","M-Pesa & cash"],["⭐","Top-rated"]].map(([icon,label]) => (
              <div key={label} style={{display:"flex", alignItems:"center", gap:6}}>
                <span style={{fontSize:16}}>{icon}</span>
                <span style={{color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CUISINE PILLS ── */}
      <div style={{background:"white", borderBottom:"1px solid #e2e8f0", padding:"16px 24px"}}>
        <div style={{maxWidth:1200, margin:"0 auto"}}>
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:12}}>
            {["all",...CITIES].map(c => (
              <button key={c} onClick={() => setCity(c)} style={{padding:"7px 16px", borderRadius:100, border:"1.5px solid", borderColor: city===c ? "#2563eb" : "#e2e8f0", background: city===c ? "#eff6ff" : "white", color: city===c ? "#2563eb" : "#64748b", fontSize:13, fontWeight: city===c ? 600 : 400, cursor:"pointer", transition:"all 0.15s"}}>
                {c === "all" ? "🗺️ All cities" : c}
              </button>
            ))}
          </div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            <button onClick={() => setCuisine("all")} style={{padding:"6px 14px", borderRadius:100, border:"1.5px solid", borderColor: cuisine==="all"?"#2563eb":"#e2e8f0", background: cuisine==="all"?"#eff6ff":"white", color: cuisine==="all"?"#2563eb":"#64748b", fontSize:12, fontWeight: cuisine==="all"?600:400, cursor:"pointer"}}>All cuisines</button>
            {CUISINES.map(c => (
              <button key={c} onClick={() => setCuisine(c)} style={{padding:"6px 14px", borderRadius:100, border:"1.5px solid", borderColor: cuisine===c?"#2563eb":"#e2e8f0", background: cuisine===c?"#eff6ff":"white", color: cuisine===c?"#2563eb":"#64748b", fontSize:12, fontWeight: cuisine===c?600:400, cursor:"pointer", display:"flex", alignItems:"center", gap:5}}>
                <span>{CUISINE_ICONS[c]}</span>{c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESTAURANT GRID ── */}
      <div style={{maxWidth:1200, margin:"0 auto", padding:"36px 24px"}}>
        {loading ? (
          <div style={{textAlign:"center", padding:"80px 0"}}>
            <div style={{width:48, height:48, border:"3px solid #e2e8f0", borderTopColor:"#2563eb", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 0.8s linear infinite"}}/>
            <p style={{color:"#64748b", fontSize:15}}>Finding restaurants near you...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{textAlign:"center", padding:"80px 0"}}>
            <div style={{fontSize:56, marginBottom:16}}>🍽️</div>
            <h3 style={{fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:8}}>No restaurants found</h3>
            <p style={{color:"#64748b"}}>Try a different city or search term</p>
            <button onClick={() => { setCity("all"); setCuisine("all"); setSearch(""); loadRestaurants(); }} style={{marginTop:16, background:"#2563eb", border:"none", borderRadius:10, color:"white", padding:"10px 24px", fontSize:14, fontWeight:600, cursor:"pointer"}}>Clear filters</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
              <h2 style={{fontSize:20, fontWeight:700, color:"#0f172a"}}>{restaurants.length} restaurant{restaurants.length!==1?"s":""} available</h2>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24}}>
              {restaurants.map(r => <RestaurantCard key={r.id} r={r} onSelect={setSelected} />)}
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{background:"#0f172a", padding:"40px 24px", marginTop:40}}>
        <div style={{maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:36, height:36, borderRadius:8, background:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800}}>T</div>
            <span style={{color:"white", fontWeight:700, fontSize:18}}>trampet</span>
          </div>
          <p style={{color:"#64748b", fontSize:13}}>Food delivery across Kenya · Pay with M-Pesa or cash</p>
          <p style={{color:"#334155", fontSize:12}}>© 2024 Trampet. All rights reserved.</p>
        </div>
      </footer>

      {selected && <RestaurantModal r={selected} cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClose={() => setSelected(null)} onCheckout={() => { setSelected(null); setPage("checkout"); }} cartTotal={cartTotal} cartCount={cartCount} />}
      {cartOpen && <CartSidebar cart={cart} total={cartTotal} onClose={() => setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setPage("checkout"); }} />}
      {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function RestaurantCard({ r, onSelect }) {
  const fallback = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80";
  return (
    <div onClick={() => r.open !== false && onSelect(r)} style={{background:"white", borderRadius:18, border:"1px solid #e2e8f0", overflow:"hidden", cursor: r.open!==false?"pointer":"not-allowed", opacity: r.open!==false?1:0.65, transition:"all 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}
      onMouseEnter={e => { if(r.open!==false) { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor="#bfdbfe"; }}}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor="#e2e8f0"; }}>
      <div style={{position:"relative", height:196, overflow:"hidden"}}>
        <img src={r.cover_url || fallback} alt={r.name} style={{width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.3s"}} onMouseEnter={e => e.target.style.transform="scale(1.05)"} onMouseLeave={e => e.target.style.transform="scale(1)"}/>
        <div style={{position:"absolute", inset:0, background:"linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)"}}/>
        {r.open === false && <div style={{position:"absolute", inset:0, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center"}}><span style={{background:"white", borderRadius:100, padding:"6px 18px", fontSize:13, fontWeight:600, color:"#64748b", boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>⏸ Closed now</span></div>}
        <div style={{position:"absolute", top:12, right:12}}>
          {r.rating > 0 && <div style={{background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:4}}>
            <span style={{fontSize:12}}>⭐</span>
            <span style={{color:"white", fontSize:13, fontWeight:700}}>{Number(r.rating).toFixed(1)}</span>
            {r.review_count > 0 && <span style={{color:"rgba(255,255,255,0.7)", fontSize:11}}>({r.review_count})</span>}
          </div>}
        </div>
        <div style={{position:"absolute", bottom:12, left:14, right:14}}>
          <h3 style={{color:"white", fontSize:18, fontWeight:800, margin:"0 0 3px", textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>{r.name}</h3>
          <p style={{color:"rgba(255,255,255,0.8)", fontSize:12, margin:0}}>{r.area || ""}{r.area && r.city ? ", " : ""}{r.city}</p>
        </div>
      </div>
      <div style={{padding:"14px 18px 18px"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
          <span style={{background:"#f1f5f9", color:"#374151", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:500}}>{CUISINE_ICONS[r.category] || "🍽️"} {r.category}</span>
          {r.open !== false && <span style={{background:"#f0fdf4", color:"#15803d", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:500}}>● Open</span>}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
          {[["🕐", r.estimated_time || r.deliveryTime || "25–40 min"], ["🛵", `Ksh ${r.delivery_fee || r.deliveryFee || 80}`], ["📋", `Min ${r.min_order || r.minOrder || 200}`]].map(([icon, val]) => (
            <div key={icon} style={{background:"#f8fafc", borderRadius:8, padding:"8px 10px", textAlign:"center"}}>
              <div style={{fontSize:14, marginBottom:2}}>{icon}</div>
              <div style={{fontSize:11, color:"#64748b", fontWeight:500, lineHeight:1.3}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantModal({ r, cart, onAdd, onRemove, onClose, onCheckout, cartTotal, cartCount }) {
  const [menu, setMenu] = useState([]);
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const fallback = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80";

  useEffect(() => {
    api.fetchRestaurant(r.id).then(d => { setMenu(d.menu || []); setLoading(false); }).catch(() => setLoading(false));
  }, [r.id]);

  const cats = [...new Set(menu.map(i => i.category))];
  const shown = cat ? menu.filter(i => i.category === cat) : menu;
  const popular = menu.filter(i => i.is_popular);
  const getQty = id => cart.find(i => i.id === id)?.qty || 0;

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{background:"white", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:760, maxHeight:"92vh", overflow:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{position:"relative", height:220}}>
          <img src={r.cover_url || fallback} alt={r.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
          <div style={{position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75), transparent 50%)"}}/>
          <button onClick={onClose} style={{position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.95)", border:"none", borderRadius:"50%", width:36, height:36, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>✕</button>
          <div style={{position:"absolute", bottom:18, left:22}}>
            <h2 style={{color:"white", fontSize:26, fontWeight:800, margin:"0 0 4px", textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{r.name}</h2>
            <div style={{display:"flex", gap:12}}>
              <span style={{color:"rgba(255,255,255,0.85)", fontSize:13}}>📍 {r.area}, {r.city}</span>
              {r.rating > 0 && <span style={{color:"rgba(255,255,255,0.85)", fontSize:13}}>⭐ {Number(r.rating).toFixed(1)}</span>}
              <span style={{color:"rgba(255,255,255,0.85)", fontSize:13}}>🕐 {r.estimated_time || "25–40 min"}</span>
            </div>
          </div>
        </div>

        <div style={{padding:"20px 22px 120px"}}>
          {loading ? (
            <div style={{textAlign:"center", padding:"40px 0"}}>
              <div style={{width:32, height:32, border:"2px solid #e2e8f0", borderTopColor:"#2563eb", borderRadius:"50%", margin:"0 auto", animation:"spin 0.8s linear infinite"}}/>
            </div>
          ) : (
            <>
              {!cat && popular.length > 0 && (
                <div style={{marginBottom:28}}>
                  <h3 style={{fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8}}>🔥 Popular items</h3>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
                    {popular.map(item => {
                      const qty = getQty(item.id);
                      return (
                        <div key={item.id} style={{background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px", position:"relative"}}>
                          <span style={{position:"absolute", top:10, right:10, background:"#fef3c7", color:"#d97706", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:100}}>Popular</span>
                          <p style={{fontWeight:600, fontSize:14, color:"#0f172a", margin:"0 0 4px", paddingRight:56}}>{item.name}</p>
                          <p style={{color:"#64748b", fontSize:12, margin:"0 0 10px", lineHeight:1.4}}>{item.description}</p>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                            <span style={{fontWeight:700, fontSize:15, color:"#0f172a"}}>Ksh {item.price?.toLocaleString()}</span>
                            <QtyControl qty={qty} onAdd={() => onAdd(item, r)} onRemove={() => onRemove(item.id)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, paddingBottom:16, borderBottom:"1px solid #f1f5f9"}}>
                <CatBtn label="All items" active={!cat} onClick={() => setCat(null)} />
                {cats.map(c => <CatBtn key={c} label={c} active={cat===c} onClick={() => setCat(c)} />)}
              </div>

              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {shown.filter(i => i.is_available !== false).map(item => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"white", borderRadius:12, border:"1px solid #f1f5f9", transition:"border-color 0.15s"}}
                      onMouseEnter={e => e.currentTarget.style.borderColor="#bfdbfe"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="#f1f5f9"}>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:600, fontSize:14, color:"#0f172a", margin:"0 0 4px"}}>{item.name}</p>
                        <p style={{color:"#94a3b8", fontSize:12, margin:"0 0 6px", lineHeight:1.4}}>{item.description}</p>
                        <span style={{fontWeight:700, fontSize:15, color:"#0f172a"}}>Ksh {item.price?.toLocaleString()}</span>
                      </div>
                      <div style={{marginLeft:20, flexShrink:0}}>
                        <QtyControl qty={qty} onAdd={() => onAdd(item, r)} onRemove={() => onRemove(item.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {cartCount > 0 && (
          <div style={{position:"sticky", bottom:0, padding:"16px 22px", background:"white", borderTop:"1px solid #e2e8f0", boxShadow:"0 -4px 16px rgba(0,0,0,0.08)"}}>
            <button onClick={onCheckout} style={{width:"100%", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", border:"none", borderRadius:14, padding:"16px 24px", color:"white", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 4px 16px rgba(37,99,235,0.35)"}}>
              <span style={{background:"rgba(255,255,255,0.2)", borderRadius:8, padding:"3px 12px", fontSize:14}}>{cartCount} items</span>
              <span>Go to checkout</span>
              <span style={{fontWeight:700}}>Ksh {cartTotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QtyControl({ qty, onAdd, onRemove }) {
  if (qty === 0) return (
    <button onClick={onAdd} style={{width:36, height:36, borderRadius:10, background:"#2563eb", border:"none", color:"white", fontSize:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(37,99,235,0.3)", transition:"transform 0.1s"}} onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>+</button>
  );
  return (
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <button onClick={onRemove} style={{width:32, height:32, borderRadius:8, background:"#f1f5f9", border:"1px solid #e2e8f0", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center"}}>−</button>
      <span style={{fontWeight:700, fontSize:15, minWidth:20, textAlign:"center", color:"#0f172a"}}>{qty}</span>
      <button onClick={onAdd} style={{width:32, height:32, borderRadius:8, background:"#2563eb", border:"none", color:"white", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center"}}>+</button>
    </div>
  );
}

function CatBtn({ label, active, onClick }) {
  return <button onClick={onClick} style={{padding:"7px 16px", borderRadius:100, border:"1.5px solid", borderColor: active?"#2563eb":"#e2e8f0", background: active?"#eff6ff":"white", color: active?"#2563eb":"#64748b", fontSize:13, fontWeight: active?600:400, cursor:"pointer", transition:"all 0.15s"}}>{label}</button>;
}

function CartSidebar({ cart, total, onClose, onAdd, onRemove, onCheckout }) {
  const grand = total + 80;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:200, backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed", top:0, right:0, bottom:0, width:"min(420px,100vw)", background:"white", zIndex:201, display:"flex", flexDirection:"column", boxShadow:"-8px 0 32px rgba(0,0,0,0.12)"}}>
        <div style={{padding:"22px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{fontSize:20, fontWeight:800, color:"#0f172a"}}>Your cart {cart.length > 0 && <span style={{fontSize:14, fontWeight:500, color:"#64748b"}}>({cart.length} item{cart.length!==1?"s":""})</span>}</h2>
          <button onClick={onClose} style={{background:"#f1f5f9", border:"none", borderRadius:8, width:34, height:34, cursor:"pointer", fontSize:18}}>✕</button>
        </div>
        <div style={{flex:1, overflow:"auto", padding:"16px 24px"}}>
          {cart.length === 0 ? (
            <div style={{textAlign:"center", padding:"80px 0", color:"#94a3b8"}}>
              <div style={{fontSize:56, marginBottom:16}}>🛒</div>
              <h3 style={{fontSize:18, fontWeight:600, color:"#64748b", marginBottom:8}}>Your cart is empty</h3>
              <p style={{fontSize:14}}>Add items from a restaurant to get started</p>
            </div>
          ) : (
            <>
              {cart[0] && <p style={{fontSize:13, color:"#94a3b8", marginBottom:12}}>From {cart[0].restaurantName}</p>}
              {cart.map(item => (
                <div key={item.id} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:"1px solid #f8fafc"}}>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600, fontSize:14, color:"#0f172a", margin:"0 0 3px"}}>{item.name}</p>
                    <p style={{color:"#94a3b8", fontSize:12, margin:0}}>Ksh {item.price?.toLocaleString()} each</p>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <button onClick={() => onRemove(item.id)} style={{width:28, height:28, borderRadius:6, background:"#f1f5f9", border:"1px solid #e2e8f0", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>−</button>
                    <span style={{fontWeight:700, fontSize:14, minWidth:16, textAlign:"center"}}>{item.qty}</span>
                    <button onClick={() => onAdd(item, {id: item.restaurantId})} style={{width:28, height:28, borderRadius:6, background:"#2563eb", border:"none", color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>+</button>
                  </div>
                  <span style={{fontWeight:700, fontSize:14, color:"#0f172a", minWidth:80, textAlign:"right"}}>Ksh {(item.price * item.qty)?.toLocaleString()}</span>
                </div>
              ))}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div style={{padding:"20px 24px", borderTop:"1px solid #f1f5f9"}}>
            {[["Subtotal", `Ksh ${total.toLocaleString()}`], ["Delivery fee", "Ksh 80"]].map(([k,v]) => (
              <div key={k} style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                <span style={{color:"#64748b", fontSize:14}}>{k}</span>
                <span style={{fontSize:14, color:"#374151"}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid #e2e8f0", marginBottom:18}}>
              <span style={{fontWeight:800, fontSize:16, color:"#0f172a"}}>Total</span>
              <span style={{fontWeight:800, fontSize:16, color:"#2563eb"}}>Ksh {grand.toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} style={{width:"100%", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", border:"none", borderRadius:12, padding:"15px", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(37,99,235,0.3)"}}>Proceed to checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutPage({ cart, total, user, onBack, onPlace }) {
  const [name, setName] = useState(user?.name||"");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState(user?.phone||"");
  const [payment, setPayment] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const grand = total + 80;

  async function submit() {
    if (!name || !address || !city || !phone) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try { await onPlace({ name, address, city, phone, payment }); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc"}}>
      <nav style={{background:"white", borderBottom:"1px solid #e2e8f0", padding:"0 24px", height:64, display:"flex", alignItems:"center", gap:16, boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
        <button onClick={onBack} style={{display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:"#64748b", fontSize:14, cursor:"pointer"}}>← Back</button>
        <span style={{fontSize:18, fontWeight:700, color:"#0f172a"}}>Checkout</span>
        <span style={{fontSize:13, color:"#94a3b8", marginLeft:"auto"}}>Ksh {grand.toLocaleString()} total</span>
      </nav>
      <div style={{maxWidth:560, margin:"0 auto", padding:"32px 24px"}}>
        {error && <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 16px", color:"#dc2626", fontSize:14, marginBottom:20}}>{error}</div>}

        <Card title="📍 Delivery details">
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <FInput label="Full name" value={name} onChange={setName} placeholder="Jane Wanjiku" full />
            <FInput label="Phone number" value={phone} onChange={setPhone} placeholder="0712 345 678" type="tel" full />
          </div>
          <FInput label="Delivery address" value={address} onChange={setAddress} placeholder="Street, estate, building name..." full style={{marginTop:14}} />
          <div style={{marginTop:14}}>
            <label style={{display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6}}>City</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", background:"white", color: city?"#0f172a":"#94a3b8"}}>
              <option value="">Select your city...</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </Card>

        <Card title="💳 Payment method">
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            {[["mpesa","📱","M-Pesa","STK push to your phone"],["cash","💵","Cash on delivery","Pay when rider arrives"]].map(([val,icon,label,sub]) => (
              <button key={val} onClick={() => setPayment(val)} style={{background: payment===val?"#eff6ff":"#f8fafc", border:`2px solid ${payment===val?"#2563eb":"#e2e8f0"}`, borderRadius:14, padding:"16px", cursor:"pointer", textAlign:"left", transition:"all 0.15s"}}>
                <div style={{fontSize:26, marginBottom:8}}>{icon}</div>
                <p style={{fontWeight:700, fontSize:14, color:"#0f172a", margin:"0 0 3px"}}>{label}</p>
                <p style={{color:"#64748b", fontSize:12, margin:0}}>{sub}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card title="📋 Order summary">
          {cart.map(item => (
            <div key={item.id} style={{display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f1f5f9"}}>
              <span style={{color:"#374151", fontSize:14}}>{item.name} <span style={{color:"#94a3b8"}}>×{item.qty}</span></span>
              <span style={{fontWeight:600, fontSize:14, color:"#0f172a"}}>Ksh {(item.price*item.qty).toLocaleString()}</span>
            </div>
          ))}
          {[["Subtotal", total.toLocaleString()], ["Delivery fee", "80"]].map(([k,v]) => (
            <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f8fafc"}}>
              <span style={{color:"#64748b", fontSize:14}}>{k}</span>
              <span style={{fontSize:14}}>Ksh {v}</span>
            </div>
          ))}
          <div style={{display:"flex", justifyContent:"space-between", paddingTop:12}}>
            <span style={{fontWeight:800, fontSize:16, color:"#0f172a"}}>Total</span>
            <span style={{fontWeight:800, fontSize:16, color:"#2563eb"}}>Ksh {grand.toLocaleString()}</span>
          </div>
        </Card>

        <button onClick={submit} disabled={loading} style={{width:"100%", background: loading?"#93c5fd":"linear-gradient(135deg,#2563eb,#1d4ed8)", border:"none", borderRadius:14, padding:"17px", color:"white", fontSize:16, fontWeight:700, cursor: loading?"not-allowed":"pointer", boxShadow:"0 4px 20px rgba(37,99,235,0.3)", transition:"all 0.2s"}}>
          {loading ? "⏳ Placing your order..." : `✓ Place order · Ksh ${grand.toLocaleString()}`}
        </button>
        <p style={{textAlign:"center", color:"#94a3b8", fontSize:12, marginTop:12}}>By placing this order you agree to Trampet's terms of service</p>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return <div style={{background:"white", border:"1px solid #e2e8f0", borderRadius:16, padding:"20px 22px", marginBottom:18, boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 18px"}}>{title}</h3>{children}</div>;
}

function FInput({ label, value, onChange, placeholder, type="text", full, style:extraStyle }) {
  return (
    <div style={{...(full?{gridColumn:"1/-1"}:{}), ...extraStyle}}>
      <label style={{display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6}}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", transition:"border-color 0.15s"}} onFocus={e => e.target.style.borderColor="#2563eb"} onBlur={e => e.target.style.borderColor="#e2e8f0"}/>
    </div>
  );
}

function ConfirmedPage({ order, onHome }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = [setTimeout(()=>setStage(1),3000), setTimeout(()=>setStage(2),8000), setTimeout(()=>setStage(3),14000)];
    return () => t.forEach(clearTimeout);
  }, []);
  const stages = [{icon:"✅",label:"Order confirmed",sub:"Your order has been received"},{icon:"👨‍🍳",label:"Preparing your food",sub:"The restaurant is cooking"},{icon:"🛵",label:"Rider on the way",sub:"Your order has been picked up"},{icon:"🎉",label:"Delivered!",sub:"Enjoy your meal"}];

  return (
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#f8fafc,#eff6ff)", display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
      <div style={{maxWidth:460, width:"100%", textAlign:"center"}}>
        <div style={{width:60, height:60, borderRadius:18, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"white", fontWeight:800, fontSize:24, boxShadow:"0 4px 20px rgba(37,99,235,0.3)"}}>T</div>
        <div style={{background:"white", border:"1px solid #e2e8f0", borderRadius:24, padding:"32px 28px", marginBottom:16, boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}}>
          <div style={{width:72, height:72, borderRadius:"50%", background:"#f0fdf4", border:"3px solid #16a34a", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32}}>✅</div>
          <h2 style={{fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 6px"}}>Order placed!</h2>
          <p style={{color:"#64748b", fontSize:14, margin:"0 0 22px"}}>Order #{order?.id} · {new Date().toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})}</p>
          <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"1px solid #bfdbfe", borderRadius:14, padding:"16px", marginBottom:24}}>
            <p style={{color:"#1e40af", fontSize:12, fontWeight:600, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:0.5}}>Estimated arrival</p>
            <p style={{color:"#1e3a8a", fontSize:36, fontWeight:900, margin:0, letterSpacing:-1}}>25–40 min</p>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:0}}>
            {stages.map((s,i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom: i<3?"1px solid #f8fafc":"none", opacity: i<=stage?1:0.3, transition:"opacity 0.6s ease"}}>
                <div style={{width:40, height:40, borderRadius:"50%", background: i<stage?"#f0fdf4": i===stage?"#eff6ff":"#f8fafc", border:`2px solid ${i<stage?"#16a34a":i===stage?"#2563eb":"#e2e8f0"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:i<stage?14:18, flexShrink:0, transition:"all 0.3s"}}>
                  {i<stage?"✓":s.icon}
                </div>
                <div style={{textAlign:"left"}}>
                  <p style={{fontWeight: i===stage?700:500, fontSize:14, color: i===stage?"#0f172a":"#64748b", margin:"0 0 2px"}}>{s.label}</p>
                  <p style={{fontSize:12, color:"#94a3b8", margin:0}}>{s.sub}</p>
                </div>
                {i===stage && <div style={{marginLeft:"auto", display:"flex", gap:3}}>{[0,1,2].map(d=><div key={d} style={{width:5,height:5,borderRadius:"50%",background:"#2563eb",animation:`pulse 1s ${d*0.2}s ease-in-out infinite`}}/>)}</div>}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onHome} style={{width:"100%", background:"white", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px", color:"#64748b", fontSize:14, fontWeight:500, cursor:"pointer"}}>← Back to restaurants</button>
        <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
      </div>
    </div>
  );
}

function AuthModal({ mode, setMode, onLogin, onRegister, onClose }) {
  const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");

  async function handle() {
    setLoading(true); setError("");
    try { mode==="login" ? await onLogin(phone,password) : await onRegister(name,phone,password); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(4px)"}}>
      <div style={{background:"white",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
          <div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>{mode==="login"?"Welcome back":"Create account"}</h2>
            <p style={{color:"#64748b",fontSize:13,margin:0}}>{mode==="login"?"Sign in to order food":"Join Trampet today"}</p>
          </div>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",color:"#dc2626",fontSize:13,marginBottom:16}}>{error}</div>}
        {mode==="register" && <FInput label="Full name" value={name} onChange={setName} placeholder="Jane Wanjiku" style={{marginBottom:14}}/>}
        <FInput label="Phone number" value={phone} onChange={setPhone} placeholder="0712 345 678" type="tel" style={{marginBottom:14}}/>
        <FInput label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" style={{marginBottom:20}}/>
        <button onClick={handle} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",border:"none",borderRadius:12,padding:"14px",color:"white",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:16,boxShadow:"0 4px 16px rgba(37,99,235,0.3)"}}>
          {loading?"Please wait...":mode==="login"?"Sign in":"Create account"}
        </button>
        <p style={{textAlign:"center",fontSize:13,color:"#64748b"}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={() => setMode(mode==="login"?"register":"login")} style={{color:"#2563eb",cursor:"pointer",fontWeight:600}}>{mode==="login"?"Sign up":"Sign in"}</span>
        </p>
      </div>
    </div>
  );
}
