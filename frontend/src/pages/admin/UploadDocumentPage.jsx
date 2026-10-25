import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { fetchCategories } from '../../services/categoryService.js';
import { createDocument, fetchDocument, updateDocument } from '../../services/documentService.js';
import {
  ACCEPTED_FILE_EXTENSIONS,
  DOCUMENT_STATUSES,
  EXAMINATION_OPTIONS,
  MAX_UPLOAD_MB,
  SUBJECT_OPTIONS,
} from '../../utils/constants.js';
import { formatFileSize, formatFileType } from '../../utils/format.js';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  subject: '',
  examination: '',
  tags: '',
  status: 'draft',
  allowDownload: true,
};

const TIPS = [
  'Give the document a clear, descriptive title so students can find it in search.',
  'Pick the category first — it controls which subject listing the document appears under.',
  'Tags such as "ssc cgl 2024" or "polity notes" improve keyword matching.',
  'Save as a draft while the file is being reviewed, then publish it from Manage documents.',
];

export default function UploadDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!isEdit) return undefined;

    let active = true;
    setLoading(true);

    fetchDocument(id)
      .then((result) => {
        if (!active) return;
        const document = result.document;
        setExisting(document);
        setForm({
          title: document.title || '',
          description: document.description || '',
          category: document.category?._id || '',
          subject: document.subject || '',
          examination: document.examination || '',
          tags: (document.tags || []).join(', '),
          status: document.status || 'draft',
          allowDownload: document.allowDownload !== false,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const acceptFile = (candidate) => {
    if (!candidate) return;
    const extension = `.${candidate.name.split('.').pop().toLowerCase()}`;
    if (!ACCEPTED_FILE_EXTENSIONS.split(',').includes(extension)) {
      setError('Only PDF, DOC and DOCX files are supported.');
      return;
    }
    if (candidate.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`The file is larger than the ${MAX_UPLOAD_MB} MB limit.`);
      return;
    }
    setError('');
    setFile(candidate);
  };

  const validate = () => {
    const errors = {};
    if (form.title.trim().length < 5) errors.title = 'Title must be at least 5 characters.';
    if (!form.category) errors.category = 'Select a category for this document.';
    if (!isEdit && !file) errors.file = 'Attach a PDF, DOC or DOCX file to upload.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('subject', form.subject);
    formData.append('examination', form.examination);
    formData.append('tags', form.tags);
    formData.append('status', form.status);
    formData.append('allowDownload', form.allowDownload ? 'true' : 'false');
    if (file) formData.append('file', file);

    setSubmitting(true);
    setProgress(0);

    const onUploadProgress = (progressEvent) => {
      const percent = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0;
      setProgress(percent);
    };

    try {
      const result = isEdit
        ? await updateDocument(id, formData, onUploadProgress)
        : await createDocument(formData, onUploadProgress);

      navigate('/admin/documents', { state: { flash: result.message } });
    } catch (err) {
      setError(
        err.errors?.length ? `${err.message} (${err.errors.map((item) => item.message).join('; ')})` : err.message
      );
      setSubmitting(false);
      setProgress(0);
    }
  };

  const totalHint = useMemo(() => {
    if (categories.length === 0) return 'Loading categories...';
    return `${categories.length} categories available`;
  }, [categories.length]);

  if (loading) {
    return <LoadingSpinner label="Loading the document..." />;
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'Edit study material' : 'Upload study material'}</h1>
          <p>
            {isEdit
              ? 'Update the details, publish state or replace the uploaded file.'
              : 'Add a new PDF, DOC or DOCX document to the study library.'}
          </p>
        </div>
        <Link className="btn btn--outline btn--sm" to="/admin/documents">
          <Icon name="documents" size={16} />
          Back to documents
        </Link>
      </div>

      {error ? (
        <StatusMessage
          variant="error"
          compact
          title={isEdit ? 'The document could not be saved' : 'The document could not be uploaded'}
          message={error}
        />
      ) : null}

      <form className="upload-layout" onSubmit={handleSubmit} style={{ marginTop: error ? 20 : 0 }}>
        <div className="admin-card">
          <div className="form-section">
            <h2 className="form-section__title">Document details</h2>
            <p className="form-section__subtitle">These fields appear on the document page and in search.</p>

            <div className="field">
              <label htmlFor="document-title">Title</label>
              <input
                id="document-title"
                type="text"
                value={form.title}
                onChange={update('title')}
                placeholder="General Knowledge Notes for SSC CGL"
                maxLength={200}
                required
              />
              {fieldErrors.title ? <span className="field__error">{fieldErrors.title}</span> : null}
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="document-category">Category</label>
                <select id="document-category" value={form.category} onChange={update('category')} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category ? (
                  <span className="field__error">{fieldErrors.category}</span>
                ) : (
                  <span className="field__hint">{totalHint}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="document-subject">Subject</label>
                <select id="document-subject" value={form.subject} onChange={update('subject')}>
                  <option value="">Not specified</option>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="document-examination">Examination</label>
                <select
                  id="document-examination"
                  value={form.examination}
                  onChange={update('examination')}
                >
                  <option value="">All examinations</option>
                  {EXAMINATION_OPTIONS.map((examination) => (
                    <option key={examination} value={examination}>
                      {examination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="document-status">Publish state</label>
                <select id="document-status" value={form.status} onChange={update('status')}>
                  {DOCUMENT_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="field__hint">Drafts stay hidden from students until published.</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="document-description">Short description</label>
              <textarea
                id="document-description"
                value={form.description}
                onChange={update('description')}
                placeholder="What does this material cover, and which topics are included?"
                maxLength={2000}
              />
              <span className="field__hint">Up to 2000 characters. Shown on the document card.</span>
            </div>

            <div className="field">
              <label htmlFor="document-tags">Tags</label>
              <input
                id="document-tags"
                type="text"
                value={form.tags}
                onChange={update('tags')}
                placeholder="ssc cgl 2024, polity notes, revision"
              />
              <span className="field__hint">Separate tags with commas. Up to 15 tags are stored.</span>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section__title">File</h2>
            <p className="form-section__subtitle">
              {isEdit
                ? 'Leave this empty to keep the current file, or attach a new one to replace it.'
                : 'PDF documents are served directly. Word documents are converted to a PDF preview.'}
            </p>

            {existing && !file ? (
              <div className="file-pill" style={{ marginBottom: 14 }}>
                <span className="file-pill__icon" aria-hidden="true">
                  <Icon name="documents" size={18} />
                </span>
                <span className="file-pill__body">
                  <strong>{existing.originalName}</strong>
                  <small>
                    Current file · {formatFileType(existing.fileType)} · {formatFileSize(existing.fileSize)}
                    {existing.pageCount ? ` · ${existing.pageCount} pages` : ''}
                  </small>
                </span>
              </div>
            ) : null}

            <div
              className={`dropzone ${dragging ? 'is-dragging' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                acceptFile(event.dataTransfer.files?.[0]);
              }}
            >
              <span className="dropzone__icon" aria-hidden="true">
                <Icon name="upload" size={22} />
              </span>
              <span className="dropzone__label">
                {file ? file.name : 'Drag a file here or click to browse'}
              </span>
              <p className="dropzone__hint">
                Accepted formats: PDF, DOC, DOCX · maximum {MAX_UPLOAD_MB} MB
              </p>
              <input
                type="file"
                accept={ACCEPTED_FILE_EXTENSIONS}
                onChange={(event) => acceptFile(event.target.files?.[0])}
                aria-label="Choose the study material file"
              />
            </div>

            {fieldErrors.file ? <span className="field__error">{fieldErrors.file}</span> : null}

            {file ? (
              <div className="file-pill" style={{ marginTop: 14 }}>
                <span className="file-pill__icon" aria-hidden="true">
                  <Icon name="check" size={18} />
                </span>
                <span className="file-pill__body">
                  <strong>{file.name}</strong>
                  <small>Selected file · {formatFileSize(file.size)}</small>
                </span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setFile(null)}
                  disabled={submitting}
                >
                  Remove
                </button>
              </div>
            ) : null}

            {submitting && progress > 0 ? (
              <div>
                <div className="progress">
                  <span className="progress__bar" style={{ width: `${progress}%` }} />
                </div>
                <p className="field__hint" style={{ marginTop: 6 }}>
                  Uploading {progress}%
                </p>
              </div>
            ) : null}

            <label className="checkbox" style={{ marginTop: 18 }}>
              <input
                type="checkbox"
                checked={form.allowDownload}
                onChange={update('allowDownload')}
                disabled={submitting}
              />
              <span>Allow students to download the original file (recommended for offline revision).</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              <Icon name={isEdit ? 'check' : 'upload'} size={17} />
              {submitting
                ? isEdit
                  ? 'Saving...'
                  : 'Uploading...'
                : isEdit
                  ? 'Save changes'
                  : 'Upload document'}
            </button>
            <Link className="btn btn--ghost" to="/admin/documents">
              Cancel
            </Link>
            <span className="form-actions__spacer" />
            {existing ? (
              <Link
                className="btn btn--outline btn--sm"
                to={`/study-materials/${existing.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="external" size={16} />
                Preview page
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="admin-card">
          <h2 className="form-section__title">Upload checklist</h2>
          <p className="form-section__subtitle">A few things to check before publishing.</p>
          <ul className="summary-list">
            {TIPS.map((tip) => (
              <li key={tip}>
                <Icon name="check" size={16} />
                {tip}
              </li>
            ))}
          </ul>

          <p className="panel__text" style={{ marginTop: 18 }}>
            Very long documents may take a little longer while the preview and page count are generated.
          </p>
        </aside>
      </form>
    </>
  );
}
