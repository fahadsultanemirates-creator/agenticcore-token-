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

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
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

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.16l-.3-.18-3.1.8.83-3-.2-.32A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.68-.8-.23-.08-.4-.12-.56.13-.17.25-.65.8-.8.96-.14.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.3.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.9 2.42 1.02 2.59.12.17 1.76 2.69 4.27 3.78.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.46-.6 1.67-1.17.2-.57.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}
