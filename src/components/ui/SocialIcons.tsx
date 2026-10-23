// Minimal inline brand glyphs -- lucide-react ships no social/brand icons,
// and these are simple enough (single path, currentColor) to inline rather
// than pull in a whole icon-pack dependency for six logos.
type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.3 2H21.5l-7.3 8.3L22.8 22h-6.8l-5.3-6.9L4.6 22H1.4l7.8-8.9L1 2h6.9l4.8 6.3L18.3 2Zm-1.2 18h1.8L7 3.9H5.1L17.1 20Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.4 31.4 0 0 0 2 12a31.4 31.4 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 22 12a31.4 31.4 0 0 0-.4-4.8ZM10 15.2V8.8L15.8 12 10 15.2Z" />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 2h-3.2v13.7a2.7 2.7 0 1 1-2.1-2.64V9.8a6 6 0 1 0 5.3 5.9V8.5a7.6 7.6 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4Z" />
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.5 3.5 2.9 10.9c-1.1.44-1.1 1.07-.2 1.33l4.8 1.5 1.85 5.6c.22.6.37.84.76.84.32 0 .46-.15.64-.33l1.57-1.5 3.27 2.4c.6.33 1.03.16 1.18-.56l2.9-13.6c.22-.95-.33-1.35-1.16-1.08Zm-4.72 3.1-7 6.38-.3 2.95-1.48-4.6 10.6-6.6c.33-.2.63-.09.38.14Z" />
    </svg>
  );
}
