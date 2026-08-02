"use client";

import { useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

type NavDict = {
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  refund: string;
};

export default function HeroNav({ t, locale }: { t: NavDict; locale: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hero-nav-wrap">
      <button
        className="hero-nav-toggle"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`hero-nav${open ? " hero-nav-open" : ""}`}>
        <a href="#about" onClick={() => setOpen(false)}>{t.about}</a>
        <a href="#contact" onClick={() => setOpen(false)}>{t.contact}</a>
        <Link href="/privacy-policy" onClick={() => setOpen(false)}>{t.privacy}</Link>
        <Link href="/terms-conditions" onClick={() => setOpen(false)}>{t.terms}</Link>
        <Link href="/refund-policy" onClick={() => setOpen(false)}>{t.refund}</Link>
        <LanguageSwitcher current={locale} />
      </nav>
    </div>
  );
}
