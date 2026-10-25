import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search notes, PDFs, GK questions, mathematics...',
  size = 'large',
  autoFocus = false,
  onSubmit,
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (event) => {
    event.preventDefault();
    const keyword = value.trim();
    if (onSubmit) {
      onSubmit(keyword);
      return;
    }
    navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/study-materials');
  };

  return (
    <form className={`search-bar search-bar--${size}`} onSubmit={handleSubmit} role="search">
      <span className="search-bar__icon" aria-hidden="true">
        <Icon name="search" size={size === 'large' ? 20 : 18} />
      </span>
      <input
        type="search"
        className="search-bar__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search study material"
        autoFocus={autoFocus}
      />
      <button type="submit" className="btn btn--primary search-bar__button">
        Search
      </button>
    </form>
  );
}
