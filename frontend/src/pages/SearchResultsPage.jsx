import { useSearchParams } from 'react-router-dom';
import DocumentBrowser from '../components/DocumentBrowser.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const keyword = (searchParams.get('q') || '').trim();

  if (!keyword) {
    return (
      <div className="container page-section">
        <StatusMessage
          variant="info"
          title="Enter a search term"
          message="Use the search bar at the top of the page to look for notes, PDFs, GK questions or mathematics material."
        />
      </div>
    );
  }

  return (
    <div className="container page-section">
      <DocumentBrowser
        key={keyword}
        heading={`Search results for "${keyword}"`}
        subheading="Results are matched against titles, descriptions, subjects, examinations and tags."
        initialKeyword={keyword}
      />
    </div>
  );
}
