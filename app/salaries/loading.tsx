export default function Loading() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 280, height: 36, backgroundColor: "#EBEBEB", borderRadius: 8, marginBottom: 8 }} />
        <div style={{ width: 200, height: 16, backgroundColor: "#F7F7F7", borderRadius: 4 }} />
      </div>
      <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[180, 160, 150, 150, 100].map((w, i) => (
          <div key={i} style={{ width: w, height: 36, backgroundColor: "#F7F7F7", borderRadius: 8 }} />
        ))}
      </div>
      <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#F7F7F7", padding: "12px 16px", borderBottom: "1px solid #EBEBEB", display: "flex", gap: 16 }}>
          {[80, 160, 60, 100, 40, 80, 60, 90].map((w, i) => (
            <div key={i} style={{ width: w, height: 12, backgroundColor: "#EBEBEB", borderRadius: 4 }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ padding: "16px", borderBottom: "1px solid #F7F7F7", display: "flex", gap: 16, alignItems: "center" }}>
            {[80, 160, 60, 100, 40, 80, 60, 90].map((w, j) => (
              <div key={j} style={{ width: w, height: 14, backgroundColor: "#F7F7F7", borderRadius: 4, opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}