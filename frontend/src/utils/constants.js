export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'title', label: 'Title (A to Z)' },
  { value: 'oldest', label: 'Oldest first' },
];

export const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF document' },
  { value: 'doc', label: 'Word (.doc)' },
  { value: 'docx', label: 'Word (.docx)' },
];

export const EXAMINATION_OPTIONS = [
  'SSC CGL',
  'SSC CHSL',
  'SSC MTS',
  'UPSC CSE',
  'IBPS PO',
  'IBPS Clerk',
  'RRB NTPC',
  'RRB Group D',
  'State PSC',
  'CDS',
  'NDA',
];

export const SUBJECT_OPTIONS = [
  'Indian History',
  'Indian Polity',
  'Indian Geography',
  'Static GK',
  'Arithmetic',
  'Data Interpretation',
  'Logical Reasoning',
  'General Science',
  'English Language',
  'Hindi Language',
  'Current Affairs',
  'Exam Strategy',
  'Mixed',
];

export const DOCUMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const DEFAULT_PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 10;

/** Kept in sync with MAX_UPLOAD_MB on the server. */
export const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 25);
export const ACCEPTED_FILE_EXTENSIONS = '.pdf,.doc,.docx';
