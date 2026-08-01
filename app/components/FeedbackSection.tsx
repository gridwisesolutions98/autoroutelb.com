"use client";

import { useState, useEffect } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

interface FeedbackItem {
  id: string;
  fullName: string;
  rating: number;
  message: string;
  createdAt: string;
}

export default function FeedbackSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeedbacks(data);
      })
      .catch((err) => console.error("Error loading feedback:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, rating, message }),
      });

      if (!res.ok) throw new Error(t.common.somethingWrong);

      const savedFeedback = await res.json();
      setFeedbacks([savedFeedback, ...feedbacks]);
      setFullName("");
      setRating(5);
      setMessage("");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || t.common.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="feedback-section">
      <h2>{t.feedback.title}</h2>
      <p className="car-meta" style={{ marginBottom: "24px" }}>
        {t.feedback.subtitle}
      </p>

      {submitted ? (
        <p className="car-meta">{t.feedback.thankYou}</p>
      ) : (
        <form onSubmit={handleSubmit} className="feedback-form">
          {error && <div className="error-msg">{error}</div>}

          <div className="field">
            <label>{t.feedback.fullName}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={t.feedback.fullNamePlaceholder}
            />
          </div>

          <div className="field">
            <label>{t.feedback.rating}</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="star-btn"
                  style={{ color: (hoverRating || rating) >= star ? "var(--gold)" : "#D8D5CC" }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t.feedback.yourReview}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              placeholder={t.feedback.reviewPlaceholder}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading} style={{ width: "auto", padding: "12px 28px" }}>
            {loading && <span className="spinner" />}
            {loading ? t.feedback.submitting : t.feedback.submitReview}
          </button>
        </form>
      )}

      <div className="feedback-list">
        {feedbacks.length === 0 ? (
          <p className="car-meta">{t.feedback.noReviews}</p>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="feedback-card">
              <div className="feedback-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < item.rating ? "var(--gold)" : "#D8D5CC" }}>★</span>
                ))}
              </div>
              <p className="feedback-message">"{item.message}"</p>
              <p className="feedback-author">{item.fullName}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
