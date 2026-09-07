 "use client";

import { useEffect, useState } from "react";
import GachaGame from "./GachaGame";

type Gacha = {
  id: string;
  display_no: number;
  title: string;
  author: string;
  image_url: string;
};

export default function GachaGallery() {
  const [items, setItems] = useState<Gacha[]>([]);
  const [selected, setSelected] = useState<Gacha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gachas").then(r => r.json()).then(d => setItems(d.gachas || [])).finally(() => setLoading(false));
  }, []);

  if (selected) return <GachaGame gacha={selected} onBack={() => setSelected(null)} />;

  return (
    <main className="container">
      <section className="hero">
        <h1>みんなのAIガチャ図鑑</h1>
        <p>気になるガチャをタップして、実際に回してみよう！</p>
      </section>
      {loading ? <div className="loading">読み込み中…</div> :
        items.length === 0 ? <div className="empty">まだガチャが登録されていません。</div> :
        <div className="grid">
          {items.map(g => (
            <article className="card" key={g.id}>
              <button onClick={() => setSelected(g)} aria-label={`${g.title || "ガチャ"}を回す`}>
                <img className="card-image" src={g.image_url} alt={g.title || `No.${g.display_no}`} />
                <div className="card-body">
                  <div className="no">NO.{g.display_no}</div>
                  <div className="title">{g.title || "無題のガチャ"}</div>
                  {g.author && <div className="author">by {g.author}</div>}
                </div>
              </button>
            </article>
          ))}
        </div>
      }
    </main>
  );
}