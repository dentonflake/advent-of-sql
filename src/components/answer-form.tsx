"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Star, CircleAlert } from "lucide-react";
export function AnswerForm({
  day,
  part,
  answerFormat,
}: {
  day: number;
  part: number;
  answerFormat: string;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    correct?: boolean;
    message: string;
  } | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, part, answer }),
      });
      const payload = await response.json();
      setResult(payload);
      if (response.ok && payload.correct) router.refresh();
    } catch {
      setResult({
        message: "The workshop connection went quiet. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="answer-area">
      {result?.correct ? (
        <div className="success" role="status">
          <Star size={24} fill="currentColor" />
          <div>
            <strong>{result.message}</strong>
            <Link
              href={
                part === 1
                  ? `/2025/day/${day}?part=2`
                  : day < 12
                    ? `/2025/day/${day + 1}`
                    : "/workshop"
              }
            >
              {part === 1
                ? "Open part 2"
                : day < 12
                  ? `Continue to day ${day + 1}`
                  : "See all your stars"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor={`answer-${part}`}>Your answer</label>
          <p id={`answer-format-${part}`} className="field-help">
            {answerFormat} Submit the value only, without column headers or
            units.
          </p>
          <div className="answer-controls">
            <input
              id={`answer-${part}`}
              aria-describedby={`answer-format-${part}`}
              name="answer"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setResult(null);
              }}
              required
              maxLength={200}
              autoComplete="off"
              placeholder="Type your result here"
            />
            <button
              className="button primary"
              disabled={busy || !answer.trim()}
              type="submit"
            >
              {busy ? "Checking…" : "Check answer"}
              <ArrowRight size={17} />
            </button>
          </div>
          {result && (
            <p className="form-message error" role="alert">
              <CircleAlert size={17} />
              {result.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
