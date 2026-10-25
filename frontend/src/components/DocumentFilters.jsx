import Icon from './Icon.jsx';
import { EXAMINATION_OPTIONS, FILE_TYPE_OPTIONS, SORT_OPTIONS, SUBJECT_OPTIONS } from '../utils/constants.js';

const EMPTY_FILTERS = {
  category: '',
  subject: '',
  examination: '',
  fileType: '',
  sort: 'newest',
  from: '',
  to: '',
};

export { EMPTY_FILTERS };

export default function DocumentFilters({ categories = [], value, onChange, onReset, disabled = false }) {
  const update = (key) => (event) => onChange({ ...value, [key]: event.target.value });

  return (
    <aside className="filters" aria-label="Filter study material">
      <div className="filters__header">
        <h2>
          <Icon name="filter" size={18} />
          Filters
        </h2>
        <button type="button" className="link-button" onClick={onReset} disabled={disabled}>
          Reset
        </button>
      </div>

      <div className="field">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" value={value.category} onChange={update('category')} disabled={disabled}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-subject">Subject</label>
        <select id="filter-subject" value={value.subject} onChange={update('subject')} disabled={disabled}>
          <option value="">All subjects</option>
          {SUBJECT_OPTIONS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-examination">Examination</label>
        <select
          id="filter-examination"
          value={value.examination}
          onChange={update('examination')}
          disabled={disabled}
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
        <label htmlFor="filter-type">Document format</label>
        <select id="filter-type" value={value.fileType} onChange={update('fileType')} disabled={disabled}>
          <option value="">All formats</option>
          {FILE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="filters__dates" disabled={disabled}>
        <legend>Upload date</legend>
        <div className="field">
          <label htmlFor="filter-from">From</label>
          <input id="filter-from" type="date" value={value.from} onChange={update('from')} />
        </div>
        <div className="field">
          <label htmlFor="filter-to">To</label>
          <input id="filter-to" type="date" value={value.to} onChange={update('to')} />
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="filter-sort">Sort by</label>
        <select id="filter-sort" value={value.sort} onChange={update('sort')} disabled={disabled}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
