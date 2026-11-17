import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", icon: "speedometer2", end: true },
  { to: "/admin/categories", label: "Categories", icon: "tags" },
  { to: "/admin/places", label: "Tourist Places", icon: "geo-alt" },
  { to: "/admin/packages", label: "Tour Packages", icon: "box-seam" },
  { to: "/admin/taxi", label: "Taxi Bookings", icon: "taxi-front" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm">
      <aside className={`adm-side ${open ? "open" : ""}`}>
        <div className="adm-brand"><i className="bi bi-compass-fill me-2" />Travlla Admin</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="adm-link" onClick={() => setOpen(false)}>
              <i className={`bi bi-${l.icon}`} />{l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="adm-link mt-auto"><i className="bi bi-box-arrow-up-right" />View website</Link>
      </aside>
      <main className="adm-main">
        <header className="adm-top">
          <button className="btn d-lg-none" onClick={() => setOpen(!open)} aria-label="Menu">
            <i className="bi bi-list fs-4" />
          </button>
          <h6 className="mb-0">Admin Panel</h6>
        </header>
        <div className="p-3 p-md-4"><Outlet /></div>
      </main>
    </div>
  );
}