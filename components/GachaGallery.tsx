"use client";

import { useEffect, useState } from "react";

type Gacha = {
  id: string;
  display_no: number;
  title: string;
  author: string;
  author_x: string;
  image_url: string;
};

type SiteSettings = {
  title: string;
  subtitle: string;
  background_url: string;
};

const defaultSettings: SiteSettings = {
  title: "みんなのAIガチャ図鑑",
  subtitle: "AIで作ったカプセルトイ作品を集めました",
  background_url: "",
};

function xUrl(value: string) {
  const v = value.trim().replace(/^@/, "");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://x.com/${encodeURIComponent(v)}`;
}

export default function GachaGallery() {
  const [items, setItems] = useState<Gacha[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/gachas").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([gachas, site]) => {
        setItems(gachas.gachas || []);
        setSettings({ ...defaultSettings, ...(site.settings || {}) });
      })
      .finally(() => setLoading(false));
  }, []);

  const pageStyle = settings.background_url
    ? { backgroundImage: `linear-gradient(rgba(255,255,255,.78),rgba(255,255,255,.78)), url(${JSON.stringify(settings.background_url)})` }
    : undefined;

  return (
    <main className="container site-page" style={pageStyle}>
      <section className="hero">
        <h1>{settings.title}</h1>
        <p>{settings.subtitle}</p>
      </section>

      {loading ? (
        <div className="loading">読み込み中…</div>
      ) : items.length === 0 ? (
        <div className="empty">まだ作品が登録されていません。</div>
      ) : (
        <div className="grid">
          {items.map((g) => {
            const profileUrl = xUrl(g.author_x);
            return (
              <article className="card" key={g.id}>
                <img className="card-image" src={g.image_url} alt={g.title || `No.${g.display_no}`} />
                <div className="card-body">
                  <div className="no">NO.{g.display_no}</div>
                  <div className="title">{g.title || "無題の作品"}</div>
                  {g.author && <div className="author">作成者：{g.author}</div>}
                  {profileUrl && (
                    <a
                      className="x-link"
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      𝕏 {g.author_x.replace(/^@/, "@").trim()}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
