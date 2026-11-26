import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page page--narrow">
      <h1 className="h1">Page not found</h1>
      <p className="lede">That address does not match a page or a problem.</p>
      <div className="btn-row" style={{ marginTop: 20 }}>
        <Link to="/problems" className="btn btn--primary">
          Browse problems
        </Link>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  );
}
