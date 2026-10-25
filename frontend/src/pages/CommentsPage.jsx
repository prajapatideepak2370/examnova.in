import CommentSection from '../components/CommentSection.jsx';

export default function CommentsPage() {
  return (
    <div className="container page-section">
      <header className="page-header">
        <h1>Comments</h1>
        <p>
          Share your feedback, ask a question about a study material or suggest the subject you would like
          to see next.
        </p>
      </header>

      <CommentSection />
    </div>
  );
}
