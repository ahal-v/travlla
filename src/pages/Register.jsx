import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Header, Footer } from "../App.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", mobile: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.message || `Registration failed (server error ${r.status})`);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <section className="taxi-hero text-center text-white">
        <Container>
          <h1 className="fw-bold">Create Account</h1>
          <p className="lead mb-0">Join Travlla to book tours and taxis</p>
        </Container>
      </section>

      <section className="py-6">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={5}>
              <Card className="p-4 border-0 shadow-sm">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={submit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control name="fullName" value={form.fullName} onChange={change} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      name="mobile" value={form.mobile} onChange={change}
                      inputMode="numeric" maxLength={10} pattern="[0-9]{10}"
                      title="Enter 10 digit mobile number" required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={form.email} onChange={change} required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password" name="password" value={form.password}
                      onChange={change} minLength={6} required
                    />
                  </Form.Group>
                  <Button type="submit" className="btn-sun w-100" disabled={busy}>
                    {busy ? "Registering..." : "Register"}
                  </Button>
                </Form>
                <p className="text-center mt-3 mb-0">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
    </>
  );
}