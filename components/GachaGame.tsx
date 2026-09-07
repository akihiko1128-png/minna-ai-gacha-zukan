 "use client";

import { useState } from "react";

type Gacha = { display_no:number; title:string; author:string; image_url:string; };

export default function GachaGame({ gacha, onBack }: { gacha:Gacha; onBack:()=>void }) {
  const [phase, setPhase] = useState<"ready"|"turning"|"capsule"|"get">("ready");

  const play = () => {
    if (phase !== "ready") return;
    setPhase("turning");
    setTimeout(() => setPhase("capsule"), 700);
    setTimeout(() => setPhase("get"), 1700);
  };

  return (
    <main className="container">
      <div className="game-wrap">
        <button className="back" onClick={onBack}>← 図鑑に戻る</button>
        <div className={`game ${phase === "turning" ? "turning" : ""} ${phase === "capsule" ? "capsule" : ""} ${phase === "get" ? "get" : ""}`}>
          <h1 style={{margin:"0 0 4px"}}>NO.{gacha.display_no}</h1>
          <div style={{fontWeight:900,fontSize:20}}>{gacha.title || "AIガチャ"}</div>
          {gacha.author && <div className="author">by {gacha.author}</div>}

          {phase === "get" ? (
            <div className="get-card">
              <h2>🎉 GET!</h2>
              <img className="get-image" src={gacha.image_url} alt={gacha.title} />
              <p style={{fontWeight:900}}>{gacha.title || "ガチャアイテム"}</p>
              <button className="action" onClick={onBack}>もう一度図鑑を見る</button>
            </div>
          ) : (
            <>
              <div className="machine">
                <div className="machine-body">
                  <div className="dome"><div className="logo">AI GACHA</div></div>
                  <div className="slot" />
                  <div className="tray" />
                  <div className="handle" />
                </div>
                <div className="capsule" />
              </div>
              <p style={{minHeight:24,fontWeight:800}}>
                {phase === "ready" ? "ハンドルを回してね！" : phase === "turning" ? "ガチャガチャ……！" : "カプセルが出てきた！"}
              </p>
              <button className="action" onClick={play} disabled={phase !== "ready"}>🎲 ガチャを回す！</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}