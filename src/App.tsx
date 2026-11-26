import { lazy, Suspense, useEffect } from 'react';
import { NavLink, Link, Route, Routes, useLocation } from 'react-router-dom';
import { MarkIcon, MoonIcon, SunIcon } from './components/Icons';
import { setPref, useStore } from './lib/store';
import { Home } from './pages/Home';
import { Problems } from './pages/Problems';
import { NotFound } from './pages/NotFound';

const Workspace = lazy(() => import('./pages/Workspace'));
const Questions = lazy(() => import('./pages/Questions'));
const Practice = lazy(() => import('./pages/Practice'));
const Mock = lazy(() => import('./pages/Mock'));
const Tracks = lazy(() => import('./pages/Tracks'));
const TrackDetail = lazy(() => import('./pages/TrackDetail'));
const About = lazy(() => import('./pages/About'));
const Progress = lazy(() => import('./pages/Progress'));

function useTheme() {
  const theme = useStore((s) => s.prefs.theme);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  return theme;
}

function ThemeToggle() {
  const theme = useTheme();
  const dark = document.documentElement.dataset.theme === 'dark';
  return (
    <button
      className="btn btn--ghost btn--sm"
      onClick={() => setPref('theme', dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'system' ? 'Following system theme' : undefined}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SolvedCount() {
  const solved = useStore((s) => Object.values(s.items).filter((i) => i.status === 'solved').length);
  if (!solved) return null;
  return (
    <Link to="/progress" className="nav-meta num" style={{ color: 'var(--label-3)' }}>
      {solved} solved
    </Link>
  );
}

export function App() {
  const { pathname } = useLocation();
  const fixed = pathname.startsWith('/p/');
  useTheme();
  useEffect(() => {
    if (!fixed) document.querySelector('.main')?.scrollTo(0, 0);
  }, [pathname, fixed]);

  return (
    <div className="shell">
      <header className="nav">
        <Link to="/" className="wordmark" aria-label="POM Proof home">
          <span className="wordmark-mark">
            <MarkIcon />
          </span>
          POM Proof
        </Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/problems" className="nav-link">
            Problems
          </NavLink>
          <NavLink to="/questions" className="nav-link">
            Questions
          </NavLink>
          <NavLink to="/mock" className="nav-link">
            Mock interview
          </NavLink>
          <NavLink to="/tracks" className="nav-link">
            Study plans
          </NavLink>
        </nav>
        <div className="nav-spacer" />
        <SolvedCount />
        <ThemeToggle />
      </header>
      <main className={fixed ? 'main main--fixed' : 'main'}>
        <Suspense fallback={<div className="empty">Loading</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/p/:id" element={<Workspace />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/practice" element={<Practice />} />
            <Route path="/mock" element={<Mock />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:id" element={<TrackDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
