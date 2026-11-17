import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Header, Footer } from "../App.jsx";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.message || `Login failed (server error ${r.status})`);
      login(data.token, data.user);
      navigate("/"); // back to the main website
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
          <h1 className="fw-bold">Login</h1>
          <p className="lead mb-0">Welcome back to Travlla</p>
        </Container>
      </section>

      <section className="py-6">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={5}>
              <Card className="p-4 border-0 shadow-sm">
                {location.state?.registered && (
                  <Alert variant="success">Registration successful. Please login.</Alert>
                )}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={submit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={form.email} onChange={change} required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" value={form.password} onChange={change} required />
                  </Form.Group>
                  <Button type="submit" className="btn-sun w-100" disabled={busy}>
                    {busy ? "Logging in..." : "Login"}
                  </Button>
                </Form>
                <p className="text-center mt-3 mb-0">
                  New user? <Link to="/register">Register</Link>
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