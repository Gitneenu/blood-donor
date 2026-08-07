import { useEffect, useState } from "react";
import { Check, X, ClipboardList, Activity } from "lucide-react";
import { getSummary } from "../api/client";
import PulseDivider from "../components/PulseDivider";

export default function Summary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSummary().then((r) => setData(r.data));
  }, []);

  if (!data) return <p style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <>
      <div className="page-eyebrow">Overview</div>
      <h1 className="page-title display">Every unit, tracked to the end.</h1>
      <p className="page-desc">Donation outcomes and request status across all volunteers.</p>
      <PulseDivider />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--teal-dim)" }}><Check size={16} color="var(--teal)" /></div>
          <div className="stat-val mono">{data.donations.successful}</div>
          <div className="stat-label">Successful donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--accent-dim)" }}><X size={16} color="var(--accent)" /></div>
          <div className="stat-val mono">{data.donations.unsuccessful}</div>
          <div className="stat-label">Unsuccessful donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--amber-dim)" }}><ClipboardList size={16} color="var(--amber)" /></div>
          <div className="stat-val mono">{data.donations.pending}</div>
          <div className="stat-label">Pending donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--surface-2)" }}><Activity size={16} color="var(--text-muted)" /></div>
          <div className="stat-val mono">{data.donations.total}</div>
          <div className="stat-label">Total donations</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Requests</div></div>
          <div className="panel-body">
            <table>
              <tbody>
                <tr><td>Open</td><td className="mono" style={{ textAlign: "right" }}>{data.requests.open}</td></tr>
                <tr><td>Completed</td><td className="mono" style={{ textAlign: "right" }}>{data.requests.completed}</td></tr>
                <tr><td>Cancelled</td><td className="mono" style={{ textAlign: "right" }}>{data.requests.cancelled}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Total</td><td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{data.requests.total}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Units</div></div>
          <div className="panel-body">
            <table>
              <tbody>
                <tr><td>Needed (all-time)</td><td className="mono" style={{ textAlign: "right" }}>{data.units.needed}</td></tr>
                <tr><td>Received (all-time)</td><td className="mono" style={{ textAlign: "right" }}>{data.units.received}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
