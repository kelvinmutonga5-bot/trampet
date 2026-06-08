export default function Header({ cartCount, cartTotal, onCartClick, onHome, currentPage }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#0a0a0a", borderBottom: "1px solid #1e1e1e",
      padding: "0 24px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <button onClick={onHome} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #ff6b2b, #ff3d00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: -0.5
        }}>T</div>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: -0.5
        }}>trampet</span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {currentPage !== "home" && (
          <button onClick={onHome} style={{
            background: "none", border: "1px solid #333", borderRadius: 8,
            color: "#999", fontSize: 13, padding: "6px 14px", cursor: "pointer"
          }}>
            All restaurants
          </button>
        )}
        <button onClick={onCartClick} style={{
          background: cartCount > 0 ? "#ff6b2b" : "#1a1a1a",
          border: "none", borderRadius: 10, cursor: "pointer",
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s"
        }}>
          <span style={{ fontSize: 16 }}>🛒</span>
          {cartCount > 0 ? (
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {cartCount} · Ksh {cartTotal.toLocaleString()}
            </span>
          ) : (
            <span style={{ color: "#666", fontSize: 13 }}>Cart</span>
          )}
        </button>
      </div>
    </header>
  );
}
