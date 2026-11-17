import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Header, Footer } from "../App.jsx";

const tripTypes = ["One way", "Round trip", "Airport transfer", "Local hire"];
const vehicles = ["Sedan (4 seats)", "SUV (6 seats)", "Tempo Traveller (12 seats)", "Luxury car"];
const empty = {
  name: "", phone: "", email: "", tripType: "One way",
  pickupLocation: "", dropLocation: "", pickupDate: "", pickupTime: "",
  passengers: 1, vehicleType: vehicles[0], notes: "",
};

export default function TaxiBooking() {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/taxi", {
        method: "POST",
                headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("tv_token") && {
            Authorization: `Bearer ${localStorage.getItem("tv_token")}`,
          }),
        },
        body: JSON.stringify({ ...form, passengers: Number(form.passengers) }),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      setDone(data);
      setForm(empty);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <section className="taxi-hero text-center text-white">
        <Container>
          <h1 className="fw-bold">Taxi Booking</h1>
          <p className="lead mb-0">Safe, comfortable rides for airport transfers, city trips and tours.</p>
        </Container>
      </section>

      <Container className="pb-6">
        <div className="taxi-card mx-auto" style={{ maxWidth: 900 }}>
          {done ? (
            <div className="text-center py-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3.5rem" }} />
              <h3 className="mt-3">Booking request received!</h3>
              <p className="text-muted mb-1">
                Your booking reference is <strong>#{done._id.slice(-6).toUpperCase()}</strong>.
              </p>
              <p className="text-muted">Our team will call you on {done.phone} to confirm.</p>
              <div className="d-flex gap-2 justify-content-center">
                <Button className="btn-sun" onClick={() => setDone(null)}>Book another taxi</Button>
                <Button as={Link} to="/" variant="outline-dark" className="rounded-pill">Back to home</Button>
              </div>
            </div>
          ) : (
            <Form onSubmit={submit}>
              <h4 className="mb-4">Enter your trip details</h4>
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Full name *</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={change} required placeholder="Your name" />
                </Col>
                <Col md={6}>
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control type="tel" name="phone" value={form.phone} onChange={change} required
                    pattern="[0-9+\-\s]{8,15}" title="Enter a valid phone number" placeholder="+91 98765 43210" />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
                </Col>
                <Col md={6}>
                  <Form.Label>Trip type</Form.Label>
                  <Form.Select name="tripType" value={form.tripType} onChange={change}>
                    {tripTypes.map((t) => <option key={t}>{t}</option>)}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label><i className="bi bi-geo-alt me-1" />Pickup location *</Form.Label>
                  <Form.Control name="pickupLocation" value={form.pickupLocation} onChange={change} required placeholder="Kozhikode Railway Station" />
                </Col>
                <Col md={6}>
                  <Form.Label><i className="bi bi-flag me-1" />Drop location *</Form.Label>
                  <Form.Control name="dropLocation" value={form.dropLocation} onChange={change} required placeholder="Calicut Airport" />
                </Col>
                <Col md={4} xs={6}>
                  <Form.Label>Pickup date *</Form.Label>
                  <Form.Control type="date" min={today} name="pickupDate" value={form.pickupDate} onChange={change} required />
                </Col>
                <Col md={4} xs={6}>
                  <Form.Label>Pickup time *</Form.Label>
                  <Form.Control type="time" name="pickupTime" value={form.pickupTime} onChange={change} required />
                </Col>
                <Col md={4}>
                  <Form.Label>Passengers</Form.Label>
                  <Form.Control type="number" min="1" max="50" name="passengers" value={form.passengers} onChange={change} />
                </Col>
                <Col xs={12}>
                  <Form.Label>Vehicle type</Form.Label>
                  <Form.Select name="vehicleType" value={form.vehicleType} onChange={change}>
                    {vehicles.map((v) => <option key={v}>{v}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={12}>
                  <Form.Label>Extra notes</Form.Label>
                  <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={change} placeholder="Luggage, child seat, flight number..." />
                </Col>
              </Row>
              <Button type="submit" className="btn-sun mt-4" size="lg" disabled={saving}>
                {saving ? "Submitting..." : "Book taxi"}
              </Button>
            </Form>
          )}
        </div>
      </Container>
      <Footer />
    </>
  );
}