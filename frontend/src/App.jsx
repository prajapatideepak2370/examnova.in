import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import StudyMaterialsPage from './pages/StudyMaterialsPage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import ExamCategoriesPage from './pages/ExamCategoriesPage.jsx';
import CommentsPage from './pages/CommentsPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import UploadDocumentPage from './pages/admin/UploadDocumentPage.jsx';
import ManageDocumentsPage from './pages/admin/ManageDocumentsPage.jsx';
import ManageCommentsPage from './pages/admin/ManageCommentsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study-materials" element={<StudyMaterialsPage />} />
        <Route path="/study-materials/:slug" element={<DocumentDetailPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/exam-categories" element={<ExamCategoriesPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload" element={<UploadDocumentPage />} />
        <Route path="documents" element={<ManageDocumentsPage />} />
        <Route path="documents/:id/edit" element={<UploadDocumentPage />} />
        <Route path="comments" element={<ManageCommentsPage />} />
      </Route>
    </Routes>
  );
}
