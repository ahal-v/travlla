import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import AdminPager from "./AdminPager.jsx";

const PAGE_SIZE = 3;
const categories = ["Family", "Honeymoon", "Adventure", "Luxury", "Group", "Budget"];
const empty = {
  title: "", destination: "", category: "Family", days: "", nights: "",
  price: "", maxPeople: 10, startDate: "", rating: 4.5,
  description: "", includes: "", imageUrl: "", status: "Active", featured: false,
};

export default function TourPackages() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Could not load packages. Is the server running?");
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
    if (!q) return items;
    return items.filter((p) =>
      [p.title, p.destination, p.category].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openNew = () => {
    setForm(empty); setEditId(null); setShowForm(true); setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (p) => {
    setForm({
      title: p.title, destination: p.destination, category: p.category,
      days: p.days, nights: p.nights, price: p.price, maxPeople: p.maxPeople,
      startDate: p.startDate || "", rating: p.rating,
      description: p.description || "", includes: (p.includes || []).join(", "),
      imageUrl: p.imageUrl || "", status: p.status, featured: !!p.featured,
    });
    setEditId(p._id); setShowForm(true); setViewItem(null); setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const body = {
      ...form,
      days: Number(form.days),
      nights: Number(form.nights),
      price: Number(form.price),
      maxPeople: Number(form.maxPeople),
      rating: Number(form.rating),
      includes: form.includes.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(editId ? `/api/packages/${editId}` : "/api/packages", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}: ${text.slice(0, 150)}`);
      setMsg({ type: "success", text: editId ? "Package updated." : "Package saved to database." });
      setShowForm(false); setForm(empty); setEditId(null);
      await load();
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    const res = await fetch(`/api/packages/${p._id}`, { method: "DELETE" });
    if (res.ok) { setMsg({ type: "success", text: "Package deleted." }); load(); }
    else setMsg({ type: "danger", text: "Delete failed." });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="mb-0">Tour Packages</h4>
        {!showForm && <Button variant="dark" onClick={openNew}><i className="bi bi-plus-lg me-1" />Add package</Button>}
      </div>

      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}

      {showForm && (
        <Form onSubmit={submit} className="adm-card mb-4">
          <h5 className="mb-3">{editId ? "Edit package" : "Add new package"}</h5>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label>Package title *</Form.Label>
              <Form.Control name="title" value={form.title} onChange={change} required placeholder="Bali Honeymoon Special" />
            </Col>
            <Col md={4}>
              <Form.Label>Destination *</Form.Label>
              <Form.Control name="destination" value={form.destination} onChange={change} required placeholder="Bali, Indonesia" />
            </Col>
            <Col md={3}>
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={form.category} onChange={change}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Days *</Form.Label>
              <Form.Control type="number" min="1" name="days" value={form.days} onChange={change} required />
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Nights *</Form.Label>
              <Form.Control type="number" min="0" name="nights" value={form.nights} onChange={change} required />
            </Col>
            <Col md={3}>
              <Form.Label>Price per person ($) *</Form.Label>
              <Form.Control type="number" min="0" name="price" value={form.price} onChange={change} required />
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Max people</Form.Label>
              <Form.Control type="number" min="1" name="maxPeople" value={form.maxPeople} onChange={change} />
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Start date</Form.Label>
              <Form.Control type="date" name="startDate" value={form.startDate} onChange={change} />
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Rating (0-5)</Form.Label>
              <Form.Control type="number" min="0" max="5" step="0.1" name="rating" value={form.rating} onChange={change} />
            </Col>
            <Col md={3} xs={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={form.status} onChange={change}>
                <option>Active</option><option>Inactive</option>
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Form.Label>Image URL</Form.Label>
              <Form.Control type="url" name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://...jpg" />
            </Col>
            <Col xs={12}>
              <Form.Label>Includes (comma separated)</Form.Label>
              <Form.Control name="includes" value={form.includes} onChange={change} placeholder="Hotel, Breakfast, Airport pickup, Guide" />
            </Col>
            <Col xs={12}>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={change} />
            </Col>
            <Col xs={12}>
              <Form.Check type="checkbox" id="pkg-featured" name="featured" label="Show as featured" checked={form.featured} onChange={change} />
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-4">
            <Button type="submit" variant="dark" disabled={saving}>{saving ? "Saving..." : editId ? "Update package" : "Save package"}</Button>
            <Button variant="outline-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </Form>
      )}

      <div className="adm-card p-0 overflow-hidden">
        <div className="p-3 border-bottom">
          <Form.Control
            placeholder="Search by title, destination or category"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Image</th><th>Title</th><th>Destination</th><th>Duration</th><th>Price</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4 text-muted">No packages found.</td></tr>
              )}
              {visible.map((p) => (
                <tr key={p._id}>
                  <td>{p.imageUrl ? <img src={p.imageUrl} alt="" className="adm-thumb" /> : <i className="bi bi-image text-muted" />}</td>
                  <td className="fw-semibold">{p.title} {p.featured && <i className="bi bi-star-fill text-warning ms-1" />}</td>
                  <td>{p.destination}</td>
                  <td>{p.days}D / {p.nights}N</td>
                  <td>${p.price}</td>
                  <td><Badge bg={p.status === "Active" ? "success" : "secondary"}>{p.status}</Badge></td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => setViewItem(p)} title="View"><i className="bi bi-eye" /></Button>
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(p)} title="Edit"><i className="bi bi-pencil" /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => remove(p)} title="Delete"><i className="bi bi-trash" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <AdminPager page={current} pages={pages} total={filtered.length} size={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* View modal */}
      <Modal show={!!viewItem} onHide={() => setViewItem(null)} centered size="lg">
        {viewItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{viewItem.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {viewItem.imageUrl && <img src={viewItem.imageUrl} alt="" className="w-100 rounded mb-3" style={{ maxHeight: 280, objectFit: "cover" }} />}
              <Row className="g-3">
                <Col sm={6}><small className="text-muted d-block">Destination</small>{viewItem.destination}</Col>
                <Col sm={6}><small className="text-muted d-block">Category</small>{viewItem.category}</Col>
                <Col sm={6}><small className="text-muted d-block">Duration</small>{viewItem.days} days, {viewItem.nights} nights</Col>
                <Col sm={6}><small className="text-muted d-block">Price per person</small>${viewItem.price}</Col>
                <Col sm={6}><small className="text-muted d-block">Max people</small>{viewItem.maxPeople}</Col>
                <Col sm={6}><small className="text-muted d-block">Start date</small>{viewItem.startDate || "-"}</Col>
                <Col sm={6}><small className="text-muted d-block">Rating</small>{viewItem.rating} / 5</Col>
                <Col sm={6}><small className="text-muted d-block">Status</small>{viewItem.status}{viewItem.featured ? " (Featured)" : ""}</Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Includes</small>
                  {viewItem.includes?.length
                    ? viewItem.includes.map((x) => <Badge key={x} bg="light" text="dark" className="me-1 border">{x}</Badge>)
                    : "-"}
                </Col>
                <Col xs={12}><small className="text-muted d-block">Description</small>{viewItem.description || "-"}</Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-danger" onClick={() => { const p = viewItem; setViewItem(null); remove(p); }}>Delete</Button>
              <Button variant="dark" onClick={() => openEdit(viewItem)}>Edit</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
}