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
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] =
    useState<Gacha | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/gachas").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([gachas, site]) => {
        setItems(gachas.gachas || []);
        setSettings({
          ...defaultSettings,
          ...(site.settings || {}),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const pageStyle = settings.background_url
    ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,.78),rgba(255,255,255,.78)), url(${JSON.stringify(
          settings.background_url
        )})`,
      }
    : undefined;

  return (
    <main
      className="container site-page"
      style={pageStyle}
    >
      <section className="hero">
        <h1>{settings.title}</h1>
        <p>{settings.subtitle}</p>
      </section>

      {loading ? (
        <div className="loading">
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          まだ作品が登録されていません。
        </div>
      ) : (
        <div className="grid">
          {items.map((g) => {
            const profileUrl = xUrl(g.author_x);

            return (
              <article
                className="card"
                key={g.id}
                onClick={() => setSelectedItem(g)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    setSelectedItem(g);
                  }
                }}
                tabIndex={0}
                role="button"
                style={{ cursor: "pointer" }}
              >
                <img
                  className="card-image"
                  src={g.image_url}
                  alt={
                    g.title ||
                    `No.${g.display_no}`
                  }
                />

                <div className="card-body">
                  <div className="no">
                    NO.{g.display_no}
                  </div>

                  <div className="title">
                    {g.title || "無題の作品"}
                  </div>

                  {g.author && (
                    <div className="author">
                      作成者：{g.author}
                    </div>
                  )}

                  {profileUrl && (
                    <a
                      className="x-link"
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      𝕏{" "}
                      {g.author_x.replace(
                        /^@/,
                        "@"
                      )}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="作品詳細"
          onClick={() =>
            setSelectedItem(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "20px",
              padding: "18px",
              boxSizing: "border-box",
              boxShadow:
                "0 10px 40px rgba(0,0,0,.35)",
            }}
          >
            {xUrl(selectedItem.author_x) ? (
              <a
                href={xUrl(
                  selectedItem.author_x
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="この作品のXページを開く"
              >
                <img
                  src={selectedItem.image_url}
                  alt={
                    selectedItem.title ||
                    "作品画像"
                  }
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    borderRadius: "14px",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
              </a>
            ) : (
              <img
                src={selectedItem.image_url}
                alt={
                  selectedItem.title ||
                  "作品画像"
                }
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: "14px",
                  display: "block",
                }}
              />
            )}

            <div
              style={{
                padding:
                  "18px 4px 4px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.65,
                  marginBottom: "6px",
                }}
              >
                NO.{selectedItem.display_no}
              </div>

              <h2
                style={{
                  margin:
                    "0 0 12px",
                  fontSize: "24px",
                  lineHeight: 1.4,
                }}
              >
                {selectedItem.title ||
                  "無題の作品"}
              </h2>

              {selectedItem.author && (
                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "17px",
                  }}
                >
                  👤 作成者：
                  {selectedItem.author}
                </p>
              )}

              {selectedItem.author_x && (
                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "17px",
                  }}
                >
                  𝕏{" "}
                  {selectedItem.author_x}
                </p>
              )}

              {xUrl(
                selectedItem.author_x
              ) && (
                <p
                  style={{
                    margin: "12px 0",
                    fontSize: "14px",
                    opacity: 0.65,
                  }}
                >
                  👆 画像をタップすると
                  Xページを開きます
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedItem(null)
                }
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding:
                    "13px 16px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#222",
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
                }
