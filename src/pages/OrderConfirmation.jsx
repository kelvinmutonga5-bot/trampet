import { useState, useEffect } from "react";

const STAGES = [
  { icon: "✅", label: "Order confirmed", desc: "We've received your order" },
  { icon: "👨‍🍳", label: "Preparing your food", desc: "The restaurant is cooking" },
  { icon: "🛵", label: "Rider on the way", desc: "Your rider has picked up" },
  { icon: "📍", label: "Almost there", desc: "Arriving in a few minutes" },
];

export default function OrderConfirmation({ order, onHome }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 3000),
      setTimeout(() => setStage(2), 7000),
      setTimeout(() => setStage(3), 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      background: "#0d0d0d", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24
    }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #ff6b2b, #ff3d00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff"
          }}>T</div>
          <p style={{ color: "#444", fontSize: 13 }}>trampet</p>
        </div>

        {/* Confirmation */}
        <div style={{
          background: "#111", border: "1px solid #1e1e1e",
          borderRadius: 20, padding: "32px 28px", marginBottom: 20
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#0a2a0a", border: "2px solid #1d6a1d",
            margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28
          }}>✅</div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 24,
            fontWeight: 800, color: "#fff", margin: "0 0 8px"
          }}>Order placed!</h1>
          <p style={{ color: "#555", fontSize: 14, margin: "0 0 20px" }}>
            Order #{order.id} · {order.placedAt}
          </p>

          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "14px 20px", marginBottom: 24
          }}>
            <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Estimated arrival</p>
            <p style={{ color: "#ff6b2b", fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "'Syne', sans-serif" }}>
              {order.eta}
            </p>
          </div>

          {/* Live tracker */}
          <div style={{ marginBottom: 20 }}>
            {STAGES.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "10px 0",
                borderBottom: i < STAGES.length - 1 ? "1px solid #1a1a1a" : "none",
                opacity: i <= stage ? 1 : 0.3,
                transition: "opacity 0.5s"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: i === stage ? "#ff6b2b22" : i < stage ? "#0a2a0a" : "#1a1a1a",
                  border: `2px solid ${i === stage ? "#ff6b2b" : i < stage ? "#1d6a1d" : "#2a2a2a"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16
                }}>{i < stage ? "✓" : s.icon}</div>
                <div style={{ textAlign: "left" }}>
                  <p style={{
                    color: i <= stage ? "#fff" : "#444",
                    fontSize: 14, fontWeight: 600, margin: "0 0 2px"
                  }}>{s.label}</p>
                  <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{s.desc}</p>
                </div>
                {i === stage && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: 3, paddingTop: 10 }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: "#ff6b2b",
                        animation: `pulse 1s ease-in-out ${d * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{
            background: "#0d0d0d", borderRadius: 10,
            padding: "12px 16px", textAlign: "left", marginBottom: 4
          }}>
            <p style={{ color: "#555", fontSize: 11, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>Delivering to</p>
            <p style={{ color: "#ccc", fontSize: 14, margin: "0 0 2px", fontWeight: 500 }}>{order.name}</p>
            <p style={{ color: "#555", fontSize: 13, margin: 0 }}>{order.address}, {order.city}</p>
          </div>
        </div>

        {/* Payment info */}
        <div style={{
          background: "#111", border: "1px solid #1e1e1e",
          borderRadius: 14, padding: "16px 20px",
          marginBottom: 20, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ color: "#555", fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>Payment</p>
            <p style={{ color: "#ccc", fontSize: 14, fontWeight: 500, margin: 0 }}>
              {order.paymentMethod === "mpesa" ? `M-Pesa · ${order.phone}` : "Cash on delivery"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#555", fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>Total paid</p>
            <p style={{ color: "#ff6b2b", fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "'Syne', sans-serif" }}>
              Ksh {(order.total + 80).toLocaleString()}
            </p>
          </div>
        </div>

        <button onClick={onHome} style={{
          width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 12, padding: "14px", color: "#888",
          fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>
          Back to home
        </button>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
}
