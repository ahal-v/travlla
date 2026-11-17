import { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function BookPackageModal({ pkg, onHide }) {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    travelDate: "",
    travelers: 1,
    phone: user?.mobile || "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const max = pkg.maxPeople || 10;
  const total = pkg.p * (Number(form.travelers) || 0);
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/package-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tv_token")}`,
        },
        body: JSON.stringify({ ...form, packageId: pkg.id, travelers: Number(form.travelers) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      setDone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">Book: {pkg.t}</Modal.Title>
      </Modal.Header>

      {!user ? (
        <Modal.Body className="text-center py-4">
          <p className="mb-3">Please login to book this package.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/login" className="btn-sun">Login</Button>
            <Button as={Link} to="/register" variant="outline-dark" className="rounded-pill">Register</Button>
          </div>
        </Modal.Body>
      ) : done ? (
        <Modal.Body className="text-center py-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }} />
          <h5 className="mt-3">Booking request received!</h5>
          <p className="text-muted mb-1">
            Reference <strong>#{done._id.slice(-6).toUpperCase()}</strong> · Total <strong>${done.totalPrice}</strong>
          </p>
          <p className="text-muted">Our team will contact you on {done.phone} to confirm.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/profile" className="btn-sun">View my bookings</Button>
            <Button variant="outline-dark" className="rounded-pill" onClick={onHide}>Close</Button>
          </div>
        </Modal.Body>
      ) : (
        <Form onSubmit={submit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-muted small">
              {pkg.d} · ${pkg.p} per person
            </p>
            <Row className="g-3">
              <Col xs={7}>
                <Form.Label>Travel date *</Form.Label>
                <Form.Control type="date" min={today} name="travelDate" value={form.travelDate} onChange={change} required />
              </Col>
              <Col xs={5}>
                <Form.Label>Travellers *</Form.Label>
                <Form.Control type="number" min="1" max={max} name="travelers" value={form.travelers} onChange={change} required />
              </Col>
              <Col xs={12}>
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="tel" name="phone" value={form.phone} onChange={change} required
                  pattern="[0-9+\-\s]{8,15}" title="Enter a valid phone number"
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Notes</Form.Label>
                <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={change} placeholder="Any special request..." />
              </Col>
            </Row>
            <p className="mt-3 mb-0 fw-semibold">Total: ${total}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" className="btn-sun" disabled={saving}>
              {saving ? "Booking..." : "Confirm booking"}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
}