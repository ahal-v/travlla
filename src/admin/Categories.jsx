import { useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Row, Table } from "react-bootstrap";
import AdminPager from "./AdminPager.jsx";

const PAGE_SIZE = 5;
const MAX_MB = 3;

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [fileKey, setFileKey] = useState(0);
  const blobRef = useRef("");

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const showPreview = (url, isBlob = false) => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = isBlob ? url : "";
    setPreview(url);
  };
  useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

  const load = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Could not load categories. Is the server running?");
      setItems(await res.json());
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const closeForm = () => {
    setShowForm(false); setEditId(null); setName(""); setFile(null);
    setEditImage(""); showPreview(""); setFileKey((k) => k + 1);
  };

  const openNew = () => {
    closeForm(); setShowForm(true); setMsg(null);
  };

  const openEdit = (c) => {
    setName(c.name); setFile(null); setEditImage(c.image || ""); showPreview(c.image || "");
    setEditId(c._id); setShowForm(true); setFileKey((k) => k + 1); setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); showPreview(editImage); return; }
    if (f.size > MAX_MB * 1024 * 1024) {
      setMsg({ type: "danger", text: `Image must be under ${MAX_MB} MB.` });
      e.target.value = ""; setFile(null); showPreview(editImage);
      return;
    }
    setMsg(null); setFile(f); showPreview(URL.createObjectURL(f), true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (file) fd.append("image", file);

      const res = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PUT" : "POST",
        body: fd, // browser sets the multipart header itself
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);

      setMsg({ type: "success", text: editId ? "Category updated." : "Category added." });
      closeForm();
      await load();
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setMsg({ type: "success", text: "Category deleted." }); load(); }
    else setMsg({ type: "danger", text: data.message || "Delete failed." });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Categories</h4>
        {!showForm && <Button variant="dark" onClick={openNew}><i className="bi bi-plus-lg me-1" />Add category</Button>}
      </div>

      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}

      {showForm && (
        <Form onSubmit={submit} className="adm-card mb-4">
          <h5 className="mb-3">{editId ? "Edit category" : "Add new category"}</h5>
          <Row className="g-3 align-items-start">
            <Col md={6}>
              <Form.Label>Category name *</Form.Label>
              <Form.Control value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="Beaches" />
            </Col>
            <Col md={6}>
              <Form.Label>Image (optional)</Form.Label>
              <Form.Control key={fileKey} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pick} />
              <Form.Text className="text-muted">
                JPG, PNG, WEBP or GIF, max {MAX_MB} MB.{editId && " Leave empty to keep the current image."}
              </Form.Text>
            </Col>
            {preview && (
              <Col xs={12}>
                <img src={preview} alt="Preview" className="rounded" style={{ height: 120, maxWidth: "100%", objectFit: "cover" }} />
              </Col>
            )}
          </Row>
          <div className="d-flex gap-2 mt-4">
            <Button type="submit" variant="dark" disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Save"}</Button>
            <Button variant="outline-secondary" onClick={closeForm}>Cancel</Button>
          </div>
        </Form>
      )}

      <div className="adm-card p-0 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Image</th><th>Name</th><th /></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>}
              {!loading && items.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-muted">No categories yet. Click "Add category".</td></tr>
              )}
              {visible.map((c) => (
                <tr key={c._id}>
                  <td>{c.image ? <img src={c.image} alt="" className="adm-thumb" /> : <i className="bi bi-image text-muted" />}</td>
                  <td className="fw-semibold">{c.name}</td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(c)} title="Edit"><i className="bi bi-pencil" /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => remove(c)} title="Delete"><i className="bi bi-trash" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <AdminPager page={current} pages={pages} total={items.length} size={PAGE_SIZE} onChange={setPage} />
      </div>
    </>
  );
}