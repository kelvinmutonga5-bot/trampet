export default function CartDrawer({ open, cart, total, onClose, onAdd, onRemove, onCheckout }) {
  const deliveryFee = 80;
  const grandTotal = total + (cart.length > 0 ? deliveryFee : 0);

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 200, backdropFilter: "blur(2px)"
        }} />
      )}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)",
        background: "#0f0f0f", borderLeft: "1px solid #1e1e1e",
        zIndex: 201, transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #1e1e1e",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 20,
            fontWeight: 700, color: "#fff", margin: 0
          }}>Your cart</h2>
          <button onClick={onClose} style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 8, color: "#666", width: 32, height: 32,
            cursor: "pointer", fontSize: 16, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "60%", color: "#333"
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <p style={{ color: "#444", fontSize: 15 }}>Your cart is empty</p>
              <p style={{ color: "#333", fontSize: 13 }}>Add items from a restaurant to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Restaurant grouping label */}
              {cart[0] && (
                <p style={{ color: "#555", fontSize: 12, margin: "0 0 4px" }}>
                  From {cart[0].restaurantName}
                </p>
              )}
              {cart.map(item => (
                <div key={item.id} style={{
                  background: "#141414", border: "1px solid #1e1e1e",
                  borderRadius: 12, padding: "12px 16px",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 12
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{item.name}</p>
                    <p style={{ color: "#666", fontSize: 13, margin: 0 }}>Ksh {item.price.toLocaleString()} each</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => onRemove(item.id)} style={{
                      background: "#1e1e1e", border: "1px solid #2a2a2a",
                      borderRadius: 6, color: "#fff", width: 28, height: 28,
                      cursor: "pointer", fontSize: 16, display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>−</button>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, minWidth: 14, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => onAdd(item, { id: item.restaurantId, name: item.restaurantName })} style={{
                      background: "#ff6b2b", border: "none",
                      borderRadius: 6, color: "#fff", width: 28, height: 28,
                      cursor: "pointer", fontSize: 16, display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>+</button>
                  </div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, minWidth: 70, textAlign: "right" }}>
                    Ksh {(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #1e1e1e" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#666", fontSize: 14 }}>Subtotal</span>
                <span style={{ color: "#ccc", fontSize: 14 }}>Ksh {total.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#666", fontSize: 14 }}>Delivery fee</span>
                <span style={{ color: "#ccc", fontSize: 14 }}>Ksh {deliveryFee}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #1e1e1e" }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Total</span>
                <span style={{ color: "#ff6b2b", fontSize: 16, fontWeight: 700 }}>Ksh {grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={onCheckout} style={{
              width: "100%", background: "#ff6b2b", border: "none",
              borderRadius: 12, padding: "16px", color: "#fff",
              fontSize: 16, fontWeight: 700, cursor: "pointer"
            }}>
              Proceed to checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
