import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { createRequest } from "../api/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// TODO: replace with the logged-in volunteer's id from your auth flow.
const CURRENT_VOLUNTEER_ID = "8f078aeb-ca76-4db0-821f-b5ac469a84ba";

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name: "",
    blood_group: "O+",
    units_needed: 1,
    hospital: "",
    volunteer_id: CURRENT_VOLUNTEER_ID,
  });

  const submit = async (e) => {
    e.preventDefault();
    const res = await createRequest(form);
    navigate(`/requests/${res.data.id}`);
  };

  return (
    <>
      <div className="page-eyebrow">Requests</div>
      <h1 className="page-title display">Raise a blood request</h1>
      <p className="page-desc">This opens a request and starts matching against eligible donors immediately.</p>

      <form className="form-grid" style={{ marginTop: 26 }} onSubmit={submit}>
        <div className="field full">
          <label>Patient name</label>
          <input
            placeholder="e.g. John Doe"
            value={form.patient_name}
            onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Blood group needed</label>
          <select
            value={form.blood_group}
            onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Units needed</label>
          <input
            type="number"
            min={1}
            value={form.units_needed}
            onChange={(e) => setForm({ ...form, units_needed: Number(e.target.value) })}
          />
        </div>
        <div className="field full">
          <label>Hospital</label>
          <input
            placeholder="e.g. Lakeshore Hospital"
            value={form.hospital}
            onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          />
        </div>
        <div className="field full" style={{ marginTop: 4 }}>
          <button className="btn btn-primary" type="submit">
            <ClipboardList size={15} /> Create request
          </button>
        </div>
      </form>
    </>
  );
}
