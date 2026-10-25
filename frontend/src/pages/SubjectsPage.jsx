import { Link } from 'react-router-dom';
import TopicCard from '../components/TopicCard.jsx';
import { OTHER_CATEGORY_SLUG, SUBJECT_OPTIONS } from '../utils/constants.js';

export default function SubjectsPage() {
  return (
    <div className="container page-section">
      <header className="page-header">
        <h1>Subjects</h1>
        <p>
          Browse study material by subject. Pick a subject to see every note, PDF and practice set filed
          under it.
        </p>
      </header>

      <div className="category-grid">
        {SUBJECT_OPTIONS.map((subject) => (
          <TopicCard
            key={subject}
            icon="book"
            title={subject}
            to={`/study-materials?subject=${encodeURIComponent(subject)}`}
          />
        ))}
      </div>

      <p className="panel__text" style={{ marginTop: 24 }}>
        Looking for something that is not listed? Material for any other subject is filed under{' '}
        <Link to={`/study-materials?category=${OTHER_CATEGORY_SLUG}`}>Other</Link> with a custom subject
        name.
      </p>
    </div>
  );
}
