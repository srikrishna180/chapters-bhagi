import { useEffect } from 'react';
import { Link, useLocation, useMatch, useNavigate, useOutlet } from 'react-router';
import Trail from '../components/Trail.jsx';
import { stops } from '../story/stops.js';

export default function Root() {
  const location = useLocation();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const match = useMatch('/chapter/:n');
  const index = match ? Number(match.params.n) - 1 : -1;

  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);

  return (
    <div className="app">
      {index >= 0 && (
        <>
          <header className="topbar">
            <Link to="/" className="brand">Bhagi</Link>
            <span className="count">{index + 1} / {stops.length}</span>
          </header>
          <Trail current={index} onSelect={(i) => navigate(`/chapter/${i + 1}`)} />
        </>
      )}
      <div key={location.pathname} className="page">{outlet}</div>
    </div>
  );
}
