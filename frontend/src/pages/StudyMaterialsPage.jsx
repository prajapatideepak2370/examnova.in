import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentBrowser from '../components/DocumentBrowser.jsx';

export default function StudyMaterialsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const keyword = searchParams.get('q') || '';

  const subheading = useMemo(() => {
    if (keyword) return `Showing results for "${keyword}".`;
    return 'Browse and read notes, question papers, practice sets and mock tests online.';
  }, [keyword]);

  return (
    <div className="container page-section">
      <DocumentBrowser
        heading="All study materials"
        subheading={subheading}
        initialKeyword={keyword}
      />
    </div>
  );
}
