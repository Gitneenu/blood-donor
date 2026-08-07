const REQUEST_MAP = {
  open: ["Open", "badge-open"],
  completed: ["Completed", "badge-completed"],
  cancelled: ["Cancelled", "badge-cancelled"],
};

const DONATION_MAP = {
  pending: ["Awaiting response", "badge-pending"],
  completed: ["Donated", "badge-success"],
  failed: ["Unsuccessful", "badge-fail"],
};

export function StatusBadge({ status }) {
  const [label, cls] = REQUEST_MAP[status] || [status, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function DonationBadge({ status }) {
  const [label, cls] = DONATION_MAP[status] || [status, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function GroupBadge({ group }) {
  return <span className="badge badge-group">{group}</span>;
}
