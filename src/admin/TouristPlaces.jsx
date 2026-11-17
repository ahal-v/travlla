import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminPager from "./AdminPager.jsx";

const PAGE_SIZE = 3;
const empty = {
  name: "", country: "", category: "", price: "",
  duration: "", description: "", imageUrl: "", featured: false,
};

export default function TouristPlaces() {
  const [places, setPlaces] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(places.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = places.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const load = async () => {
    try {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Could not load places. Is the server running?");
      setPlaces(await res.json());
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () =>
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCats)
      .catch(() => {});

  useEffect(() => { load(); loadCategories(); }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openNew = () => {
    setForm(empty); setFile(null); setEditId(null); setShowForm(true); setMsg(null);
    loadCategories(); // pick up categories added in the meantime
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, country: p.country, category: p.category || "", price: p.price,
      duration: p.duration || "", description: p.description || "",
      imageUrl: p.imageUrl || "", featured: !!p.featured,
    });
    setFile(null);
    setEditId(p._id); setShowForm(true); setMsg(null);
    loadCategories();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      // multipart form: text fields + optional image file
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);

      const res = await fetch(editId ? `/api/places/${editId}` : "/api/places", {
        method: editId ? "PUT" : "POST",
        body: fd, // no Content-Type header: the browser sets it
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}: ${text.slice(0, 150)}`);
      setMsg({ type: "success", text: editId ? "Place updated." : "Place saved to database." });
      setShowForm(false); setForm(empty); setFile(null); setEditId(null);
      await load();
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this place?")) return;
    const res = await fetch(`/api/places/${id}`, { method: "DELETE" });
    if (res.ok) { setMsg({ type: "success", text: "Place deleted." }); load(); }
    else setMsg({ type: "danger", text: "Delete failed." });
  };

  // keep an old/removed category selectable while editing so it isn't lost silently
  const legacy = form.category && !cats.some((c) => c.name === form.category);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Tourist Places</h4>
        {!showForm && <Button variant="dark" onClick={openNew}><i className="bi bi-plus-lg me-1" />Add place</Button>}
      </div>

      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}

      {showForm && (
        <Form onSubmit={submit} className="adm-card mb-4">
          <h5 className="mb-3">{editId ? "Edit place" : "Add new place"}</h5>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Place name *</Form.Label>
              <Form.Control name="name" value={form.name} onChange={change} required placeholder="Bali" />
            </Col>
            <Col md={6}>
              <Form.Label>Country *</Form.Label>
              <Form.Control name="country" value={form.country} onChange={change} required placeholder="Indonesia" />
            </Col>
            <Col md={4}>
              <Form.Label>Category *</Form.Label>
              <Form.Select name="category" value={form.category} onChange={change} required>
                <option value="">Select category</option>
                {legacy && <option value={form.category}>{form.category} (not in list)</option>}
                {cats.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </Form.Select>
              {cats.length === 0 && (
                <Form.Text className="text-danger">
                  No categories yet. <Link to="/admin/categories">Add a category</Link> first.
                </Form.Text>
              )}
            </Col>
            <Col md={4}>
              <Form.Label>Price per day ($) *</Form.Label>
              <Form.Control type="number" min="0" name="price" value={form.price} onChange={change} required />
            </Col>
            <Col md={4}>
              <Form.Label>Duration</Form.Label>
              <Form.Control name="duration" value={form.duration} onChange={change} placeholder="6 days, 3 nights" />
            </Col>
            <Col md={6}>
              <Form.Label>Upload image</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <Form.Text className="text-muted">
                JPG, PNG, WEBP or GIF, max 3 MB. An uploaded image is used instead of the URL.
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Label>Or Image URL</Form.Label>
              <Form.Control type="text" name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://..." />
            </Col>
            <Col xs={12}>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={change} />
            </Col>
            <Col xs={12}>
              <Form.Check type="checkbox" id="featured" name="featured" label="Show as featured" checked={form.featured} onChange={change} />
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-4">
            <Button type="submit" variant="dark" disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Save place"}</Button>
            <Button variant="outline-secondary" onClick={() => { setShowForm(false); setEditId(null); setFile(null); }}>Cancel</Button>
          </div>
        </Form>
      )}

      <div className="adm-card p-0 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Image</th><th>Name</th><th>Country</th><th>Category</th><th>Price</th><th>Featured</th><th /></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>}
              {!loading && places.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4 text-muted">No places yet. Click "Add place" to create one.</td></tr>
              )}
              {visible.map((p) => (
                <tr key={p._id}>
                  <td>{p.imageUrl ? <img src={p.imageUrl} alt="" className="adm-thumb" /> : <i className="bi bi-image text-muted" />}</td>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{p.country}</td>
                  <td>{p.category || "-"}</td>
                  <td>${p.price}</td>
                  <td>{p.featured ? <i className="bi bi-star-fill text-warning" /> : "-"}</td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(p)}><i className="bi bi-pencil" /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => remove(p._id)}><i className="bi bi-trash" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <AdminPager page={current} pages={pages} total={places.length} size={PAGE_SIZE} onChange={setPage} />
      </div>
    </>
  );
}