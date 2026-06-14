import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CITIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret"];
const CATEGORIES = [
  { id:"all", label:"All", icon:"🏪" },
  { id:"Kenyan", label:"Kenyan", icon:"🍖" },
  { id:"Burgers", label:"Burgers", icon:"🍔" },
  { id:"Pizza", label:"Pizza", icon:"🍕" },
  { id:"Indian", label:"Indian", icon:"🍛" },
  { id:"Seafood", label:"Seafood", icon:"🐟" },
  { id:"Healthy", label:"Healthy", icon:"🥗" },
  { id:"Chinese", label:"Chinese", icon:"🥡" },
  { id:"Breakfast", label:"Breakfast", icon:"🍳" },
];

const HOW_STEPS = [
  { icon:"📍", title:"Set your location", desc:"Tell us where you are and we'll show restaurants that deliver to you." },
  { icon:"🍽️", title:"Choose a restaurant", desc:"Browse from dozens of top-rated restaurants and menus in your area." },
  { icon:"🛒", title:"Add to cart", desc:"Pick your favourite dishes, add them to your cart and go to checkout." },
  { icon:"📱", title:"Pay with M-Pesa", desc:"Secure and instant payment via M-Pesa STK push or cash on delivery." },
  { icon:"🛵", title:"Track your order", desc:"Watch your order status update in real-time until it arrives at your door." },
];

function getToken() { return localStorage.getItem("trampet_token"); }
function getUser() { try { return JSON.parse(localStorage.getItem("trampet_user")); } catch { return null; } }

