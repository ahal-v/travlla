import { Pagination } from "react-bootstrap";
import Pager from "../admin/AdminPager.jsx";

export default function AdminPager({ page, pages, total, size, onChange }) {
  if (total <= size) return null;
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 border-top">
      <small className="text-muted">Showing {from}-{to} of {total}</small>
      <Pagination className="mb-0" size="sm">
        <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <Pagination.Item key={n} active={n === page} onClick={() => onChange(n)}>{n}</Pagination.Item>
        ))}
        <Pagination.Next disabled={page === pages} onClick={() => onChange(page + 1)} />
      </Pagination>
    </div>
  );
}