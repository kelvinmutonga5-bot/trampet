import { useState } from "react";

export default function RestaurantPage({ restaurant: r, cart, onAdd, onRemove, onBack, onCheckout }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const categories = [...new Set(r.menu.map(i => i.category))];
  const filtered = activeCategory ? r.menu.filter(i => i.category === activeCategory) : r.menu;
  const popular = r.menu.filter(i => i.popular);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function getQty(itemId) {
    return cart.find(i => i.id === itemId)?.qty || 0;
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 20%, transparent 80%)" }} />
        <button onClick={onBack} style={{
          position: "absolute", top: 20, left: 20,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: 13
        }}>← Back</button>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 120px" }}>
        {/* Restaurant info */}
        <div style={{ marginTop: -40, marginBottom: 32, position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", flexWrap: "wrap", gap: 12
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontSize: 32,
                fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: -1
              }}>{r.name}</h1>
              <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
                {r.area}, {r.city} · {r.category}
              </p>
              <p style={{ color: "#555", fontSize: 13, margin: 0, maxWidth: 500 }}>{r.description}</p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <InfoBadge icon="⭐" text={`${r.rating} (${r.reviews})`} />
              <InfoBadge icon="🕐" text={r.deliveryTime} />
              <InfoBadge icon="🛵" text={`Ksh ${r.deliveryFee}`} />
            </div>
          </div>
        </div>

        {/* Popular items */}
        {popular.length > 0 && !activeCategory && (
          <div style={{ marginBottom: 36 }}>
            <SectionHeader title="Popular" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {popular.map(item => (
                <PopularCard key={item.id} item={item} qty={getQty(item.id)} onAdd={() => onAdd(item, r)} onRemove={() => onRemove(item.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <CatBtn label="All" active={!activeCategory} onClick={() => setActiveCategory(null)} />
          {categories.map(c => (
            <CatBtn key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
          ))}
        </div>

        {/* Menu items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(item => (
            <MenuItem key={item.id} item={item} qty={getQty(item.id)} onAdd={() => onAdd(item, r)} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, width: "calc(100% - 48px)", maxWidth: 500
        }}>
          <button onClick={onCheckout} style={{
            width: "100%", background: "#ff6b2b", border: "none",
            borderRadius: 14, padding: "16px 24px", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 8,
              padding: "2px 10px", color: "#fff", fontSize: 14, fontWeight: 700
            }}>{cartCount}</span>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>View Cart</span>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Ksh {cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function InfoBadge({ icon, text }) {
  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: "6px 12px",
      display: "flex", alignItems: "center", gap: 6
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: "#ccc", fontSize: 12, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h2 style={{
      fontFamily: "'Syne', sans-serif", fontSize: 20,
      fontWeight: 700, color: "#fff", margin: "0 0 16px",
      display: "flex", alignItems: "center", gap: 12
    }}>
      {title}
      <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
    </h2>
  );
}

function CatBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#ff6b2b" : "#141414",
      border: `1px solid ${active ? "#ff6b2b" : "#2a2a2a"}`,
      borderRadius: 100, padding: "7px 16px",
      color: active ? "#fff" : "#777",
      fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
    }}>{label}</button>
  );
}

function PopularCard({ item, qty, onAdd, onRemove }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e",
      borderRadius: 12, padding: 16
    }}>
      <p style={{ color: "#ff6b2b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", letterSpacing: 0.5 }}>
        Popular
      </p>
      <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{item.name}</p>
      <p style={{ color: "#555", fontSize: 12, margin: "0 0 12px", lineHeight: 1.4 }}>{item.desc}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700 }}>Ksh {item.price.toLocaleString()}</span>
        <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} />
      </div>
    </div>
  );
}

function MenuItem({ item, qty, onAdd, onRemove }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e",
      borderRadius: 12, padding: "16px 18px",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", gap: 16
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 3px" }}>{item.name}</p>
        <p style={{ color: "#555", fontSize: 13, margin: "0 0 8px", lineHeight: 1.4 }}>{item.desc}</p>
        <span style={{ color: "#ccc", fontWeight: 700, fontSize: 14 }}>Ksh {item.price.toLocaleString()}</span>
      </div>
      <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} />
    </div>
  );
}

function QtyControl({ qty, onAdd, onRemove }) {
  if (qty === 0) {
    return (
      <button onClick={onAdd} style={{
        background: "#ff6b2b", border: "none", borderRadius: 8,
        color: "#fff", width: 36, height: 36, fontSize: 20,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>+</button>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <button onClick={onRemove} style={{
        background: "#1a1a1a", border: "1px solid #333", borderRadius: 8,
        color: "#fff", width: 32, height: 32, fontSize: 18,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
      }}>−</button>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, minWidth: 16, textAlign: "center" }}>{qty}</span>
      <button onClick={onAdd} style={{
        background: "#ff6b2b", border: "none", borderRadius: 8,
        color: "#fff", width: 32, height: 32, fontSize: 18,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
      }}>+</button>
    </div>
  );
}