async function apiFetch(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type":"application/json", ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{}) },
    ...(body?{body:JSON.stringify(body)}:{})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error||"Request failed");
  return data;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(getUser);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [hasSearched, setHasSearched] = useState(false);

  const cartTotal = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const cartCount = cart.reduce((s,i) => s+i.qty, 0);

  async function loadRestaurants(c=city, cat=category, s=search) {
    setLoading(true); setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (c!=="all") params.set("city",c);
      if (cat!=="all") params.set("category",cat);
      if (s) params.set("search",s);
      const data = await apiFetch("GET",`/api/restaurants?${params}`);
      setRestaurants(Array.isArray(data)?data:[]);
    } catch { setRestaurants([]); }
    finally { setLoading(false); }
  }

  function addToCart(item, restaurant) {
    setCart(prev => {
      const ex = prev.find(i=>i.id===item.id);
      if (ex) return prev.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i);
      return [...prev,{...item,qty:1,restaurantId:restaurant.id,restaurantName:restaurant.name}];
    });
  }
  function removeFromCart(id) {
    setCart(prev=>{const ex=prev.find(i=>i.id===id);if(ex?.qty===1)return prev.filter(i=>i.id!==id);return prev.map(i=>i.id===id?{...i,qty:i.qty-1}:i);});
  }

  async function handleLogin(phone, password) {
    const data = await apiFetch("POST","/api/auth/login",{phone,password});
    localStorage.setItem("trampet_token",data.token);
    localStorage.setItem("trampet_user",JSON.stringify(data.user));
    setUser(data.user); setShowAuth(false);
  }
  async function handleRegister(name,phone,password) {
    const data = await apiFetch("POST","/api/auth/register",{name,phone,password,role:"customer"});
    localStorage.setItem("trampet_token",data.token);
    localStorage.setItem("trampet_user",JSON.stringify(data.user));
    setUser(data.user); setShowAuth(false);
  }
  function handleLogout() { localStorage.removeItem("trampet_token"); localStorage.removeItem("trampet_user"); setUser(null); }

  async function placeOrder(details) {
    const o = { restaurant_id:cart[0]?.restaurantId, items:cart.map(i=>({id:i.id,quantity:i.qty})), delivery_address:details.address, delivery_city:details.city, payment_method:details.payment, customer_name:details.name, customer_phone:details.phone };
    const result = await apiFetch("POST","/api/orders",o);
    if (details.payment==="mpesa") { try { await apiFetch("POST","/api/payments/mpesa/stkpush",{order_id:result.order.id,phone:details.phone}); } catch{} }
    setOrder({...result.order,...details,items:cart,total:cartTotal});
    setCart([]); setPage("confirmed");
  }

  if (page==="checkout") return <CheckoutPage cart={cart} total={cartTotal} user={user} onBack={()=>setPage("home")} onPlace={placeOrder} />;
  if (page==="confirmed") return <ConfirmedPage order={order} onHome={()=>{setPage("home");setOrder(null);}} />;

  return (
    <div style={{minHeight:"100vh",background:"white",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* ── NAVBAR ── */}
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setPage("home");setHasSearched(false);}}>
            <div style={{width:40,height:40,borderRadius:12,background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:"white",boxShadow:"0 2px 8px rgba(255,194,68,0.4)"}}>T</div>
            <span style={{fontSize:22,fontWeight:900,color:"#1a1a1a",letterSpacing:-0.5}}>trampet</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {user ? (
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#f9f9f9",border:"1px solid #ebebeb",borderRadius:100,padding:"6px 14px 6px 8px",cursor:"pointer"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:12}}>{user.name?.[0]?.toUpperCase()}</div>
                  <span style={{fontSize:14,fontWeight:500,color:"#1a1a1a"}}>{user.name?.split(" ")[0]}</span>
                </div>
                <button onClick={handleLogout} style={{background:"none",border:"1px solid #ebebeb",borderRadius:100,color:"#666",padding:"6px 16px",fontSize:13,cursor:"pointer"}}>Sign out</button>
              </div>
            ):(
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:"none",border:"1px solid #ebebeb",borderRadius:100,color:"#1a1a1a",padding:"8px 20px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Log in</button>
                <button onClick={()=>{setAuthMode("register");setShowAuth(true);}} style={{background:"#FFC244",border:"none",borderRadius:100,color:"white",padding:"8px 20px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(255,194,68,0.35)"}}>Sign up</button>
              </div>
            )}
            <button onClick={()=>setCartOpen(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:cartCount>0?"#1a1a1a":"white",border:"1px solid #ebebeb",borderRadius:100,cursor:"pointer",color:cartCount>0?"white":"#1a1a1a",fontSize:14,fontWeight:600,transition:"all 0.2s"}}>
              🛒 {cartCount>0?`${cartCount} · Ksh ${cartTotal.toLocaleString()}`:"Cart"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO (shows only before search) ── */}
      {!hasSearched && (
        <>
          {/* Big hero */}
          <div style={{background:"#1a1a1a",minHeight:"85vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}>
            {/* Background food image */}
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.35}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(26,26,26,0.95) 40%,rgba(26,26,26,0.5))"}}/>

            <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",position:"relative",zIndex:1,width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
              <div>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,194,68,0.15)",border:"1px solid rgba(255,194,68,0.3)",borderRadius:100,padding:"6px 16px",marginBottom:24}}>
                  <span style={{fontSize:14}}>🇰🇪</span>
                  <span style={{color:"#FFC244",fontSize:13,fontWeight:600,letterSpacing:0.5}}>DELIVERING ACROSS KENYA</span>
                </div>
                <h1 style={{fontSize:"clamp(36px,5vw,64px)",fontWeight:900,color:"white",lineHeight:1.05,letterSpacing:-2,margin:"0 0 16px"}}>
                  Whatever you want,<br/>
                  <span style={{color:"#FFC244"}}>delivered fast.</span>
                </h1>
                <p style={{color:"rgba(255,255,255,0.65)",fontSize:17,lineHeight:1.7,margin:"0 0 36px"}}>
                  Food, groceries, and more from the best restaurants in your city. Pay with M-Pesa or cash.
                </p>

                {/* Location + city search */}
                <div style={{background:"white",borderRadius:16,padding:6,display:"flex",gap:6,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",maxWidth:520}}>
                  <select value={city} onChange={e=>setCity(e.target.value)} style={{flex:1,padding:"12px 16px",border:"none",borderRadius:12,fontSize:15,color:"#1a1a1a",background:"#f9f9f9",outline:"none",cursor:"pointer"}}>
                    <option value="all">📍 All cities</option>
                    {CITIES.map(c=><option key={c} value={c}>📍 {c}</option>)}
                  </select>
                  <button onClick={()=>loadRestaurants()} style={{background:"#FFC244",border:"none",borderRadius:12,color:"white",padding:"12px 28px",fontSize:15,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 4px 14px rgba(255,194,68,0.4)"}}>
                    Find food →
                  </button>
                </div>

                <div style={{display:"flex",gap:20,marginTop:24,flexWrap:"wrap"}}>
                  {[["🏪","50+ restaurants"],["⚡","Fast delivery"],["📱","M-Pesa accepted"],["⭐","Top-rated"]].map(([icon,label])=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                      <span>{icon}</span>
                      <span style={{color:"rgba(255,255,255,0.65)",fontSize:13}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero food image */}
              <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" alt="Delicious food" style={{width:380,height:380,objectFit:"cover",borderRadius:"50%",border:"6px solid rgba(255,194,68,0.3)",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}/>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"20px 24px",overflowX:"auto"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <div style={{display:"flex",gap:10,flexWrap:"nowrap"}}>
                {CATEGORIES.map(c=>(
                  <button key={c.id} onClick={()=>{setCategory(c.id);loadRestaurants(city,c.id,search);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 20px",background:category===c.id?"#1a1a1a":"#f9f9f9",border:"none",borderRadius:16,cursor:"pointer",flexShrink:0,transition:"all 0.15s",minWidth:80}}>
                    <span style={{fontSize:24}}>{c.icon}</span>
                    <span style={{fontSize:12,fontWeight:600,color:category===c.id?"white":"#1a1a1a",whiteSpace:"nowrap"}}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── HOW IT WORKS VIDEO SECTION ── */}
          <div style={{background:"#f9f9f9",padding:"80px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:48}}>
                <span style={{background:"#FFC24420",color:"#e6a800",borderRadius:100,padding:"6px 16px",fontSize:13,fontWeight:600,letterSpacing:0.5}}>HOW IT WORKS</span>
                <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#1a1a1a",letterSpacing:-1,margin:"14px 0 12px"}}>Order in 3 simple steps</h2>
                <p style={{color:"#666",fontSize:16,maxWidth:500,margin:"0 auto"}}>Get food from your favourite restaurants delivered to your door in minutes</p>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
                {/* Video player */}
                <div style={{position:"relative",borderRadius:24,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",background:"#1a1a1a",aspectRatio:"16/9"}}>
                  <VideoPlayer />
                </div>

                {/* Steps */}
                <div style={{display:"flex",flexDirection:"column",gap:24}}>
                  {HOW_STEPS.slice(0,4).map((step,i)=>(
                    <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",padding:"18px 20px",background:"white",borderRadius:16,border:"1px solid #f0f0f0",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                      <div style={{width:48,height:48,borderRadius:14,background:"#FFC24420",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{step.icon}</div>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                          <span style={{background:"#FFC244",color:"white",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</span>
                          <p style={{fontWeight:700,fontSize:15,color:"#1a1a1a",margin:0}}>{step.title}</p>
                        </div>
                        <p style={{color:"#888",fontSize:13,margin:0,lineHeight:1.5}}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── WHY TRAMPET SECTION ── */}
          <div style={{background:"white",padding:"80px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto",textAlign:"center"}}>
              <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#1a1a1a",letterSpacing:-1,margin:"0 0 14px"}}>Why choose Trampet?</h2>
              <p style={{color:"#888",fontSize:16,maxWidth:500,margin:"0 auto 56px"}}>The food delivery platform built for Kenya</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
                {[
                  ["🍽️","50+ Restaurants","From local favourites to top chains across Nairobi, Mombasa, Kisumu and beyond"],
                  ["⚡","Fast Delivery","Your order delivered in 25–45 minutes. Track it every step of the way"],
                  ["📱","Easy Payment","Pay with M-Pesa STK Push or cash on delivery — no card needed"],
                  ["⭐","Top Rated","Only the best restaurants with verified ratings from real customers"],
                  ["🔒","Safe & Secure","Your data and payments are protected at all times"],
                  ["🕐","Open Late","Many restaurants available late into the evening for those late-night cravings"],
                ].map(([icon,title,desc])=>(
                  <div key={title} style={{background:"#f9f9f9",borderRadius:20,padding:"32px 24px",textAlign:"center",border:"1px solid #f0f0f0",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.querySelector("h3").style.color="white";e.currentTarget.querySelector("p").style.color="rgba(255,255,255,0.6)";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.transform="translateY(0)";e.currentTarget.querySelector("h3").style.color="#1a1a1a";e.currentTarget.querySelector("p").style.color="#888";}}>
                    <div style={{fontSize:40,marginBottom:16}}>{icon}</div>
                    <h3 style={{fontSize:17,fontWeight:700,color:"#1a1a1a",margin:"0 0 8px",transition:"color 0.2s"}}>{title}</h3>
                    <p style={{color:"#888",fontSize:14,margin:0,lineHeight:1.6,transition:"color 0.2s"}}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CITIES SECTION ── */}
          <div style={{background:"#1a1a1a",padding:"80px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto",textAlign:"center"}}>
              <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"white",letterSpacing:-1,margin:"0 0 14px"}}>We deliver in these cities</h2>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:16,margin:"0 0 48px"}}>And expanding to more cities soon</p>
              <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                {CITIES.map((c,i)=>(
                  <button key={c} onClick={()=>{setCity(c);loadRestaurants(c,"all","");}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:100,padding:"14px 28px",color:"white",fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#FFC244";e.currentTarget.style.borderColor="#FFC244";e.currentTarget.style.color="#1a1a1a";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="white";}}>
                    <span style={{fontSize:20}}>📍</span>{c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── APP DOWNLOAD SECTION ── */}
          <div style={{background:"#FFC244",padding:"80px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
              <div>
                <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#1a1a1a",letterSpacing:-1,margin:"0 0 14px"}}>Better on the app</h2>
                <p style={{color:"rgba(0,0,0,0.6)",fontSize:16,lineHeight:1.7,margin:"0 0 28px"}}>Track your order in real-time, save your favourite restaurants and reorder with one tap. Download the Trampet app for the best experience.</p>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <button style={{background:"#1a1a1a",border:"none",borderRadius:12,padding:"12px 24px",color:"white",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>🍎</span><div style={{textAlign:"left"}}><p style={{margin:0,fontSize:10,opacity:0.7}}>Download on the</p><p style={{margin:0,fontWeight:700}}>App Store</p></div>
                  </button>
                  <button style={{background:"#1a1a1a",border:"none",borderRadius:12,padding:"12px 24px",color:"white",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>▶️</span><div style={{textAlign:"left"}}><p style={{margin:0,fontSize:10,opacity:0.7}}>Get it on</p><p style={{margin:0,fontWeight:700}}>Google Play</p></div>
                  </button>
                </div>
              </div>
              <div style={{textAlign:"center",fontSize:140}}>📱</div>
            </div>
          </div>

          {/* Footer */}
          <footer style={{background:"#111",padding:"48px 24px 28px"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:40}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"white",fontSize:16}}>T</div>
                    <span style={{color:"white",fontWeight:900,fontSize:20}}>trampet</span>
                  </div>
                  <p style={{color:"#666",fontSize:14,lineHeight:1.7,maxWidth:260}}>Food delivery across Kenya. Pay with M-Pesa or cash on delivery.</p>
                </div>
                {[["Company",["About us","Careers","Blog","Press"]],["Support",["Help centre","Contact us","FAQ","Safety"]],["Legal",["Terms","Privacy","Cookies","Compliance"]]].map(([title,links])=>(
                  <div key={title}>
                    <p style={{color:"white",fontWeight:700,fontSize:14,margin:"0 0 14px"}}>{title}</p>
                    {links.map(l=><p key={l} style={{color:"#666",fontSize:13,margin:"0 0 8px",cursor:"pointer"}} onMouseEnter={e=>e.target.style.color="#FFC244"} onMouseLeave={e=>e.target.style.color="#666"}>{l}</p>)}
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid #222",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <p style={{color:"#444",fontSize:13}}>© 2024 Trampet. All rights reserved.</p>
                <p style={{color:"#444",fontSize:13}}>Made with ❤️ for Kenya</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ── RESTAURANT LISTING (after search) ── */}
      {hasSearched && (
        <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px"}}>
          {/* Search bar */}
          <div style={{background:"#f9f9f9",border:"1px solid #ebebeb",borderRadius:16,padding:"12px 16px",display:"flex",gap:10,alignItems:"center",marginBottom:24}}>
            <select value={city} onChange={e=>{setCity(e.target.value);loadRestaurants(e.target.value,category,search);}} style={{padding:"8px 14px",border:"none",borderRadius:10,fontSize:14,background:"white",outline:"none",cursor:"pointer",border:"1px solid #ebebeb"}}>
              <option value="all">📍 All cities</option>
              {CITIES.map(c=><option key={c} value={c}>📍 {c}</option>)}
            </select>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadRestaurants()} placeholder="Search restaurants or cuisines..." style={{flex:1,padding:"8px 14px",border:"1px solid #ebebeb",borderRadius:10,fontSize:14,outline:"none"}}/>
            <button onClick={()=>loadRestaurants()} style={{background:"#FFC244",border:"none",borderRadius:10,color:"white",padding:"9px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Search</button>
            <button onClick={()=>{setHasSearched(false);setRestaurants([]);}} style={{background:"none",border:"1px solid #ebebeb",borderRadius:10,color:"#666",padding:"9px 16px",fontSize:13,cursor:"pointer"}}>← Home</button>
          </div>

          {/* Category pills */}
          <div style={{display:"flex",gap:8,flexWrap:"nowrap",overflowX:"auto",marginBottom:24,paddingBottom:4}}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>{setCategory(c.id);loadRestaurants(city,c.id,search);}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:category===c.id?"#1a1a1a":"white",border:`1px solid ${category===c.id?"#1a1a1a":"#ebebeb"}`,borderRadius:100,cursor:"pointer",flexShrink:0,color:category===c.id?"white":"#1a1a1a",fontSize:13,fontWeight:category===c.id?600:400}}>
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"80px 0"}}>
              <div style={{width:48,height:48,border:"3px solid #f0f0f0",borderTopColor:"#FFC244",borderRadius:"50%",margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
              <p style={{color:"#888",fontSize:15}}>Finding restaurants...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : restaurants.length===0 ? (
            <div style={{textAlign:"center",padding:"80px 0"}}>
              <div style={{fontSize:64,marginBottom:16}}>🍽️</div>
              <h3 style={{fontSize:22,fontWeight:700,color:"#1a1a1a",marginBottom:8}}>No restaurants found</h3>
              <p style={{color:"#888",fontSize:15}}>Try a different city or search term</p>
            </div>
          ) : (
            <>
              <p style={{color:"#888",fontSize:14,marginBottom:20}}>{restaurants.length} restaurant{restaurants.length!==1?"s":""} available</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
                {restaurants.map(r=><RestaurantCard key={r.id} r={r} onSelect={setSelected}/>)}
              </div>
            </>
          )}
        </div>
      )}

      {selected && <RestaurantModal r={selected} cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClose={()=>setSelected(null)} onCheckout={()=>{setSelected(null);setPage("checkout");}} cartTotal={cartTotal} cartCount={cartCount}/>}
      {cartOpen && <CartSidebar cart={cart} total={cartTotal} onClose={()=>setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onCheckout={()=>{setCartOpen(false);setPage("checkout");}}/>}
      {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} onClose={()=>setShowAuth(false)}/>}
    </div>
  );
}

function VideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  function toggle() {
    if (videoRef.current) {
      if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
      setPlaying(!playing);
    }
  }

  return (
    <div style={{position:"relative",width:"100%",height:"100%",background:"#1a1a1a",cursor:"pointer"}} onClick={toggle}>
      {/* Embedded YouTube explainer video - using a food delivery explainer */}
      <iframe
        width="100%" height="100%"
        src="https://www.youtube.com/embed/V-mP3VU0DCg?autoplay=0&controls=1&rel=0&modestbranding=1"
        title="How to order on Trampet"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
      />
      {!playing && (
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a1a1a,#333)",zIndex:1,pointerEvents:"none"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:"0 8px 32px rgba(255,194,68,0.5)"}}>
            <span style={{fontSize:32,marginLeft:6}}>▶</span>
          </div>
          <p style={{color:"white",fontWeight:700,fontSize:16,margin:"0 0 6px"}}>Watch how it works</p>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>2 min · Step by step guide</p>
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ r, onSelect }) {
  const fallback = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80";
  const isOpen = r.open !== false && r.status === "active";
  return (
    <div onClick={()=>isOpen&&onSelect(r)} style={{background:"white",borderRadius:20,border:"1px solid #f0f0f0",overflow:"hidden",cursor:isOpen?"pointer":"not-allowed",opacity:isOpen?1:0.65,transition:"all 0.25s",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}} onMouseEnter={e=>{if(isOpen){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.12)";}}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)";}}>
      <div style={{position:"relative",height:190,overflow:"hidden"}}>
        <img src={r.cover_url||fallback} alt={r.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.05)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent 60%)"}}/>
        {!isOpen&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"white",borderRadius:100,padding:"6px 18px",fontSize:13,fontWeight:700,color:"#888",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>⏸ Closed</span></div>}
        {r.rating>0&&<div style={{position:"absolute",top:12,right:12,background:"white",borderRadius:100,padding:"4px 10px",display:"flex",alignItems:"center",gap:4,boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}><span style={{fontSize:12}}>⭐</span><span style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{Number(r.rating).toFixed(1)}</span></div>}
        <div style={{position:"absolute",bottom:12,left:14}}>
          <span style={{background:"rgba(0,0,0,0.6)",color:"white",borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:500,backdropFilter:"blur(4px)"}}>{r.category}</span>
        </div>
      </div>
      <div style={{padding:"14px 16px 18px"}}>
        <h3 style={{fontSize:16,fontWeight:800,color:"#1a1a1a",margin:"0 0 4px"}}>{r.name}</h3>
        <p style={{color:"#888",fontSize:13,margin:"0 0 12px"}}>{r.area||""}{r.area&&r.city?", ":""}{r.city}</p>
        <div style={{display:"flex",gap:0,background:"#f9f9f9",borderRadius:10,overflow:"hidden"}}>
          {[["🕐",r.estimated_time||r.deliveryTime||"25–40 min"],["🛵",`Ksh ${r.delivery_fee||r.deliveryFee||80}`],["📋",`Min ${r.min_order||r.minOrder||200}`]].map(([icon,val],i)=>(
            <div key={icon} style={{flex:1,padding:"8px",textAlign:"center",borderRight:i<2?"1px solid #ebebeb":"none"}}>
              <div style={{fontSize:13,marginBottom:2}}>{icon}</div>
              <div style={{fontSize:11,color:"#888",fontWeight:500,lineHeight:1.2}}>{val}</div>
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

  useEffect(()=>{
    apiFetch("GET",`/api/restaurants/${r.id}`).then(d=>{setMenu(d.menu||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[r.id]);

  const cats=[...new Set(menu.map(i=>i.category))];
  const shown=cat?menu.filter(i=>i.category===cat):menu;
  const popular=menu.filter(i=>i.is_popular&&i.is_available!==false);
  const getQty=id=>cart.find(i=>i.id===id)?.qty||0;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:780,maxHeight:"92vh",overflow:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{position:"relative",height:220}}>
          <img src={r.cover_url||fallback} alt={r.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent 50%)"}}/>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"white",border:"none",borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>✕</button>
          <div style={{position:"absolute",bottom:18,left:22}}>
            <h2 style={{color:"white",fontSize:28,fontWeight:900,margin:"0 0 6px",textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{r.name}</h2>
            <div style={{display:"flex",gap:16}}>
              <span style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>📍 {r.area}, {r.city}</span>
              {r.rating>0&&<span style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>⭐ {Number(r.rating).toFixed(1)}</span>}
              <span style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>🕐 {r.estimated_time||"25–40 min"}</span>
            </div>
          </div>
        </div>

        <div style={{padding:"20px 24px 120px"}}>
          {loading?<div style={{textAlign:"center",padding:"40px 0",color:"#888"}}>Loading menu...</div>:(
            <>
              {!cat&&popular.length>0&&(
                <div style={{marginBottom:28}}>
                  <h3 style={{fontSize:17,fontWeight:800,color:"#1a1a1a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:8}}>🔥 Most popular</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                    {popular.map(item=>{
                      const qty=getQty(item.id);
                      return (
                        <div key={item.id} style={{background:"#f9f9f9",border:"1px solid #f0f0f0",borderRadius:16,padding:14}}>
                          <span style={{background:"#FFC244",color:"white",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:100}}>Popular</span>
                          <p style={{fontWeight:700,fontSize:14,color:"#1a1a1a",margin:"8px 0 4px"}}>{item.name}</p>
                          <p style={{color:"#888",fontSize:12,margin:"0 0 10px",lineHeight:1.4}}>{item.description}</p>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontWeight:800,fontSize:15,color:"#1a1a1a"}}>Ksh {item.price?.toLocaleString()}</span>
                            <QtyCtrl qty={qty} onAdd={()=>onAdd(item,r)} onRemove={()=>onRemove(item.id)}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20,paddingBottom:16,borderBottom:"1px solid #f0f0f0"}}>
                <CatPill label="All" active={!cat} onClick={()=>setCat(null)}/>
                {cats.map(c=><CatPill key={c} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {shown.filter(i=>i.is_available!==false).map(item=>{
                  const qty=getQty(item.id);
                  return (
                    <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"white",borderRadius:14,border:"1px solid #f5f5f5",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#FFC244"} onMouseLeave={e=>e.currentTarget.style.borderColor="#f5f5f5"}>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:700,fontSize:14,color:"#1a1a1a",margin:"0 0 4px"}}>{item.name}</p>
                        <p style={{color:"#aaa",fontSize:12,margin:"0 0 6px",lineHeight:1.4}}>{item.description}</p>
                        <span style={{fontWeight:800,fontSize:15,color:"#1a1a1a"}}>Ksh {item.price?.toLocaleString()}</span>
                      </div>
                      <div style={{marginLeft:20,flexShrink:0}}><QtyCtrl qty={qty} onAdd={()=>onAdd(item,r)} onRemove={()=>onRemove(item.id)}/></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {cartCount>0&&(
          <div style={{position:"sticky",bottom:0,padding:"16px 24px",background:"white",borderTop:"1px solid #f0f0f0",boxShadow:"0 -4px 16px rgba(0,0,0,0.06)"}}>
            <button onClick={onCheckout} style={{width:"100%",background:"#FFC244",border:"none",borderRadius:14,padding:"16px 24px",color:"white",fontSize:16,fontWeight:800,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 4px 16px rgba(255,194,68,0.4)"}}>
              <span style={{background:"rgba(255,255,255,0.3)",borderRadius:8,padding:"3px 12px",fontSize:14}}>{cartCount}</span>
              <span>Go to checkout</span>
              <span>Ksh {cartTotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QtyCtrl({ qty, onAdd, onRemove }) {
  if (qty===0) return <button onClick={onAdd} style={{width:36,height:36,borderRadius:10,background:"#FFC244",border:"none",color:"white",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(255,194,68,0.4)"}}>+</button>;
  return <div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={onRemove} style={{width:32,height:32,borderRadius:8,background:"#f0f0f0",border:"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><span style={{fontWeight:800,fontSize:15,minWidth:20,textAlign:"center"}}>{qty}</span><button onClick={onAdd} style={{width:32,height:32,borderRadius:8,background:"#FFC244",border:"none",color:"white",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div>;
}
function CatPill({ label, active, onClick }) {
  return <button onClick={onClick} style={{padding:"8px 18px",borderRadius:100,border:`1.5px solid ${active?"#1a1a1a":"#ebebeb"}`,background:active?"#1a1a1a":"white",color:active?"white":"#1a1a1a",fontSize:13,fontWeight:active?700:400,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>;
}

function CartSidebar({ cart, total, onClose, onAdd, onRemove, onCheckout }) {
  const grand=total+80;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(420px,100vw)",background:"white",zIndex:201,display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,0.12)"}}>
        <div style={{padding:"22px 24px",borderBottom:"1px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1a1a1a"}}>Your order</h2>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
          {cart.length===0?<div style={{textAlign:"center",padding:"80px 0",color:"#aaa"}}><div style={{fontSize:56,marginBottom:16}}>🛒</div><h3 style={{fontSize:18,fontWeight:600,color:"#888",marginBottom:8}}>Your cart is empty</h3><p style={{fontSize:14}}>Add items to get started</p></div>:
          <>{cart[0]&&<p style={{fontSize:13,color:"#aaa",marginBottom:12}}>From {cart[0].restaurantName}</p>}
          {cart.map(item=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:"1px solid #f9f9f9"}}>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:14,color:"#1a1a1a",margin:"0 0 3px"}}>{item.name}</p>
                <p style={{color:"#aaa",fontSize:12,margin:0}}>Ksh {item.price?.toLocaleString()} each</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>onRemove(item.id)} style={{width:28,height:28,borderRadius:6,background:"#f5f5f5",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontWeight:800,fontSize:14,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                <button onClick={()=>onAdd(item,{id:item.restaurantId})} style={{width:28,height:28,borderRadius:6,background:"#FFC244",border:"none",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              <span style={{fontWeight:800,fontSize:14,color:"#1a1a1a",minWidth:80,textAlign:"right"}}>Ksh {(item.price*item.qty)?.toLocaleString()}</span>
            </div>
          ))}</>}
        </div>
        {cart.length>0&&<div style={{padding:"20px 24px",borderTop:"1px solid #f0f0f0"}}>
          {[["Subtotal",`Ksh ${total.toLocaleString()}`],["Delivery","Ksh 80"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#888",fontSize:14}}>{k}</span><span style={{fontSize:14}}>{v}</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid #f0f0f0",marginBottom:18}}><span style={{fontWeight:800,fontSize:16}}>Total</span><span style={{fontWeight:800,fontSize:16,color:"#FFC244"}}>Ksh {grand.toLocaleString()}</span></div>
          <button onClick={onCheckout} style={{width:"100%",background:"#FFC244",border:"none",borderRadius:14,padding:"16px",color:"white",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(255,194,68,0.35)"}}>Checkout →</button>
        </div>}
      </div>
    </>
  );
}

function CheckoutPage({ cart, total, user, onBack, onPlace }) {
  const [name,setName]=useState(user?.name||"");const [address,setAddress]=useState("");const [city,setCity]=useState("");const [phone,setPhone]=useState(user?.phone||"");const [payment,setPayment]=useState("mpesa");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const grand=total+80;
  async function submit() {
    if(!name||!address||!city||!phone){setError("Please fill in all fields");return;}
    setLoading(true);setError("");
    try{await onPlace({name,address,city,phone,payment});}catch(e){setError(e.message);}finally{setLoading(false);}
  }
  return (
    <div style={{minHeight:"100vh",background:"#f9f9f9",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"0 24px",height:64,display:"flex",alignItems:"center",gap:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#888",fontSize:14,cursor:"pointer"}}>← Back</button>
        <span style={{fontSize:18,fontWeight:800,color:"#1a1a1a"}}>Checkout</span>
      </nav>
      <div style={{maxWidth:560,margin:"0 auto",padding:"32px 24px"}}>
        {error&&<div style={{background:"#fff0f0",border:"1px solid #ffd0d0",borderRadius:12,padding:"12px 16px",color:"#cc0000",fontSize:14,marginBottom:20}}>{error}</div>}
        {[{title:"📍 Delivery details",content:<><Fin label="Full name" value={name} onChange={setName} ph="Jane Wanjiku"/><Fin label="Delivery address" value={address} onChange={setAddress} ph="Street, estate, building..."/><Fin label="Phone number" value={phone} onChange={setPhone} ph="0712 345 678" type="tel"/>
        <div style={{marginTop:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:6}}>City</label><select value={city} onChange={e=>setCity(e.target.value)} style={{width:"100%",padding:"12px 14px",border:"1px solid #ebebeb",borderRadius:12,fontSize:14,outline:"none",background:"white"}}><option value="">Select city...</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div></>},
        {title:"💳 Payment",content:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[["mpesa","📱","M-Pesa","STK push to phone"],["cash","💵","Cash","Pay on delivery"]].map(([val,icon,label,sub])=><button key={val} onClick={()=>setPayment(val)} style={{background:payment===val?"#1a1a1a":"#f9f9f9",border:`2px solid ${payment===val?"#1a1a1a":"#ebebeb"}`,borderRadius:16,padding:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}><div style={{fontSize:28,marginBottom:8}}>{icon}</div><p style={{fontWeight:700,fontSize:14,color:payment===val?"white":"#1a1a1a",margin:"0 0 3px"}}>{label}</p><p style={{color:payment===val?"rgba(255,255,255,0.6)":"#888",fontSize:12,margin:0}}>{sub}</p></button>)}</div>},
        {title:"🧾 Order summary",content:<>{cart.map(item=><div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{color:"#555",fontSize:14}}>{item.name} ×{item.qty}</span><span style={{fontWeight:700,fontSize:14}}>{(item.price*item.qty).toLocaleString()}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",paddingTop:12}}><span style={{fontWeight:800,fontSize:16}}>Total</span><span style={{fontWeight:800,fontSize:16,color:"#FFC244"}}>Ksh {grand.toLocaleString()}</span></div></>}
        ].map(section=>(
          <div key={section.title} style={{background:"white",border:"1px solid #f0f0f0",borderRadius:18,padding:"22px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <h3 style={{fontSize:15,fontWeight:800,color:"#1a1a1a",margin:"0 0 18px"}}>{section.title}</h3>
            {section.content}
          </div>
        ))}
        <button onClick={submit} disabled={loading} style={{width:"100%",background:loading?"#ffd780":"#FFC244",border:"none",borderRadius:16,padding:"18px",color:"white",fontSize:16,fontWeight:800,cursor:loading?"not-allowed":"pointer",boxShadow:"0 4px 20px rgba(255,194,68,0.4)"}}>
          {loading?"⏳ Placing your order...`":` ✓ Place order · Ksh ${grand.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

function Fin({ label, value, onChange, ph, type="text" }) {
  return <div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:6}}>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={ph} style={{width:"100%",padding:"12px 14px",border:"1px solid #ebebeb",borderRadius:12,fontSize:14,outline:"none"}} onFocus={e=>e.target.style.borderColor="#FFC244"} onBlur={e=>e.target.style.borderColor="#ebebeb"}/></div>;
}

function ConfirmedPage({ order, onHome }) {
  const [stage,setStage]=useState(0);
  useEffect(()=>{const t=[setTimeout(()=>setStage(1),3000),setTimeout(()=>setStage(2),8000),setTimeout(()=>setStage(3),14000)];return()=>t.forEach(clearTimeout);},[]);
  const stages=[{icon:"✅",label:"Order confirmed"},{icon:"👨‍🍳",label:"Restaurant preparing"},{icon:"🛵",label:"Rider on the way"},{icon:"🎉",label:"Delivered!"}];
  return (
    <div style={{minHeight:"100vh",background:"#f9f9f9",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{maxWidth:460,width:"100%",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:18,background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontWeight:900,fontSize:26,color:"white",boxShadow:"0 4px 20px rgba(255,194,68,0.4)"}}>T</div>
        <div style={{background:"white",border:"1px solid #f0f0f0",borderRadius:24,padding:"32px 28px",marginBottom:14,boxShadow:"0 8px 32px rgba(0,0,0,0.06)"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"#f0fdf4",border:"3px solid #86efac",margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>✅</div>
          <h2 style={{fontSize:26,fontWeight:900,color:"#1a1a1a",margin:"0 0 6px"}}>Order placed!</h2>
          <p style={{color:"#888",fontSize:14,margin:"0 0 22px"}}>#{order?.id}</p>
          <div style={{background:"#FFC24415",border:"1px solid #FFC24440",borderRadius:14,padding:"16px",marginBottom:24}}>
            <p style={{color:"#b38600",fontSize:12,fontWeight:600,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:0.5}}>Estimated arrival</p>
            <p style={{color:"#1a1a1a",fontSize:36,fontWeight:900,margin:0,letterSpacing:-1}}>25–40 min</p>
          </div>
          {stages.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<3?"1px solid #f9f9f9":"none",opacity:i<=stage?1:0.25,transition:"opacity 0.6s"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:i<stage?"#f0fdf4":i===stage?"#FFC24420":"#f9f9f9",border:`2px solid ${i<stage?"#16a34a":i===stage?"#FFC244":"#ebebeb"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{i<stage?"✓":s.icon}</div>
              <span style={{fontSize:14,fontWeight:i===stage?700:400,color:i===stage?"#1a1a1a":"#888"}}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onHome} style={{width:"100%",background:"white",border:"1px solid #ebebeb",borderRadius:14,padding:"14px",color:"#888",fontSize:14,cursor:"pointer"}}>← Back to restaurants</button>
      </div>
    </div>
  );
}

function AuthModal({ mode, setMode, onLogin, onRegister, onClose }) {
  const [name,setName]=useState("");const [phone,setPhone]=useState("");const [password,setPassword]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  async function handle(){setLoading(true);setError("");try{mode==="login"?await onLogin(phone,password):await onRegister(name,phone,password);}catch(e){setError(e.message);}finally{setLoading(false);}}
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(6px)"}}>
      <div style={{background:"white",borderRadius:24,padding:"36px 32px",width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:34,height:34,borderRadius:10,background:"#FFC244",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"white",fontSize:16}}>T</div><span style={{fontWeight:900,fontSize:18,color:"#1a1a1a"}}>trampet</span></div>
            <h2 style={{fontSize:22,fontWeight:900,color:"#1a1a1a",margin:"0 0 4px"}}>{mode==="login"?"Welcome back!":"Create account"}</h2>
            <p style={{color:"#888",fontSize:13,margin:0}}>{mode==="login"?"Sign in to order food":"Join thousands of happy customers"}</p>
          </div>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {error&&<div style={{background:"#fff0f0",border:"1px solid #ffd0d0",borderRadius:10,padding:"10px 14px",color:"#cc0000",fontSize:13,marginBottom:16}}>{error}</div>}
        {mode==="register"&&<Fin label="Full name" value={name} onChange={setName} ph="Jane Wanjiku"/>}
        <Fin label="Phone number" value={phone} onChange={setPhone} ph="0712 345 678" type="tel"/>
        <Fin label="Password" value={password} onChange={setPassword} ph="••••••••" type="password"/>
        <button onClick={handle} disabled={loading} style={{width:"100%",background:loading?"#ffd780":"#FFC244",border:"none",borderRadius:14,padding:"15px",color:"white",fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer",marginBottom:16,boxShadow:"0 4px 16px rgba(255,194,68,0.35)"}}>
          {loading?"Please wait...":mode==="login"?"Sign in":"Create account"}
        </button>
        <p style={{textAlign:"center",fontSize:13,color:"#888"}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>setMode(mode==="login"?"register":"login")} style={{color:"#FFC244",cursor:"pointer",fontWeight:700}}>{mode==="login"?"Sign up":"Sign in"}</span>
        </p>
      </div>
    </div>
  );
}
