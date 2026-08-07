export default function Ring({ pct, done, size = 56 }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 56 56">
        <circle className="ring-track" cx="28" cy="28" r={r} strokeWidth="5" fill="none" />
        <circle
          className={`ring-val ${done ? "done" : ""}`}
          cx="28"
          cy="28"
          r={r}
          strokeWidth="5"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, Math.max(0, pct)) / 100) * c}
        />
      </svg>
      <div className="ring-label">{Math.round(Math.min(100, Math.max(0, pct)))}%</div>
    </div>
  );
}
