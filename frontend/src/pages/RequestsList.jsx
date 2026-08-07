import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ChevronRight } from "lucide-react";
import { listRequests } from "../api/client";
import Ring from "../components/Ring";
import { StatusBadge, GroupBadge } from "../components/StatusBadge";

export default function RequestsList() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    listRequests().then((r) => setRequests(r.data));
  }, []);

  return (
    <>
      <div className="page-eyebrow">Requests</div>
      <div className="page-head-row">
        <div>
          <h1 className="page-title display">Active blood requests</h1>
          <p className="page-desc">Every request a volunteer has raised, with live progress toward the units needed.</p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">
          <ClipboardList size={15} /> New request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="panel" style={{ marginTop: 26 }}>
          <div className="empty">
            <ClipboardList size={22} />
            <div>No requests yet. Create one to start matching donors.</div>
          </div>
        </div>
      ) : (
        <div className="req-grid" style={{ marginTop: 26 }}>
          {requests.map((r) => {
            const pct = (r.units_received / r.units_needed) * 100;
            return (
              <Link to={`/requests/${r.id}`} className="req-card" key={r.id}>
                <Ring pct={pct} done={r.status === "completed"} />
                <div className="req-info">
                  <div className="req-patient">{r.patient_name}</div>
                  {r.hospital && <div className="req-hospital">{r.hospital}</div>}
                  <div className="req-meta">
                    <GroupBadge group={r.blood_group} />
                    <StatusBadge status={r.status} />
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {r.units_received}/{r.units_needed} units
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
