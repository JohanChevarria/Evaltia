"use client";

export type FeedbackPayload = {
  questionId: string;
  scope: "question" | "option";
  optionLabel?: string;
};

type Props = {
  payload: FeedbackPayload;
  onClick: (payload: FeedbackPayload) => void;
  className?: string;
  disabled?: boolean;
  title?: string;
};

export default function FeedbackButton({
  payload,
  onClick,
  className,
  disabled,
  title,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(payload)}
      title={title ?? "Feedback / Mensajes"}
      aria-label="Feedback"
      className={
        className ??
        "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed w-9 h-9"
      }
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </svg>
    </button>
  );
}
