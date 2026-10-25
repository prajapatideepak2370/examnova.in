/** Shared branding so the name and tagline live in exactly one place. */
export const SITE_NAME = 'Study Materials Hub';
export const SITE_MARK = 'SM';
export const SITE_TAGLINE = 'Notes, PDFs and practice sets for every examination';

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

/**
 * Broad examination types the platform supports. Documents store the chosen value
 * in the `examination` field, exactly like an individual examination name.
 */
export const EXAM_TYPE_CARDS = [
  {
    title: 'Government & Public Sector',
    description: 'SSC, UPSC, state PSC and public sector recruitment examinations.',
  },
  {
    title: 'School Examination',
    description: 'Class 9 to 12 board and school level examination material.',
  },
  {
    title: 'Entrance Examination',
    description: 'University and institute entrance tests such as CUET, CLAT and CAT.',
  },
  {
    title: 'Engineering Entrance',
    description: 'JEE Main, JEE Advanced and state level engineering entrance tests.',
  },
  {
    title: 'Medical Entrance',
    description: 'NEET UG, NEET PG and other medical entrance examinations.',
  },
  {
    title: 'Banking',
    description: 'IBPS, SBI and RBI banking recruitment examinations.',
  },
  {
    title: 'Railway',
    description: 'RRB NTPC, Group D, ALP and other railway recruitment examinations.',
  },
  {
    title: 'Defence',
    description: 'NDA, CDS, AFCAT and other defence services examinations.',
  },
  {
    title: 'Other Competitive Examination',
    description: 'Any other competitive examination with a written test.',
  },
];

export const EXAM_TYPE_OPTIONS = EXAM_TYPE_CARDS.map((item) => item.title);

/** Individual examinations, kept for material that targets one specific exam. */
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
  'JEE Main',
  'NEET UG',
  'Class 10 Board',
  'Class 12 Board',
];

/**
 * One grouped source for every examination select, so the upload form and the
 * filters can never drift apart.
 */
export const EXAM_OPTION_GROUPS = [
  { label: 'Examination type', options: EXAM_TYPE_OPTIONS },
  { label: 'Popular examinations', options: EXAMINATION_OPTIONS },
];

/**
 * Values offered by the "Subject" field. Material filed under the "Other" category
 * may use any custom subject name, and these are also shown as suggestions.
 */
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
  'Computer Science',
  'Environmental Studies',
  'Agriculture',
  'Sociology',
  'Psychology',
  'Exam Strategy',
  'Mixed',
];

/**
 * Slug of the catch-all category. Material assigned to it can carry a free-text
 * custom subject name. Category values themselves come from the API
 * (`fetchCategories`) so there is a single source of truth for the dropdown.
 */
export const OTHER_CATEGORY_SLUG = 'other';

export const DOCUMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const DEFAULT_PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 10;

/** Kept in sync with MAX_UPLOAD_MB on the server. */
export const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 25);
export const ACCEPTED_FILE_EXTENSIONS = '.pdf,.doc,.docx';
