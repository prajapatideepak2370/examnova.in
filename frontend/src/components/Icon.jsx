/**
 * Single stroke-based icon set (24x24, currentColor) so the interface keeps one
 * consistent visual language without an external icon dependency.
 */
const ICONS = {
  // ---- Category icons ----
  gk: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3',
  math: 'M5 7h5M7.5 4.5v5M14 7h5M15 17h5M14 5.5l5 5M19 5.5l-5 5M5 17h5',
  'current-affairs': 'M4 5h11a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h6M7 12h6M7 15h4',
  reasoning: 'M9 18h6M10 21h4M12 3a7 7 0 0 0-4.2 12.6c.5.4.8 1 .8 1.6V18h6.8v-.8c0-.6.3-1.2.8-1.6A7 7 0 0 0 12 3',
  science: 'M9 3h6M10 3v5.5L4.8 18A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.8-3L14 8.5V3M7.5 15h9',
  english: 'M6 20 12 4l6 16M8.5 14.5h7',
  hindi: 'M7 20V5h6a4 4 0 0 1 0 8H7M15 13l5 7',
  preparation: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M12 11.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1',
  papers: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 12h6M9 15h6M9 18h3',
  'mock-tests': 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 8v4.5l3 1.8M9 2h6',

  // ---- Interface icons ----
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4.3-4.3',
  download: 'M12 4v10m0 0-4-4m4 4 4-4M5 19h14',
  upload: 'M12 20V10m0 0-4 4m4-4 4 4M5 5h14',
  'chevron-left': 'M14.5 18 8.5 12l6-6',
  'chevron-right': 'M9.5 6l6 6-6 6',
  'arrow-right': 'M5 12h13m0 0-5-5m5 5-5 5',
  'zoom-in': 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4.3-4.3M8.5 11h5M11 8.5v5',
  'zoom-out': 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4.3-4.3M8.5 11h5',
  expand: 'M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5 9.5 17 19 7',
  eye: 'M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5',
  calendar: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM8 3v4M16 3v4M4 10h16',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 8v4.5l3 1.8',
  user: 'M12 4.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4.5 20c.6-3.6 3.7-5.5 7.5-5.5s6.9 1.9 7.5 5.5',
  logout: 'M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M11 4h5.5A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5H11',
  dashboard: 'M4 4h7v7H4zM13 4h7v4.5h-7zM13 10.5h7V20h-7zM4 13h7v7H4z',
  documents: 'M8 3h6l5 5v13H8zM14 3v5h5M11 13h5M11 17h5',
  layers: 'M12 3 3 7.5 12 12l9-4.5zM3 12l9 4.5L21 12M3 16.5 12 21l9-4.5',
  category: 'M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v6M13.5 11v6',
  edit: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17zM15 6l3 3',
  filter: 'M4 5h16l-6.2 7.4V19l-3.6-2v-4.6z',
  info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 11v5M12 8h.01',
  alert: 'M12 4 3 20h18zM12 10v4.5M12 17.5h.01',
  book: 'M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5zM19 18v3H7.5',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  shield: 'M12 3l7 3v5.5c0 4.4-2.9 8.2-7 9.5-4.1-1.3-7-5.1-7-9.5V6z',
  external: 'M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  home: 'M4 11 12 4l8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5zM9.5 21v-6h5v6',
  comment: 'M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5l-4 3.5V15H7a2 2 0 0 1-2-2z',
};

/**
 * Solid social brand marks. These are filled with currentColor instead of
 * stroked, and are built with opposite-winding subpaths so the ring shapes
 * (the Instagram frame, its lens and the YouTube play button) render as holes.
 */
const FILLED_ICONS = {
  youtube:
    'M2 8.5A3.5 3.5 0 0 1 5.5 5h13A3.5 3.5 0 0 1 22 8.5v7A3.5 3.5 0 0 1 18.5 19h-13A3.5 3.5 0 0 1 2 15.5zM10.5 9.2v5.6L15.2 12z',
  instagram:
    'M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6zM8 4a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM17.2 6.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z',
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.7, title }) {
  const filledPath = FILLED_ICONS[name];
  const path = filledPath || ICONS[name] || ICONS.book;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filledPath ? 'currentColor' : 'none'}
      stroke={filledPath ? 'none' : 'currentColor'}
      strokeWidth={filledPath ? undefined : strokeWidth}
      strokeLinecap={filledPath ? undefined : 'round'}
      strokeLinejoin={filledPath ? undefined : 'round'}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}
