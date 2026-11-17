import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import AdminPager from "./AdminPager.jsx";

const PAGE_SIZE = 5;
const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
const color = { Pending: "warning", Confirmed: "primary", Completed: "success", Cancelled: "secondary" };

export default function TaxiBookings() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try {
      const res = await fetch("/api/taxi");
      if (!res.ok) throw new Error("Could not load bookings. Is the server running?");
      setItems(await res.json());
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      if (filter !== "All" && b.status !== filter) return false;
      if (!q) return true;
      return [b.name, b.phone, b.pickupLocation, b.dropLocation].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [items, search, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const setStatus = async (b, status) => {
    const res = await fetch(`/api/taxi/${b._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((list) => list.map((x) => (x._id === updated._id ? updated : x)));
      setViewItem((v) => (v && v._id === updated._id ? updated : v));
    } else {
      setMsg({ type: "danger", text: "Status update failed." });
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete booking of ${b.name}?`)) return;
    const res = await fetch(`/api/taxi/${b._id}`, { method: "DELETE" });
    if (res.ok) { setMsg({ type: "success", text: "Booking deleted." }); setViewItem(null); load(); }
    else setMsg({ type: "danger", text: "Delete failed." });
  };

  const ref = (b) => `#${b._id.slice(-6).toUpperCase()}`;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Taxi Bookings</h4>
        <Button variant="outline-dark" onClick={load}><i className="bi bi-arrow-clockwise me-1" />Refresh</Button>
      </div>

      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <div className="adm-card p-0 overflow-hidden">
        <div className="p-3 border-bottom d-flex gap-2 flex-wrap">
          <Form.Control
            style={{ maxWidth: 360 }}
            placeholder="Search name, phone or location"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Form.Select style={{ maxWidth: 180 }} value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option>All</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </Form.Select>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Ref</th><th>Customer</th><th>Trip</th><th>Pickup</th><th>Vehicle</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4 text-muted">No bookings found.</td></tr>
              )}
              {visible.map((b) => (
                <tr key={b._id}>
                  <td className="fw-semibold">{ref(b)}</td>
                  <td>{b.name}<br /><small className="text-muted">{b.phone}</small></td>
                  <td>{b.pickupLocation} <i className="bi bi-arrow-right mx-1" /> {b.dropLocation}<br /><small className="text-muted">{b.tripType}</small></td>
                  <td>{b.pickupDate}<br /><small className="text-muted">{b.pickupTime}</small></td>
                  <td>{b.vehicleType}<br /><small className="text-muted">{b.passengers} pax</small></td>
                  <td style={{ minWidth: 140 }}>
                    <Form.Select size="sm" value={b.status} onChange={(e) => setStatus(b, e.target.value)}>
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </Form.Select>
                  </td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => setViewItem(b)} title="View"><i className="bi bi-eye" /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => remove(b)} title="Delete"><i className="bi bi-trash" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <AdminPager page={current} pages={pages} total={filtered.length} size={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal show={!!viewItem} onHide={() => setViewItem(null)} centered size="lg">
        {viewItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Booking {ref(viewItem)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="g-3">
                <Col sm={6}><small className="text-muted d-block">Name</small>{viewItem.name}</Col>
                <Col sm={6}><small className="text-muted d-block">Phone</small><a href={`tel:${viewItem.phone}`}>{viewItem.phone}</a></Col>
                <Col sm={6}><small className="text-muted d-block">Email</small>{viewItem.email || "-"}</Col>
                <Col sm={6}><small className="text-muted d-block">Trip type</small>{viewItem.tripType}</Col>
                <Col sm={6}><small className="text-muted d-block">Pickup location</small>{viewItem.pickupLocation}</Col>
                <Col sm={6}><small className="text-muted d-block">Drop location</small>{viewItem.dropLocation}</Col>
                <Col sm={6}><small className="text-muted d-block">Pickup date & time</small>{viewItem.pickupDate} at {viewItem.pickupTime}</Col>
                <Col sm={6}><small className="text-muted d-block">Passengers</small>{viewItem.passengers}</Col>
                <Col sm={6}><small className="text-muted d-block">Vehicle</small>{viewItem.vehicleType}</Col>
                <Col sm={6}>
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={color[viewItem.status]}>{viewItem.status}</Badge>
                </Col>
                <Col xs={12}><small className="text-muted d-block">Notes</small>{viewItem.notes || "-"}</Col>
                <Col xs={12}><small className="text-muted d-block">Booked on</small>{new Date(viewItem.createdAt).toLocaleString()}</Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
              <Button variant="outline-danger" onClick={() => remove(viewItem)}>Delete</Button>
              <div className="d-flex gap-2">
                {viewItem.status === "Pending" && (
                  <Button variant="primary" onClick={() => setStatus(viewItem, "Confirmed")}>Confirm</Button>
                )}
                {viewItem.status === "Confirmed" && (
                  <Button variant="success" onClick={() => setStatus(viewItem, "Completed")}>Mark completed</Button>
                )}
                {["Pending", "Confirmed"].includes(viewItem.status) && (
                  <Button variant="outline-secondary" onClick={() => setStatus(viewItem, "Cancelled")}>Cancel booking</Button>
                )}
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
}