import { useState } from "react";

export default function CheckoutPage({ cart, total, onBack, onPlace }) {
  const deliveryFee = 80;
  const grandTotal = total + deliveryFee;
  const [payment, setPayment] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Please enter your name";
    if (!address.trim()) e.address = "Please enter delivery address";
    if (!city.trim()) e.city = "Please select your city";
    if (payment === "mpesa" && !/^(\+254|0)[17]\d{8}$/.test(phone.trim())) {
      e.phone = "Enter a valid Kenyan phone number (e.g. 0712 345 678)";
    }
    return e;
  }

  function handlePlace() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setPlacing(true);
    setTimeout(() => {
      onPlace({ name, address, city, phone, paymentMethod: payment });
    }, 1800);
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "#666",
          fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0
        }}>← Back to menu</button>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 28,
          fontWeight: 800, color: "#fff", margin: "0 0 32px", letterSpacing: -0.5
        }}>Checkout</h1>

        {/* Delivery details */}
        <Section title="Delivery details">
          <Field label="Full name" error={errors.name}>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Wanjiku"
              style={inputStyle}
            />
          </Field>
          <Field label="Delivery address" error={errors.address}>
            <input
              value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Street, estate, building name..."
              style={inputStyle}
            />
          </Field>
          <Field label="City" error={errors.city}>
            <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle}>
              <option value="">Select city...</option>
              {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Payment */}
        <Section title="Payment method">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <PayBtn
              selected={payment === "mpesa"} onClick={() => setPayment("mpesa")}
              icon="📱" label="M-Pesa" sub="STK push to your phone"
            />
            <PayBtn
              selected={payment === "cash"} onClick={() => setPayment("cash")}
              icon="💵" label="Cash on delivery" sub="Pay when rider arrives"
            />
          </div>

          {payment === "mpesa" && (
            <Field label="M-Pesa phone number" error={errors.phone}>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="0712 345 678"
                style={inputStyle}
                type="tel"
              />
              <p style={{ color: "#555", fontSize: 12, margin: "6px 0 0" }}>
                You'll receive an STK push to approve payment
              </p>
            </Field>
          )}
        </Section>

        {/* Order summary */}
        <Section title="Order summary">
          {cart.map(item => (
            <div key={item.id} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: "1px solid #1a1a1a"
            }}>
              <span style={{ color: "#888", fontSize: 14 }}>{item.name} × {item.qty}</span>
              <span style={{ color: "#ccc", fontSize: 14 }}>Ksh {(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ color: "#888", fontSize: 14 }}>Delivery fee</span>
            <span style={{ color: "#ccc", fontSize: 14 }}>Ksh {deliveryFee}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ color: "#ff6b2b", fontSize: 16, fontWeight: 700 }}>Ksh {grandTotal.toLocaleString()}</span>
          </div>
        </Section>

        <button onClick={handlePlace} disabled={placing} style={{
          width: "100%", background: placing ? "#2a2a2a" : "#ff6b2b",
          border: "none", borderRadius: 14, padding: "18px",
          color: "#fff", fontSize: 16, fontWeight: 700,
          cursor: placing ? "not-allowed" : "pointer",
          marginTop: 8, transition: "all 0.2s"
        }}>
          {placing
            ? (payment === "mpesa" ? "⏳ Sending M-Pesa request..." : "⏳ Placing order...")
            : `Place order · Ksh ${grandTotal.toLocaleString()}`}
        </button>

        <p style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 12 }}>
          By placing this order you agree to Trampet's terms of service
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e",
      borderRadius: 14, padding: "20px 20px 16px",
      marginBottom: 20
    }}>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 16,
        fontWeight: 700, color: "#fff", margin: "0 0 16px"
      }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: "#666", fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: "#ff4444", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

function PayBtn({ selected, onClick, icon, label, sub }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? "#1a1a0a" : "#141414",
      border: `2px solid ${selected ? "#ff6b2b" : "#1e1e1e"}`,
      borderRadius: 12, padding: "14px 16px",
      cursor: "pointer", textAlign: "left", transition: "all 0.15s"
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{sub}</p>
    </button>
  );
}

const inputStyle = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
  borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14,
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit"
};
