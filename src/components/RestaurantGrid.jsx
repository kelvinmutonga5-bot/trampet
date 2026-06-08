export default function RestaurantGrid({ restaurants, onSelect }) {
  if (restaurants.length === 0) {
    return (
      <div style={{
        background: "#0d0d0d", minHeight: "40vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "#444", padding: 40
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#555" }}>No restaurants found</p>
        <p style={{ fontSize: 14, color: "#333" }}>Try a different city or cuisine</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#444", fontSize: 13, marginBottom: 24 }}>
          {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} available
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20
        }}>
          {restaurants.map(r => (
            <RestaurantCard key={r.id} restaurant={r} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant: r, onSelect }) {
  return (
    <div
      onClick={() => r.open && onSelect(r)}
      style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderRadius: 16, overflow: "hidden",
        cursor: r.open ? "pointer" : "not-allowed",
        opacity: r.open ? 1 : 0.6,
        transition: "transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={e => { if (r.open) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#ff6b2b44"; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1e1e1e"; }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={r.image} alt={r.name} style={{
          width: "100%", height: "100%", objectFit: "cover"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #111 0%, transparent 60%)"
        }} />
        {!r.open && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{
              background: "#1a1a1a", border: "1px solid #333",
              borderRadius: 100, padding: "6px 16px",
              color: "#888", fontSize: 13, fontWeight: 600
            }}>Closed now</span>
          </div>
        )}
        {/* Tags */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          display: "flex", gap: 6, flexWrap: "wrap"
        }}>
          {r.tags.map(t => (
            <span key={t} style={{
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100, padding: "3px 10px",
              color: "#ccc", fontSize: 11, fontWeight: 500
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h3 style={{
              color: "#fff", fontSize: 17, fontWeight: 700,
              fontFamily: "'Syne', sans-serif", margin: "0 0 2px"
            }}>{r.name}</h3>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{r.area}, {r.city} · {r.category}</p>
          </div>
          <div style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 8, padding: "4px 10px",
            display: "flex", alignItems: "center", gap: 4,
            flexShrink: 0
          }}>
            <span style={{ fontSize: 12 }}>⭐</span>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.rating}</span>
            <span style={{ color: "#444", fontSize: 11 }}>({r.reviews})</span>
          </div>
        </div>

        <div style={{
          display: "flex", gap: 16, marginTop: 12,
          paddingTop: 12, borderTop: "1px solid #1e1e1e"
        }}>
          <Stat icon="🕐" label={r.deliveryTime} />
          <Stat icon="🛵" label={`Ksh ${r.deliveryFee} delivery`} />
          <Stat icon="📋" label={`Min Ksh ${r.minOrder}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: "#666", fontSize: 12 }}>{label}</span>
    </div>
  );
}
