"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { type Locale, getDictionary } from "@/lib/i18n";

export default function LoginForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).login;
  const common = getDictionary(locale).common;
  const [isRegistering, setIsRegistering] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [whishNumber, setWhishNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isRegistering ? "register" : "login",
          username,
          password,
          companyName: isRegistering ? companyName : undefined,
          whishNumber: isRegistering ? whishNumber : undefined,
          whatsappNumber: isRegistering ? whatsappNumber : undefined,
          contactEmail: isRegistering ? contactEmail : undefined,
          address: isRegistering ? address : undefined,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || common.somethingWrong);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Client side error:", err);
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <span className="plate-badge">
          AutoRoute <span className="tag">LB</span>
        </span>
        <p>
          {isRegistering ? t.registerIntro : t.signInIntro}
        </p>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ position: "absolute", left: "-9999px" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <h2 style={{ marginBottom: "8px" }}>
            {isRegistering ? t.registerTitle : t.signInTitle}
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "14px" }}>
            {isRegistering ? t.registerSubtitle : t.signInSubtitle}
          </p>

          {error && <div className="error-msg">{error}</div>}

          {isRegistering && (
            <>
              <div className="field">
                <label>{t.companyName}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>{t.whishNumberLabel}</label>
                <input
                  type="text"
                  value={whishNumber}
                  onChange={(e) => setWhishNumber(e.target.value)}
                  placeholder={t.whishNumberPlaceholder}
                  required
                />
              </div>
              <div className="field">
                <label>{t.whatsappNumberLabel}</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder={t.whatsappNumberPlaceholder}
                />
              </div>
              <div className="field">
                <label>{t.contactEmail}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.agencyAddress}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.agencyAddressPlaceholder}
                />
              </div>
            </>
          )}

          <div className="field">
            <label>{t.username}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {isRegistering ? t.registerSubmit : t.signInSubmit}
          </button>

          <button
            type="button"
            className="toggle-link"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? t.toggleToSignIn : t.toggleToRegister}
          </button>
        </form>
      </div>
    </div>
  );
}
