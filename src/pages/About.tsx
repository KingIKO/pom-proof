import { Link } from 'react-router-dom';
import { KIND_INFO, KIND_ORDER } from '../content/kinds';
import './pages.css';

export default function About() {
  return (
    <div className="page page--narrow">
      <h1 className="h1">About POM Proof</h1>
      <p className="lede">POM Proof is interview practice for QA, test automation and SDET roles. It pairs graded problems with spoken questions and role-based study plans.</p>
      <div className="pp-actions"><Link className="btn btn--primary" to="/problems">Browse problems</Link></div>

      <section className="section" aria-labelledby="grading-heading">
        <h2 className="h2" id="grading-heading">How problems are graded</h2>
        <dl className="pp-grade-list">
          {KIND_ORDER.map((kind) => (
            <div key={kind}>
              <dt><Link to={`/problems?kind=${kind}`}>{KIND_INFO[kind].plural}</Link></dt>
              <dd>{KIND_INFO[kind].graded}</dd>
            </div>
          ))}
        </dl>
        <p>The scenario checklist is self-confirmed. Keywords suggest which entries you may have covered; they cannot judge the quality of an answer. Flashcards and spoken mock answers are self-rated.</p>
        <p>The locator engine teaches a subset of Playwright syntax and behavior. The UI labs use a simplified Playwright-style API. Use the official tools for full browser testing.</p>
      </section>

      <section className="section" aria-labelledby="privacy-heading">
        <h2 className="h2" id="privacy-heading">Privacy and storage</h2>
        <p>There is no account. Grading runs in the browser, and progress and drafts are saved in localStorage. Mock notes and ratings stay in sessionStorage for the current tab. Python downloads Pyodide on first use so it can run locally.</p>
        <p>Clearing site data removes local progress. Use <Link to="/progress">Progress</Link> to download or restore a copy.</p>
      </section>

      <section className="section" aria-labelledby="credits-heading">
        <h2 className="h2" id="credits-heading">Credits</h2>
        <p>The exercises and model answers were written for POM Proof. Individual questions link to source material such as the ISTQB syllabus and official tool documentation. The editor uses CodeMirror, the SQL runner uses sql.js, and the Python runner uses Pyodide.</p>
      </section>
    </div>
  );
}

