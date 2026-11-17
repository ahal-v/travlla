import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [packages, setPackages] = useState([]);
  const [taxi, setTaxi] = useState([]);

  useEffect(() => {
    fetch("/api/places").then((r) => r.json()).then(setPlaces).catch(() => {});
    fetch("/api/packages").then((r) => r.json()).then(setPackages).catch(() => {});
    fetch("/api/taxi").then((r) => r.json()).then(setTaxi).catch(() => {});
  }, []);

  const cards = [
    { l: "Tourist places", n: places.length, i: "geo-alt" },
    { l: "Tour packages", n: packages.length, i: "box-seam" },
    { l: "Taxi bookings", n: taxi.length, i: "taxi-front" },
    { l: "Pending taxi requests", n: taxi.filter((t) => t.status === "Pending").length, i: "hourglass-split" },
  ];

  return (
    <>
      <h4 className="mb-4">Dashboard</h4>
      <Row className="g-3">
        {cards.map((c) => (
          <Col md={6} xl={3} key={c.l}>
            <div className="adm-card d-flex align-items-center gap-3">
              <i className={`bi bi-${c.i} fs-2 text-success`} />
              <div><h3 className="mb-0">{c.n}</h3><small className="text-muted">{c.l}</small></div>
            </div>
          </Col>
        ))}
      </Row>
      <div className="d-flex gap-2 mt-4 flex-wrap">
        <Link to="/admin/places" className="btn btn-dark">Manage places</Link>
        <Link to="/admin/packages" className="btn btn-outline-dark">Manage packages</Link>
        <Link to="/admin/taxi" className="btn btn-outline-dark">Taxi bookings</Link>
      </div>
    </>
  );
}