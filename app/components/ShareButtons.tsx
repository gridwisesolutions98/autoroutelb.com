"use client";
import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [instagramHint, setInstagramHint] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
  };

  const handleCopyLink = async () => {
    await copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagram = async () => {
    await copyToClipboard();
    setInstagramHint(true);
    setTimeout(() => setInstagramHint(false), 4000);
  };

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-btn whatsapp"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-btn facebook"
      >
        Facebook
      </a>
      <button type="button" onClick={handleInstagram} className="contact-btn instagram">
        {instagramHint ? "Link copied — paste in Instagram" : "Instagram"}
      </button>
      <button type="button" onClick={handleCopyLink} className="contact-btn copy-link">
        {copied ? "Link copied!" : "Copy link"}
      </button>
    </div>
  );
}
