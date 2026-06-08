import { cities, categories } from "../data/restaurants";

export default function HeroSection({ search, onSearch, cityFilter, onCityFilter, categoryFilter, onCategoryFilter }) {
  return (
    <div style={{
      background: "#0a0a0a",
      padding: "64px 24px 48px",
      textAlign: "center"
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{
          display: "inline-block",
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 100, padding: "6px 16px",
          fontSize: 12, color: "#ff6b2b", fontWeight: 600,
          letterSpacing: 1, textTransform: "uppercase",
          marginBottom: 24
        }}>
          Food delivery across Kenya
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 800, color: "#fff",
          lineHeight: 1.05, letterSpacing: -2,
          margin: "0 0 16px"
        }}>
          Order food from<br />
          <span style={{
            background: "linear-gradient(90deg, #ff6b2b, #ff3d00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>the best spots</span> near you
        </h1>

        <p style={{ color: "#666", fontSize: 16, margin: "0 0 40px", lineHeight: 1.6 }}>
          Restaurants across Nairobi, Mombasa, Kisumu, Nakuru and beyond.
          Pay with M-Pesa or cash on delivery.
        </p>

        {/* Search bar */}
        <div style={{
          background: "#141414", border: "1px solid #2a2a2a",
          borderRadius: 14, display: "flex", alignItems: "center",
          padding: "4px 4px 4px 18px", marginBottom: 20, gap: 8
        }}>
          <span style={{ fontSize: 18, opacity: 0.4 }}>🔍</span>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, or cities..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 15, padding: "10px 0"
            }}
          />
          {search && (
            <button onClick={() => onSearch("")} style={{
              background: "#2a2a2a", border: "none", borderRadius: 8,
              color: "#999", padding: "8px 12px", cursor: "pointer", fontSize: 12
            }}>Clear</button>
          )}
        </div>

        {/* City filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
          {["all", ...cities].map(c => (
            <button key={c} onClick={() => onCityFilter(c)} style={{
              background: cityFilter === c ? "#ff6b2b" : "#141414",
              border: `1px solid ${cityFilter === c ? "#ff6b2b" : "#2a2a2a"}`,
              borderRadius: 100, padding: "7px 16px",
              color: cityFilter === c ? "#fff" : "#888",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s"
            }}>
              {c === "all" ? "All cities" : c}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["all", ...categories].map(c => (
            <button key={c} onClick={() => onCategoryFilter(c)} style={{
              background: categoryFilter === c ? "#1a1a1a" : "transparent",
              border: `1px solid ${categoryFilter === c ? "#ff6b2b" : "#1e1e1e"}`,
              borderRadius: 100, padding: "6px 14px",
              color: categoryFilter === c ? "#ff6b2b" : "#555",
              fontSize: 12, cursor: "pointer", transition: "all 0.15s"
            }}>
              {c === "all" ? "All cuisines" : c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
