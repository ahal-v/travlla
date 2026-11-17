import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import { Header, Footer } from "../App.jsx";
import { useAuth } from "../AuthContext.jsx";

const statusColor = { Pending: "warning", Confirmed: "primary", Completed: "success", Cancelled: "danger" };
const ref = (id) => "#" + id.slice(-6).toUpperCase();
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function Profile() {
  const { user, loading } = useAuth();
  const [taxi, setTaxi] = useState([]);
  const [packages, setPackages] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem("tv_token")}` };
    const get = (url) =>
      fetch(url, { headers }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Could not load your bookings"))
      );
    Promise.all([get("/api/taxi/my"), get("/api/package-bookings/my")])
      .then(([t, p]) => { setTaxi(t); setPackages(p); })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Header />
      <section className="taxi-hero text-center text-white">
        <Container>
          <h1 className="fw-bold">My Profile</h1>
          <p className="lead mb-0">Your details and booking history</p>
        </Container>
      </section>

      <section className="py-6">
        <Container>
          <Card className="border-0 shadow-sm p-4 mb-5">
            <h5 className="mb-3"><i className="bi bi-person-circle me-2" />Account details</h5>
            <Row className="g-3">
              <Col md={4}><small className="text-muted d-block">Full name</small><strong>{user.fullName}</strong></Col>
              <Col md={4}><small className="text-muted d-block">Mobile number</small><strong>{user.mobile}</strong></Col>
              <Col md={4}><small className="text-muted d-block">Email</small><strong>{user.email}</strong></Col>
            </Row>
          </Card>

          {error && <Alert variant="danger">{error}</Alert>}
          {!busy && !error && taxi.length === 0 && packages.length === 0 && (
            <p className="text-muted">You have no bookings yet.</p>
          )}

          {taxi.length > 0 && (
            <>
              <h5 className="mb-3"><i className="bi bi-taxi-front me-2" />Previous Taxi Bookings</h5>
              <div className="table-responsive mb-5">
                <Table bordered hover className="align-middle bg-white">
                  <thead className="table-light">
                    <tr>
                      <th>Ref</th><th>Pickup date</th><th>Time</th><th>Pickup</th><th>Drop</th>
                      <th>Vehicle</th><th>Passengers</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxi.map((b) => (
                      <tr key={b._id}>
                        <td>{ref(b._id)}</td>
                        <td>{b.pickupDate}</td>
                        <td>{b.pickupTime}</td>
                        <td>{b.pickupLocation}</td>
                        <td>{b.dropLocation}</td>
                        <td>{b.vehicleType}</td>
                        <td>{b.passengers}</td>
                        <td><Badge bg={statusColor[b.status] || "secondary"}>{b.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {packages.length > 0 && (
            <>
              <h5 className="mb-3"><i className="bi bi-luggage me-2" />Previous Tour Package Bookings</h5>
              <div className="table-responsive">
                <Table bordered hover className="align-middle bg-white">
                  <thead className="table-light">
                    <tr>
                      <th>Ref</th><th>Package</th><th>Destination</th><th>Travel date</th>
                      <th>Travellers</th><th>Total</th><th>Booked on</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((b) => (
                      <tr key={b._id}>
                        <td>{ref(b._id)}</td>
                        <td>{b.packageTitle}</td>
                        <td>{b.destination}</td>
                        <td>{b.travelDate}</td>
                        <td>{b.travelers}</td>
                        <td>${b.totalPrice}</td>
                        <td>{fmt(b.createdAt)}</td>
                        <td><Badge bg={statusColor[b.status] || "secondary"}>{b.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Container>
      </section>
      <Footer />
    </>
  );
}