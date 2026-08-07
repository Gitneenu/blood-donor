import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Activity, LayoutGrid, UserPlus, Droplet } from "lucide-react";
import RegisterDonor from "./pages/RegisterDonor";
import CreateRequest from "./pages/CreateRequest";
import RequestsList from "./pages/RequestsList";
import RequestDetail from "./pages/RequestDetail";
import Summary from "./pages/Summary";

const NAV_ITEMS = [
  { to: "/", label: "Requests", icon: LayoutGrid, end: true },
  { to: "/donors/new", label: "Register Donor", icon: UserPlus },
  { to: "/requests/new", label: "New Request", icon: Droplet },
  { to: "/summary", label: "Summary", icon: Activity },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Activity size={18} color="#fff" />
        </div>
        <div>
          <div className="brand-name display">Pulse</div>
          <div className="brand-sub">Donor network</div>
        </div>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={16} /> {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<RequestsList />} />
            <Route path="/donors/new" element={<RegisterDonor />} />
            <Route path="/requests/new" element={<CreateRequest />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
