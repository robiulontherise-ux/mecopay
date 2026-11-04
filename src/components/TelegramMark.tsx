type TelegramMarkProps = {
  className?: string;
};

export default function TelegramMark({ className }: TelegramMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="12" fill="#26A5E4" />
      <path
        fill="#fff"
        d="M18.9 6.1 16.5 17.4c-.2.8-.7 1-1.4.6l-3.8-2.8-1.8 1.7c-.2.2-.4.4-.8.4l.3-3.9 7.1-6.4c.3-.3-.1-.4-.5-.2L6.8 12.5 3 11.3c-.8-.3-.8-.9.2-1.2l14.9-5.7c.7-.3 1.2.2.8 1.7Z"
      />
    </svg>
  );
}
