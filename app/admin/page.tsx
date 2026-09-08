"use client";

import { useEffect, useState } from "react";

type Gacha = { id:string; display_no:number; title:string; author:string; author_x:string; image_url:string; };
type Settings = { title:string; subtitle:string; background_url:string; };

function xUrl(value:string) {
  const v=value.trim().replace(/^@/,"");
  if(!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://x.com/${encodeURIComponent(v)}`;
}

export default function AdminPage() {
  const [logged,setLogged]=useState<boolean|null>(null);
  const [key,setKey]=useState("");
  const [items,setItems]=useState<Gacha[]>([]);
  const [files,setFiles]=useState<FileList|null>(null);
  const [title,setTitle]=useState("");
  const [author,setAuthor]=useState("");
  const [authorX,setAuthorX]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [editTitle,setEditTitle]=useState("");
  const [editAuthor,setEditAuthor]=useState("");
  const [editAuthorX,setEditAuthorX]=useState("");
  const [editFile,setEditFile]=useState<File|null>(null);
  const [settings,setSettings]=useState<Settings>({title:"みんなのAIガチャ図鑑",subtitle:"AIで作ったカプセルトイ作品を集めました",background_url:""});
  const [siteTitle,setSiteTitle]=useState("");
  const [siteSubtitle,setSiteSubtitle]=useState("");
  const [background,setBackground]=useState<File|null>(null);
  const [savingSite,setSavingSite]=useState(false);

  const load=async()=>{
    const r=await fetch("/api/admin/gachas");
    if(r.status===401){setLogged(false);return;}
    const d=await r.json(); setItems(d.gachas||[]);
    const sr=await fetch("/api/admin/settings");
    if(sr.ok){ const sd=await sr.json(); const x=sd.settings; setSettings(x); setSiteTitle(x.title||""); setSiteSubtitle(x.subtitle||""); }
    setLogged(true);
  };
  useEffect(()=>{load();},[]);

  const login=async()=>{
    const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key})});
    if(!r.ok){setMessage("管理キーが違います。");return;}
    setKey(""); setMessage("ログインしました。"); load();
  };

  const add=async()=>{
    if(!files?.length){setMessage("先に画像を選択してください。");return;}
    setBusy(true);
    const f=new FormData(); Array.from(files).forEach(x=>f.append("images",x));
    f.append("title",title); f.append("author",author); f.append("author_x",authorX);
    const r=await fetch("/api/admin/gachas",{method:"POST",body:f}); const d=await r.json();
    if(!r.ok){setBusy(false);setMessage(d.error||"追加に失敗しました。");return;}
    setFiles(null);setTitle("");setAuthor("");setAuthorX("");setMessage(`${d.gachas?.length||0}件追加しました。`);
    const input=document.getElementById("multi") as HTMLInputElement|null;if(input)input.value="";
    await load();setBusy(false);
  };

  const saveEdit=async(id:string)=>{
    const f=new FormData(); f.append("title",editTitle); f.append("author",editAuthor); f.append("author_x",editAuthorX); if(editFile)f.append("image",editFile);
    const r=await fetch(`/api/admin/gachas/${id}`,{method:"PATCH",body:f}); const d=await r.json();
    if(!r.ok){setMessage(d.error||"更新失敗");return;} setEditing(null);setEditFile(null);setMessage("更新しました。");load();
  };

  const del=async(id:string)=>{if(!confirm("この作品を削除しますか？"))return;const r=await fetch(`/api/admin/gachas/${id}`,{method:"DELETE"});if(r.ok){setMessage("削除しました。");load();}else setMessage("削除に失敗しました。");};
  const logout=async()=>{await fetch("/api/admin/logout",{method:"POST"});setLogged(false);};

  const saveSite=async()=>{
    setSavingSite(true);
    const f=new FormData();f.append("title",siteTitle);f.append("subtitle",siteSubtitle);if(background)f.append("background",background);
    const r=await fetch("/api/admin/settings",{method:"POST",body:f});const d=await r.json();
    if(!r.ok)setMessage(d.error||"サイト設定の保存に失敗しました。");else{setSettings(d.settings);setBackground(null);setMessage("トップページの設定を保存しました。");const i=document.getElementById("background") as HTMLInputElement|null;if(i)i.value="";}
    setSavingSite(false);
  };

  if(logged===null)return <main className="container"><div className="loading">確認中…</div></main>;
  if(!logged)return <main className="container"><div className="admin"><div className="panel"><h1>🔐 管理者ページ</h1><p className="small">公開ページはログイン不要。ここだけ管理キーが必要です。</p><input className="input" type="password" placeholder="管理キー" value={key} onChange={e=>setKey(e.target.value)}/><button className="primary" style={{marginTop:10}} onClick={login}>管理画面に入る</button>{message&&<div className="notice" style={{marginTop:10}}>{message}</div>}</div><a href="/">← 公開ページへ</a></div></main>;

  return <main className="container"><div className="admin">
    <div className="hero"><h1>管理画面</h1><p>作品の登録・編集と、トップページの設定を管理できます。</p></div>
    {message&&<div className="notice">{message}</div>}

    <section className="panel">
      <h2>トップページ設定</h2>
      <div className="row">
        <input className="input" placeholder="サイトタイトル" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)}/>
        <input className="input" placeholder="説明文（任意）" value={siteSubtitle} onChange={e=>setSiteSubtitle(e.target.value)}/>
      </div>
      <label className="upload-box compact" htmlFor="background"><strong>背景画像を選択</strong><span>{background?background.name:(settings.background_url?"現在の背景画像あり":"未設定")}</span></label>
      <input id="background" className="file-hidden" type="file" accept="image/*" onChange={e=>setBackground(e.target.files?.[0]||null)}/>
      <button className="primary" style={{marginTop:10}} disabled={savingSite} onClick={saveSite}>{savingSite?"保存中…":"トップページ設定を保存"}</button>
    </section>

    <section className="panel">
      <h2>作品を追加（画像は横4：縦3）</h2>
      <div className="row three">
        <input className="input" placeholder="作品タイトル" value={title} onChange={e=>setTitle(e.target.value)}/>
        <input className="input" placeholder="作成者名" value={author} onChange={e=>setAuthor(e.target.value)}/>
        <input className="input" placeholder="作成者のXアカウント（@からでもOK）" value={authorX} onChange={e=>setAuthorX(e.target.value)}/>
      </div>
      <label className="upload-box" htmlFor="multi"><span className="upload-icon">＋</span><strong>画像を選択</strong><span>複数選択OK・表示比率は横4：縦3</span></label>
      <input id="multi" className="file-hidden" type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)}/>
      <p className="selected-count">{files?.length?`選択中：${files.length}枚`:"まだ画像が選択されていません"}</p>
      <p className="small">1枚10MBまで。画像は図鑑内で横4：縦3に統一表示します。</p>
      <button className="primary register-button" disabled={busy||!files?.length} onClick={add}>{busy?"登録中…":"✓ 画像を登録する"}</button>
    </section>

    <section className="panel"><h2>登録済み {items.length}件</h2><div className="list">
      {items.map(x=><div className="item" key={x.id}><img className="thumb" src={x.image_url} alt=""/><div>
        <div className="small">NO.{x.display_no}</div>
        {editing===x.id?<>
          <input className="input" value={editTitle} placeholder="作品タイトル" onChange={e=>setEditTitle(e.target.value)}/>
          <input className="input" style={{marginTop:5}} value={editAuthor} placeholder="作成者名" onChange={e=>setEditAuthor(e.target.value)}/>
          <input className="input" style={{marginTop:5}} value={editAuthorX} placeholder="作成者のXアカウント" onChange={e=>setEditAuthorX(e.target.value)}/>
          <input className="file" style={{marginTop:5}} type="file" accept="image/*" onChange={e=>setEditFile(e.target.files?.[0]||null)}/>
        </>:<>
          <div className="item-title">{x.title||"無題の作品"}</div>
          {x.author&&<div className="small">作成者：{x.author}</div>}
          {x.author_x&&<a className="x-link" href={xUrl(x.author_x)} target="_blank" rel="noopener noreferrer">𝕏 {x.author_x.replace(/^@/,"@").trim()}</a>}
        </>}
      </div><div className="actions">
        {editing===x.id?<button className="primary" onClick={()=>saveEdit(x.id)}>保存</button>:<button className="admin-link" onClick={()=>{setEditing(x.id);setEditTitle(x.title);setEditAuthor(x.author);setEditAuthorX(x.author_x||"");}}>編集</button>}
        <button className="danger" onClick={()=>del(x.id)}>削除</button>
      </div></div>)}
    </div></section>

    <div style={{display:"flex",gap:10,alignItems:"center"}}><a href="/">← 公開ページ</a><button className="admin-link" onClick={logout}>ログアウト</button></div>
  </div></main>;
}
