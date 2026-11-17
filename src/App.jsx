import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import BookPackageModal from "./BookPackageModal.jsx";
import {
  Navbar, Nav, NavDropdown, Container, Row, Col, Card, Button,
  Form, InputGroup, Carousel, Pagination,
} from "react-bootstrap";

/* ---------- Data (swap img URLs with your own images) ---------- */
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* Loads places added from the admin panel (MongoDB) */
function usePlaces() {
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    fetch("/api/places")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPlaces)
      .catch(() => {});
  }, []);
  return places;
}

/* Loads active tour packages added from the admin panel */
function usePackages() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/packages?status=Active")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {});
  }, []);
  return items;
}

function useCategories() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {});
  }, []);
  return items;
}

const PAGE_SIZE = 3; 


export function usePaging(list, size = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(page, pages);
  const slice = list.slice((current - 1) * size, current * size);
  return { slice, page: current, pages, setPage };
}


export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [...new Set([1, pages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  return (
    <Pagination className="tv-pager justify-content-center mt-5 mb-0">
      <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {nums.map((n, i) => (
        <span key={n} className="d-flex">
          {i > 0 && n - nums[i - 1] > 1 && <Pagination.Ellipsis disabled />}
          <Pagination.Item active={n === page} onClick={() => onChange(n)}>{n}</Pagination.Item>
        </span>
      ))}
      <Pagination.Next disabled={page === pages} onClick={() => onChange(page + 1)} />
    </Pagination>
  );
}

const menu = [
  { label: "Home", items: ["Home 1", "Home 2", "Home 3", "Home 4"] },
  { label: "About" },
  { label: "Pages", items: ["Services", "Gallery", "Testimonial", "Tour Guide", "FAQ", "Pricing", "404"] },
  { label: "Destinations", items: ["Grid 1", "Grid 2", "Grid 3", "Detail"] },
  { label: "Tours", items: ["List Style", "Grid 1", "Grid 2", "Detail"] },
  { label: "Blogs", items: ["Blog Grid", "Blog List", "Blog Detail"] },
  { label: "Taxi Booking", to: "/taxi-booking" },
  { label: "Contact" },
];

const destinations = ["Paris", "Maldives", "Hong Kong", "Thailand", "Bangkok", "Tokyo", "Spain", "California"];

const tours = [
  { t: "Bali, Indonesia", d: "8 days, 3 nights", p: 59, s: "Nusa Penida is a stunning island southeast of Bali." },
  { t: "South Korea", d: "4 days, 2 nights", p: 75, s: "Hike Deogyusan, whose highest peak is 1,614 m." },
  { t: "Tokyo City, Japan", d: "6 days, 3 nights", p: 99, s: "Panoramic views of Tokyo Tower and the skyline." },
  { t: "Plateau in Slovenia", d: "8 days, 3 nights", p: 149, s: "Alpine meadows, lakes and quiet mountain villages." },
  { t: "Switzerland Package", d: "4 days, 2 nights", p: 129, s: "Scenic trains, glaciers and lakeside towns." },
  { t: "Kyoto Temples", d: "6 days, 3 nights", p: 79, s: "Temples, tea houses and bamboo groves." },
];

const stats = [
  { n: "3600+", l: "Awards Winning", i: "trophy" },
  { n: "3600+", l: "Happy Travelers", i: "emoji-smile" },
  { n: "2.5K", l: "Tours Success", i: "geo-alt" },
  { n: "25+", l: "Years Experience", i: "calendar-check" },
];

const services = [
  { i: "airplane", t: "Exclusive Trip", d: "We pay attention to every quality in the service we provide to you." },
  { i: "ticket-perforated", t: "Easy Booking", d: "Booking process and full support service assistance from us." },
  { i: "compass", t: "Professional Guide", d: "While on vacation you will be guided by our professional guide." },
];

const placePills = [
  ["Paris", 250], ["Thailand", 65], ["Bangkok", 175], ["Dubai", 130], ["France", 140], ["London", 350],
];

const steps = [
  { i: "pin-map", t: "Choose Destination", d: "First, select your preferred destination and proceed further." },
  { i: "credit-card", t: "Make Payment", d: "Pay securely online. We confirm your booking instantly." },
  { i: "luggage", t: "Ready For Travelling", d: "Pack your bags. Your guide and itinerary are all set." },
];

const reviews = [
  { n: "Amelia Warner", r: "Tourist", q: "Once the travel bug bites, there is no known antidote. A journey is best measured in friends." },
  { n: "Kavin Martin", r: "Traveler", q: "I was very impressed. The whole trip was planned well and our guide was wonderful." },
  { n: "Antonio", r: "Tourist", q: "Easy booking, great support and unforgettable places. I will travel with them again." },
];

const blogs = [
  { d: "14 June", a: "Aidan Butler", t: "Resources for your first trip to an overseas vacation" },
  { d: "26 June", a: "Ricardo Bell", t: "How to get acquainted with natives in a strange land" },
  { d: "20 June", a: "Martin Hicks", t: "Resources for your first trip to an overseas vacation" },
  { d: "28 June", a: "Poul Ward", t: "Step by step guide to planning your ideal holiday" },
];

/* ---------- Components ---------- */
function Heading({ title, sub }) {
  return (
    <div className="text-center mb-5">
      <h2 className="section-title">{title}</h2>
      <p className="text-muted mx-auto" style={{ maxWidth: 520 }}>{sub}</p>
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" sticky="top" className="tv-nav">
      <Container>
        <Navbar.Brand as={Link} to="/" className="tv-logo"><i className="bi bi-compass-fill me-2" />Travlla</Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="mx-auto">
            {menu.map((m) =>
              m.items ? (
                <NavDropdown key={m.label} title={m.label}>
                  {m.items.map((x) => <NavDropdown.Item key={x} href="#">{x}</NavDropdown.Item>)}
                </NavDropdown>
              ) : m.to ? (
                <Nav.Link key={m.label} as={Link} to={m.to}>{m.label}</Nav.Link>
              ) : (
                <Nav.Link key={m.label} href="#">{m.label}</Nav.Link>
              )
            )}
          </Nav>
          <div className="d-flex gap-2 fs-5 align-items-center">
            {["facebook", "twitter-x", "linkedin", "instagram"].map((s) => (
              <a key={s} href="#" className="social"><i className={`bi bi-${s}`} /></a>
            ))}

            {/* Profile dropdown */}
            <Nav>
              <NavDropdown
                align="end"
                id="profile-menu"
                title={
                  <span>
                    <i className="bi bi-person-circle fs-4" />
                    {user && <span className="ms-2 fs-6">{user.fullName.split(" ")[0]}</span>}
                  </span>
                }
              >
                {user ? (
                  <>
                    <NavDropdown.ItemText className="fw-semibold">{user.fullName}</NavDropdown.ItemText>
                    <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/register">Register</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/login">Login</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Hero() {
  return (
    <section className="hero">
      <Container className="text-center text-white position-relative">
        <p className="hero-kicker">Explore</p>
        <h1 className="hero-title">Vietnam</h1>
        <p className="lead mb-4">The safety of our customers at all stages</p>
        <Button size="lg" className="btn-sun" href="#contact">Get In Touch</Button>
      </Container>
      <Container className="search-wrap">
        <Form className="search-box">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label><i className="bi bi-geo-alt me-1" />Location</Form.Label>
              <Form.Select>
                <option>Any</option><option>New Zealand</option><option>Paris</option><option>Bali, Indonesia</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label><i className="bi bi-activity me-1" />Activity Type</Form.Label>
              <Form.Select>
                <option>Any</option><option>Adventure</option><option>Beyond the Edge</option><option>Wave Riders</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label><i className="bi bi-calendar-event me-1" />Date</Form.Label>
              <Form.Control type="date" />
            </Col>
            <Col md={2}>
              <Form.Label><i className="bi bi-people me-1" />Travelers</Form.Label>
              <Form.Control type="number" min="1" defaultValue="2" />
            </Col>
            <Col md={2}>
              <Button className="btn-sun w-100" type="submit"><i className="bi bi-search me-1" />Search</Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </section>
  );
}

function Destinations() {
  const places = usePlaces();
  const all = places.length
    ? places.map((p, i) => ({ key: p._id, name: p.name, src: p.imageUrl, i }))
    : destinations.map((d, i) => ({ key: d, name: d, src: "", i }));

  const { slice, page, pages, setPage } = usePaging(all);
  const go = (n) => {
    setPage(n);
    document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-6" id="destinations">
      <Container>
        <Heading title="Popular Destination" sub="Destinations worth exploring! Here are a few popular spots." />
        <Row className="g-4">
          {slice.map((d) => (
            <Col key={d.key} xs={12} sm={6} lg={4}>
              <a
                href="#"
                className="dest-card"
                style={{
                  backgroundImage: `${d.src ? `url("${d.src}"), ` : ""}url("${img(encodeURIComponent(d.name) + d.i, 500, 650)}")`,
                }}
              >
                <span>{d.name}</span>
              </a>
            </Col>
          ))}
        </Row>
        <Pager page={page} pages={pages} onChange={go} />
      </Container>
    </section>
  );
}

function Categories() {
  const cats = useCategories();
  const { slice, page, pages, setPage } = usePaging(cats);
  if (!cats.length) return null;

  const go = (n) => {
    setPage(n);
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-6" id="categories">
      <Container>
        <Heading title="Explore Our Categories" sub="Pick a category to see the destinations that match it." />
        <Row className="g-4">
          {slice.map((c) => (
            <Col key={c._id} xs={12} sm={6} lg={4}>
              <Link
                to={`/category/${encodeURIComponent(c.name)}`}
                className="dest-card"
                style={{ backgroundColor: "#0e5a6b", backgroundImage: c.image ? `url("${c.image}")` : "none" }}
              >
                <span>{c.name}</span>
              </Link>
            </Col>
          ))}
        </Row>
        <Pager page={page} pages={pages} onChange={go} />
      </Container>
    </section>
  );
}

function Recommend() {
  return (
    <section className="py-6 bg-sand">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <h2 className="section-title">We Recommend Beautiful Destinations Every Month</h2>
            <p className="text-muted">
              Travlla is a multi-award-winning strategy and content creation agency that specializes in
              travel marketing, helping brands and tourism boards reach a global audience.
            </p>
            <Row className="g-3 my-3">
              <Col sm={6}>
                <div className="mini-box"><i className="bi bi-headset" /><div><h6>Trusted travel guide</h6>
                <small>Reliable information to plan trips efficiently and safely.</small></div></div>
              </Col>
              <Col sm={6}>
                <div className="mini-box"><i className="bi bi-bullseye" /><div><h6>Mission & Vision</h6>
                <small>Connecting people to positive experiences through travel.</small></div></div>
              </Col>
            </Row>
            <div className="d-flex align-items-center gap-4 mt-4">
              <Button className="btn-sun">Discover More</Button>
              <div><strong className="fs-4">3.5k</strong><br /><small className="text-muted">Happy Customers</small></div>
              <div><strong className="fs-4">25</strong><br /><small className="text-muted">Years of Experience</small></div>
            </div>
          </Col>
          <Col lg={6}>
            <Row className="g-3">
              <Col xs={7}><img className="rounded-4 w-100" src={img("rec1", 600, 760)} alt="" /></Col>
              <Col xs={5} className="pt-5"><img className="rounded-4 w-100" src={img("rec2", 400, 560)} alt="" /></Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function Brands() {
  return (
    <section className="py-5">
      <Container>
        <h4 className="text-center mb-4">1K+ Brands Trust Us</h4>
        <div className="brands">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="brand"><i className="bi bi-globe-americas me-2" />Brand {n}</div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Video() {
  return (
    <section className="video-sec">
      <Container className="text-white text-center position-relative">
        <a href="https://www.youtube.com/watch?v=bXlQ3Mw4uGc" target="_blank" rel="noreferrer" className="play">
          <i className="bi bi-play-fill" />
        </a>
        <h2 className="display-5 fw-bold">Say Yes! To New Adventure</h2>
        <Row className="mt-5 g-4">
          {stats.map((s) => (
            <Col key={s.l} xs={6} md={3}>
              <i className={`bi bi-${s.i} fs-1`} />
              <h3 className="mb-0">{s.n}</h3>
              <p className="opacity-75">{s.l}</p>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

function Services() {
  return (
    <section className="py-6">
      <Container>
        <Heading title="We Offer Best Services"
          sub="Everything you need for a smooth trip, from booking to the last day of your holiday." />
        <Row className="g-4">
          {services.map((s, i) => (
            <Col md={4} key={s.t}>
              <Card className="service-card h-100 border-0">
                <Card.Body className="p-4">
                  <i className={`bi bi-${s.i} service-icon`} />
                  <Card.Title className="mt-3">{s.t}</Card.Title>
                  <Card.Text className="text-muted">{s.d}</Card.Text>
                  <small className="step">Step 0{i + 1}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

function Places() {
  return (
    <section className="py-5 bg-ink text-white">
      <Container>
        <Row className="align-items-center g-4">
          <Col lg={4}>
            <p className="text-warning mb-1">Popular!</p>
            <h3>Search by city</h3>
            <InputGroup className="mt-3">
              <Form.Control placeholder="Search a city" />
              <Button className="btn-sun"><i className="bi bi-search" /></Button>
            </InputGroup>
          </Col>
          <Col lg={8}>
            <Row className="g-3">
              {placePills.map(([n, c]) => (
                <Col key={n} xs={6} md={4}>
                  <a href="#" className="place-pill"><span>{c} Tour</span><strong>{n}</strong></a>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function Tours() {
  const packages = usePackages();
  const [selected, setSelected] = useState(null);
  const all = packages.length
    ? packages.map((p, i) => ({
        id: p._id,
        real: true,
        t: p.title,
        d: `${p.days} days, ${p.nights} nights`,
        p: p.price,
        unit: "/person",
        s: p.description || `Explore ${p.destination} with our guides.`,
        rating: p.rating,
        src: p.imageUrl,
        maxPeople: p.maxPeople,
        i,
      }))
    : tours.map((t, i) => ({ id: t.t + i, real: false, ...t, unit: "/day", rating: 4.8, src: "", i }));

  const { slice, page, pages, setPage } = usePaging(all);
  const go = (n) => {
    setPage(n);
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-6" id="tours">
      <Container>
        <Heading title="Explore Popular Tours!" sub="Destinations worth exploring! Here are a few popular spots." />
        <Row className="g-4">
          {slice.map((t) => {
            const fallback = img("tour" + t.i, 600, 420);
            return (
              <Col key={t.id} md={6} lg={4}>
                <Card className="tour-card h-100">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={t.src || fallback}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
                    />
                    <span className="badge-days">{t.d}</span>
                  </div>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{t.t}</Card.Title>
                      <span className="price">${t.p}<small>{t.unit}</small></span>
                    </div>
                    <Card.Text className="text-muted">{t.s}</Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between align-items-center bg-white border-0 pb-3">
                    <Button
                      className="btn-sun btn-sm"
                      disabled={!t.real}
                      title={t.real ? "" : "Sample package (add packages from the admin panel)"}
                      onClick={() => setSelected(t)}
                    >
                      Book Now
                    </Button>
                    <small><i className="bi bi-star-fill text-warning me-1" />{t.rating} Review</small>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Pager page={page} pages={pages} onChange={go} />
      </Container>

      {selected && (
        <BookPackageModal key={selected.id} pkg={selected} onHide={() => setSelected(null)} />
      )}
    </section>
  );
}

function BookingSteps() {
  return (
    <section className="py-6 bg-sand">
      <Container>
        <Heading title="3 Easy Steps for Book Your Next Trip" sub="From picking a place to boarding the plane." />
        <Row className="g-4 align-items-stretch">
          <Col lg={4}>
            <div className="offer" style={{ backgroundImage: `url(${img("offer", 600, 700)})` }}>
              <small>Get Special Offer</small>
              <h2>48% Off</h2>
            </div>
          </Col>
          <Col lg={8}>
            <Row className="g-4">
              {steps.map((s, i) => (
                <Col md={4} key={s.t}>
                  <div className="step-box">
                    <span className="step-n">{i + 1}</span>
                    <i className={`bi bi-${s.i}`} />
                    <h5>{s.t}</h5>
                    <p className="text-muted mb-0">{s.d}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function WhyUs() {
  const list = ["Perfect Detailing", "Save Your Budget", "Free Consultations", "Completed Certification"];
  return (
    <section className="py-6">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={5}><img className="rounded-4 w-100" src={img("why", 600, 640)} alt="" /></Col>
          <Col lg={7}>
            <h2 className="section-title">Why Choose Us!</h2>
            <Row className="g-3 my-3">
              {list.map((x) => (
                <Col sm={6} key={x}><i className="bi bi-check-circle-fill text-success me-2" />{x}</Col>
              ))}
            </Row>
            <div className="d-flex align-items-center gap-4">
              <Button className="btn-sun">Discover More</Button>
              <div><small className="text-muted">Call Us</small><h5 className="mb-0">206-242-1112</h5></div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  return (
    <section className="py-6 bg-sand">
      <Container>
        <Heading title="Our Client Says!" sub="Real words from travelers who booked with us." />
        <Carousel activeIndex={i} onSelect={setI} indicators interval={5000} className="pb-5">
          {reviews.map((r, k) => (
            <Carousel.Item key={r.n}>
              <div className="review mx-auto text-center">
                <img src={img("avatar" + k, 120, 120)} className="avatar" alt={r.n} />
                <i className="bi bi-quote d-block fs-1 text-warning" />
                <p className="fs-5">{r.q}</p>
                <h5 className="mb-0">{r.n}</h5>
                <small className="text-muted">{r.r}</small>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

function Adventure() {
  return (
    <section className="adventure text-center text-white" id="contact">
      <Container>
        <h2 className="display-4 fw-bold">Adventure</h2>
        <p className="fs-4">It's time to travel</p>
        <Button size="lg" className="btn-sun">Booking Now</Button>
      </Container>
    </section>
  );
}

function Blog() {
  return (
    <section className="py-6">
      <Container>
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <h2 className="section-title mb-0">Explore Latest News</h2>
          <Button variant="outline-dark" className="rounded-pill">See More Articles</Button>
        </div>
        <Row className="g-4">
          {blogs.map((b, i) => (
            <Col key={i} md={6} lg={3}>
              <Card className="blog-card h-100 border-0">
                <Card.Img variant="top" src={img("blog" + i, 500, 360)} />
                <Card.Body className="px-0">
                  <small className="text-muted"><i className="bi bi-calendar3 me-1" />{b.d} &nbsp; <i className="bi bi-person me-1" />{b.a}</small>
                  <Card.Title as="h6" className="mt-2"><a href="#">{b.t}</a></Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="py-5 bg-ink text-white">
      <Container>
        <Row className="align-items-center g-3">
          <Col md={6}>
            <h3>Subscribe Now!</h3>
            <p className="mb-0 opacity-75">Sign up to our weekly newsletter to get the latest updates.</p>
          </Col>
          <Col md={6}>
            <Form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
              <InputGroup>
                <Form.Control type="email" required placeholder="Email address" />
                <Button type="submit" className="btn-sun">Subscribe</Button>
              </InputGroup>
              {done && <small className="text-warning">Thanks! You're subscribed.</small>}
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export function Footer() {
  const cols = {
    Explore: ["About us", "FAQ's", "Services", "Team", "News & Articles"],
    Destinations: ["Tokyo", "France", "Dubai", "Kenya", "Vietnam"],
    Legal: ["Terms & Condition", "Privacy Policy", "Contact", "Careers", "Help"],
  };
  return (
    <footer className="tv-footer">
      <Container>
        <Row className="g-4 py-5">
          <Col lg={3}>
            <div className="tv-logo mb-3"><i className="bi bi-compass-fill me-2" />Travlla</div>
            <p className="opacity-75">A multi-award-winning agency that specializes in travel marketing.</p>
            <div className="d-flex gap-3 fs-5">
              {["twitter-x", "facebook", "instagram", "pinterest"].map((s) => (
                <a key={s} href="#"><i className={`bi bi-${s}`} /></a>
              ))}
            </div>
          </Col>
          {Object.entries(cols).map(([h, items]) => (
            <Col key={h} xs={6} lg={2}>
              <h6>{h}</h6>
              <ul className="list-unstyled">
                {items.map((x) => <li key={x}><a href="#">{x}</a></li>)}
              </ul>
            </Col>
          ))}
          <Col lg={3}>
            <h6>Follow Instagram</h6>
            <div className="insta">
              {[1, 2, 3, 4, 5, 6].map((n) => <img key={n} src={img("insta" + n, 120, 120)} alt="" />)}
            </div>
            <p className="mt-3 mb-0 small opacity-75">
              <i className="bi bi-telephone me-2" />123 654 0214<br />
              <i className="bi bi-geo-alt me-2" />55/11 Ronin Tower, New York
            </p>
          </Col>
        </Row>
        <div className="border-top border-secondary py-3 small opacity-75 text-center">
          © {new Date().getFullYear()} Travlla. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Hero />
      <Destinations />
      <Categories />
      <Recommend />
      <Brands />
      <Video />
      <Services />
      <Places />
      <Tours />
      <BookingSteps />
      <WhyUs />
      <Testimonials />
      <Adventure />
      <Blog />
      <Newsletter />
      <Footer />
    </>
  );
}