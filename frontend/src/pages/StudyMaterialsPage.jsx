import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentBrowser from '../components/DocumentBrowser.jsx';

export default function StudyMaterialsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const keyword = searchParams.get('q') || '';

  const subheading = useMemo(() => {
    if (keyword) return `Showing results for "${keyword}".`;
    return 'Search by title or subject, then filter by category and examination type to find exactly what you need.';
  }, [keyword]);

  return (
    <div className="container page-section">
      <DocumentBrowser
        heading="Study materials"
        subheading={subheading}
        initialKeyword={keyword}
      />
    </div>
  );
}
