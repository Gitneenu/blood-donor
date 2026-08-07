import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getRequest,
  getEligibleDonors,
  broadcastRequest,
  listDonationsForRequest,
  updateDonationStatus,
  addDonorToRequest,
} from "../api/client";
import { ArrowLeft, MapPin, Phone, Radio, ClipboardList, Check, X } from "lucide-react";
import Ring from "../components/Ring";
import { StatusBadge, DonationBadge, GroupBadge } from "../components/StatusBadge";

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [donations, setDonations] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);

  const refresh = useCallback(async () => {
    const [r, e, d] = await Promise.all([
      getRequest(id),
      getEligibleDonors(id),
      listDonationsForRequest(id),
    ]);
    setRequest(r.data);
    setEligible(e.data);
    setDonations(d.data);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!request) return <p style={{ color: "var(--text-muted)" }}>Loading...</p>;

  const stillNeeded = request.units_needed - request.units_received;
  const pending = donations.filter((d) => d.status === "pending");
  const completed = donations.filter((d) => d.status === "completed");
  const failed = donations.filter((d) => d.status === "failed");
  const pct = (request.units_received / request.units_needed) * 100;

  const handleBroadcast = async () => {
    setBroadcasting(true);
    await broadcastRequest(id);
    await refresh();
    setBroadcasting(false);
  };

  const handleAddOne = async (donorId) => {
    await addDonorToRequest(id, donorId);
    await refresh();
  };

  const handleMark = async (donationId, status) => {
    await updateDonationStatus(id, donationId, status);
    await refresh();
  };

  return (
    <>
      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        <ArrowLeft size={14} /> All requests
      </Link>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Ring pct={pct} done={request.status === "completed"} size={64} />
        <div>
          <div className="page-eyebrow">Request{request.hospital ? ` · ${request.hospital}` : ""}</div>
          <h1 className="page-title display">
            {request.patient_name} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>— {request.blood_group}</span>
          </h1>
          <div className="req-meta" style={{ marginTop: 8 }}>
            <GroupBadge group={request.blood_group} />
            <StatusBadge status={request.status} />
            <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {request.units_received} of {request.units_needed} units received · {Math.max(stillNeeded, 0)} still needed
            </span>
          </div>
        </div>
      </div>

      {request.status === "open" && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={handleBroadcast}
          disabled={broadcasting || eligible.length === 0}
        >
          <Radio size={15} />
          {broadcasting ? "Broadcasting..." : `Broadcast to all ${eligible.length} eligible donors`}
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginTop: 26 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Eligible donors</div>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {eligible.length} match{eligible.length !== 1 ? "es" : ""}
            </span>
          </div>
          {eligible.length === 0 ? (
            <div className="empty">
              <Radio size={22} />
              <div>
                No eligible donors right now.
                <br />
                Everyone matching {request.blood_group} is either unavailable or within their 90-day cooldown.
              </div>
            </div>
          ) : (
            eligible.map((d) => (
              <div className="donor-row" key={d.donor_id}>
                <div className="bg-chip">{d.blood_group}</div>
                <div style={{ flex: 1 }}>
                  <div className="donor-name">{d.name}</div>
                  <div className="donor-meta">
                    <span><Phone size={11} /> {d.phone}</span>
                    {d.place && <span><MapPin size={11} /> {d.place}</span>}
                    {d.already_broadcast && <span style={{ color: "var(--amber)" }}>Already contacted</span>}
                  </div>
                </div>
                {request.status === "open" && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddOne(d.donor_id)}>
                    Add individually
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Awaiting response</div>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <div className="empty"><ClipboardList size={20} /><div>No donor has been broadcast to yet.</div></div>
            ) : (
              pending.map((d) => (
                <div className="donor-row" key={d.id}>
                  <div style={{ flex: 1 }}>
                    <div className="donor-name">{d.donors?.name}</div>
                    <div className="donor-meta"><span><Phone size={11} /> {d.donors?.phone}</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-teal btn-sm" onClick={() => handleMark(d.id, "completed")}>
                      <Check size={12} /> Donated
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMark(d.id, "failed")}>
                      <X size={12} /> Unsuccessful
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Donated</div>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{completed.length}</span>
            </div>
            {completed.length === 0 ? (
              <div className="empty" style={{ padding: "24px 20px" }}>None yet.</div>
            ) : (
              completed.map((d) => (
                <div className="donor-row" key={d.id}>
                  <div style={{ flex: 1 }}>
                    <div className="donor-name">{d.donors?.name}</div>
                    <div className="donor-meta">{d.donated_at && new Date(d.donated_at).toLocaleString()}</div>
                  </div>
                  <DonationBadge status="completed" />
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Unsuccessful</div>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{failed.length}</span>
            </div>
            {failed.length === 0 ? (
              <div className="empty" style={{ padding: "24px 20px" }}>None yet.</div>
            ) : (
              failed.map((d) => (
                <div className="donor-row" key={d.id}>
                  <div className="donor-name" style={{ flex: 1 }}>{d.donors?.name}</div>
                  <DonationBadge status="failed" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
