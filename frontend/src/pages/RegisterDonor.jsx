import { useState } from "react";
import { UserPlus } from "lucide-react";
import { registerDonor } from "../api/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterDonor() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    blood_group: "O+",
    place: "",
  });
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await registerDonor(form);
      setStatus("done");
      setForm({ name: "", phone: "", blood_group: "O+", place: "" });
    } catch (err) {
      setStatus(err?.response?.data?.detail || "error");
    }
  };

  return (
    <>
      <div className="page-eyebrow">Donors</div>
      <h1 className="page-title display">Register a donor</h1>
      <p className="page-desc">Add someone to the pool. They'll surface automatically for matching requests once eligible.</p>

      <form className="form-grid" style={{ marginTop: 26 }} onSubmit={submit}>
        <div className="field full">
          <label>Full name</label>
          <input
            placeholder="e.g. Anjali Krishnan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Phone number</label>
          <input
            placeholder="98xxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Blood group</label>
          <select
            value={form.blood_group}
            onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label>Place (optional)</label>
          <input
            placeholder="e.g. Kakkanad, Kochi"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
          />
        </div>
        <div className="field full" style={{ marginTop: 4 }}>
          <button className="btn btn-primary" type="submit" disabled={status === "saving"}>
            <UserPlus size={15} /> {status === "saving" ? "Registering..." : "Register donor"}
          </button>
        </div>
      </form>

      {status === "done" && <div className="toast">Donor registered.</div>}
      {status && status !== "saving" && status !== "done" && (
        <div className="toast error">Error: {status}</div>
      )}
    </>
  );
}
