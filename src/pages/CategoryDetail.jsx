import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Header, Footer, Pager, usePaging } from "../App.jsx";

const fallbackImg = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/420`;

export default function CategoryDetail() {
  const { name } = useParams(); // category name comes from the URL
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slice, page, pages, setPage } = usePaging(places);

  useEffect(() => {
    let alive = true;
    window.scrollTo(0, 0);
    setLoading(true); setError(null); setPage(1);
    fetch(`/api/places?category=${encodeURIComponent(name)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load destinations.");
        return r.json();
      })
      .then((d) => alive && setPlaces(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [name, setPage]);

  const go = (n) => {
    setPage(n);
    document.getElementById("cat-list")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <section className="taxi-hero text-center text-white">
        <Container>
          <h1 className="fw-bold">{name}</h1>
          <p className="lead mb-0">
            {loading ? "Loading..." : `${places.length} destination${places.length === 1 ? "" : "s"} in this category`}
          </p>
        </Container>
      </section>

      <section className="py-6" id="cat-list">
        <Container>
          <Button as={Link} to="/" variant="outline-dark" className="rounded-pill mb-4">
            <i className="bi bi-arrow-left me-1" />Back to home
          </Button>

          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && places.length === 0 && (
            <p className="text-muted">No destinations in "{name}" yet.</p>
          )}

          <Row className="g-4">
            {slice.map((p) => {
              const fb = fallbackImg(p.name);
              return (
                <Col key={p._id} md={6} lg={4}>
                  <Card className="tour-card h-100">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={p.imageUrl || fb}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fb; }}
                      />
                      {p.duration && <span className="badge-days">{p.duration}</span>}
                    </div>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title>{p.name}, {p.country}</Card.Title>
                        <span className="price">${p.price}<small>/day</small></span>
                      </div>
                      <Card.Text className="text-muted">
                        {p.description || `Explore ${p.name} with our guides.`}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <Pager page={page} pages={pages} onChange={go} />
        </Container>
      </section>
      <Footer />
    </>
  );
}