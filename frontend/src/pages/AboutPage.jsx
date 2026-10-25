import Icon from '../components/Icon.jsx';

const PILLARS = [
  {
    icon: 'search',
    title: 'Discover quickly',
    text: 'Search by title, subject, examination or tag and open any document in a single click.',
  },
  {
    icon: 'book',
    title: 'Read online',
    text: 'A distraction-free viewer with page navigation, zoom and fullscreen reading.',
  },
  {
    icon: 'shield',
    title: 'Stay exam ready',
    text: 'Material is organised by subject and exam type so you always know what to study next.',
  },
];

export default function AboutPage() {
  return (
    <div className="container page-section">
      <header className="page-header">
        <h1>About Study Materials Hub</h1>
        <p>
          Study Materials Hub is an all-in-one study library for students preparing for school
          examinations, entrance tests and competitive examinations of every kind.
        </p>
      </header>

      <div className="prose">
        <h2>What the platform offers</h2>
        <p>
          Every document is uploaded and published by the platform administrator, so the library stays
          curated rather than crowded. Study material is filed under subjects such as General Knowledge,
          Mathematics, Quantitative Aptitude, Reasoning, Science, English, Hindi, History, Geography,
          Political Science, Economics, Computer Knowledge, previous year question papers and mock tests.
          Subjects that are not listed can be filed under the &quot;Other&quot; category with a custom
          subject name.
        </p>
        <p>
          Students can browse the catalogue without creating an account. Filters for category, subject,
          examination type, document format and upload date make it easy to narrow down to exactly the
          material you need.
        </p>

        <h2>Examinations we support</h2>
        <p>
          The library covers government and public sector examinations, school examinations, entrance
          examinations, engineering and medical entrance tests, banking, railway and defence recruitment,
          along with other competitive examinations.
        </p>

        <h2>How material is delivered</h2>
        <p>
          PDF documents open directly in the online viewer, page by page. Word documents are converted to a
          PDF preview on the server so that they can be read in the browser as well; the original file is
          preserved and can be downloaded.
        </p>

        <h2>Editorial approach</h2>
        <p>
          Notes are written to be exam-oriented: key facts, formulas and frequently asked concepts are
          highlighted, and every practice question is followed by an explanation so that revision is
          self-contained.
        </p>
      </div>

      <div className="highlight-grid">
        {PILLARS.map((pillar) => (
          <article className="highlight-card" key={pillar.title}>
            <span className="highlight-card__icon" aria-hidden="true">
              <Icon name={pillar.icon} size={22} />
            </span>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
