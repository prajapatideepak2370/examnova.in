import TopicCard from '../components/TopicCard.jsx';
import { EXAM_TYPE_CARDS, EXAMINATION_OPTIONS } from '../utils/constants.js';

export default function ExamCategoriesPage() {
  return (
    <div className="container page-section">
      <header className="page-header">
        <h1>Exam categories</h1>
        <p>
          Study material is organised by examination type. Choose a category to see everything available
          for it, or jump straight to a popular examination.
        </p>
      </header>

      <div className="category-grid">
        {EXAM_TYPE_CARDS.map((examType) => (
          <TopicCard
            key={examType.title}
            icon="preparation"
            title={examType.title}
            description={examType.description}
            to={`/study-materials?examination=${encodeURIComponent(examType.title)}`}
          />
        ))}
      </div>

      <section className="page-section">
        <header className="section__header">
          <div>
            <h2>Popular examinations</h2>
            <p>Material that targets one specific examination.</p>
          </div>
        </header>

        <div className="category-grid">
          {EXAMINATION_OPTIONS.map((examination) => (
            <TopicCard
              key={examination}
              icon="papers"
              title={examination}
              to={`/study-materials?examination=${encodeURIComponent(examination)}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
