export default function Spin({ size = 14 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid rgba(255,255,255,0.25)`, borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
    }} />
  );
}
