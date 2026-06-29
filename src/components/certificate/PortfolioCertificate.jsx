import { forwardRef } from "react";
import { formatAED, formatDate } from "../../lib/format";

// Palette as hex (NOT Tailwind utilities) so html2canvas-pro rasterises it cleanly.
const C = {
  burgundy: "#642128",
  gold: "#b8923f",
  goldSoft: "#cdb066",
  ink: "#2a2118",
  muted: "#8a7f6e",
  line: "#e7dcc6",
  white: "#ffffff",
};

// Deterministic reference number from the user id: LIALI-YYYY-NNNN.
const reference = (id) => {
  const s = String(id || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `LIALI-${new Date().getFullYear()}-${(h % 9000) + 1000}`;
};

const weight = (p) => {
  const net = `${p.netWeight || 0}g`;
  return p.stoneType && p.stoneType !== "None" && p.stoneWeight
    ? `${net} · ${p.stoneWeight}ct`
    : net;
};

const th = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: C.burgundy,
  padding: "0 0 12px",
};

const PortfolioCertificate = forwardRef(function PortfolioCertificate(
  { products = [], user, total },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        width: 820,
        background: C.white,
        color: C.ink,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 16,
      }}
    >
      {/* Gold frame */}
      <div style={{ border: `1.5px solid ${C.goldSoft}`, padding: "48px 56px" }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: C.burgundy,
            }}
          >
            LIALI
          </div>
          <div
            style={{ margin: "18px auto", width: 64, height: 1, background: C.gold }}
          />
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 30,
              fontWeight: 600,
              color: C.burgundy,
            }}
          >
            Jewellery Portfolio
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.gold,
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            Private &amp; Confidential
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          {[
            { label: "Member", value: user?.name || "—" },
            { label: "Date", value: formatDate(new Date()) },
            { label: "Reference", value: reference(user?.id || user?._id) },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: C.muted,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 15, color: C.burgundy, fontWeight: 600, marginTop: 4 }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 36 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.gold}` }}>
              <th style={{ ...th, textAlign: "left" }}>Item</th>
              <th style={{ ...th, textAlign: "left" }}>Metal</th>
              <th style={{ ...th, textAlign: "left" }}>Stone</th>
              <th style={{ ...th, textAlign: "right" }}>Weight</th>
              <th style={{ ...th, textAlign: "right" }}>Invoice Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: "14px 0", fontSize: 14.5, fontWeight: 600, color: C.ink }}>
                  {p.name}
                </td>
                <td style={{ padding: "14px 0", fontSize: 13.5, color: C.ink }}>
                  {p.metalType} {p.purity}
                </td>
                <td style={{ padding: "14px 0", fontSize: 13.5, color: C.ink }}>
                  {p.stoneType || "None"}
                </td>
                <td style={{ padding: "14px 0", fontSize: 13.5, color: C.ink, textAlign: "right" }}>
                  {weight(p)}
                </td>
                <td
                  style={{
                    padding: "14px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.ink,
                    textAlign: "right",
                  }}
                >
                  {formatAED(p.invoiceAmount ?? p.estimatedValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: `2px solid ${C.gold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: C.burgundy,
            }}
          >
            Total Invoice Value
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 30,
              fontWeight: 700,
              color: C.gold,
            }}
          >
            {formatAED(total)}
          </span>
        </div>

        {/* Signatures */}
        {/* <div style={{ display: "flex", gap: 48, marginTop: 64 }}>
          {["Authorised Valuer", "LIALI Seal"].map((label) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ borderTop: `1px solid ${C.muted}`, paddingTop: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: C.muted,
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div> */}

        {/* Disclaimer */}
        <div
          style={{
            marginTop: 30,
            fontSize: 11.5,
            fontStyle: "italic",
            color: C.muted,
            textAlign: "center",
          }}
        >
          This valuation is a market estimate for display and reference purposes
          only — not a certified or insurance-grade appraisal. © {new Date().getFullYear()} LIALI Jewellery.
        </div>
      </div>
    </div>
  );
});

export default PortfolioCertificate;
