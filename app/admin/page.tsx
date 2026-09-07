 "use client";

import { useEffect, useState } from "react";

type Gacha = { id:string; display_no:number; title:string; author:string; image_url:string; };

export default function AdminPage() {
  const [logged, setLogged] = useState<boolean|null>(null);
  const [key, setKey] = useState("");
  const [items, setItems] = useState<Gacha[]>([]);
  const [files, setFiles] = useState<FileList|null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<string|null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editFile, setEditFile] = useState<File|null>(null);

  const load = async () => {
    const r = await fetch("/api/admin/gachas");
    if (r.status === 401) { setLogged(false); return; }
    const d = await r.json(); setItems(d.gachas||[]); setLogged(true);
  };
  useEffect(() => { load(); }, []);

  const login = async () => {
    const r = await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key})});
    if (!r.ok) { setMessage("管理キーが違います。"); return; }
    setKey(""); setMessage("ログインしました。"); load();
  };

  const add = async () => {
    if (!files?.length) { setMessage("画像を選択してください。"); return; }
    const f = new FormData();
    Array.from(files).forEach(x => f.append("images",x));
    f.append("title",title); f.append("author",author);
    const r = await fetch("/api/admin/gachas",{method:"POST",body:f});
    const d = await r.json();
    if (!r.ok) { setMessage(d.error||"追加に失敗しました。"); return; }
    setFiles(null); setTitle(""); setAuthor(""); setMessage(`${d.gachas?.length||0}件追加しました。`);
    const input=document.getElementById("multi") as HTMLInputElement|null; if(input) input.value="";
    load();
  };

  const saveEdit = async (id:string) => {
    const f=new FormData(); f.append("title",editTitle); f.append("author",editAuthor);
    if(editFile) f.append("image",editFile);
    const r=await fetch(`/api/admin/gachas/${id}`,{method:"PATCH",body:f});
    const d=await r.json(); if(!r.ok){setMessage(d.error||"更新失敗");return;}
    setEditing(null); setMessage("更新しました。"); load();
  };

  const del = async (id:string) => {
    if(!confirm("このガチャを削除しますか？")) return;
    const r=await fetch(`/api/admin/gachas/${id}`,{method:"DELETE"});
    if(r.ok){setMessage("削除しました。");load();} else setMessage("削除に失敗しました。");
  };

  const logout=async()=>{await fetch("/api/admin/logout",{method:"POST"});setLogged(false);};

  if(logged===null) return <main className="container"><div className="loading">確認中…</div></main>;
  if(!logged) return (
    <main className="container"><div className="admin">
      <div className="panel">
        <h1>🔐 管理者ページ</h1>
        <p className="small">公開ページはログイン不要。ここだけ管理キーが必要です。</p>
        <input className="input" type="password" placeholder="管理キー" value={key} onChange={e=>setKey(e.target.value)} />
        <button className="primary" style={{marginTop:10}} onClick={login}>管理画面に入る</button>
        {message && <div className="notice" style={{marginTop:10}}>{message}</div>}
      </div>
      <a href="/">← 公開ページへ</a>
    </div></main>
  );

  return <main className="container"><div className="admin">
    <div className="hero"><h1>管理画面</h1><p>画像をまとめて追加・編集・削除できます。</p></div>
    {message && <div className="notice">{message}</div>}
    <section className="panel">
      <h2>画像を追加</h2>
      <div className="row two">
        <input className="input" placeholder="タイトル（任意）" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="input" placeholder="作者名（任意）" value={author} onChange={e=>setAuthor(e.target.value)} />
      </div>
      <input id="multi" className="file" style={{marginTop:10}} type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)} />
      <p className="small">複数枚選択OK。番号は自動で付きます。1枚10MBまで。</p>
      <button className="primary" onClick={add}>＋ まとめて追加</button>
    </section>
    <section className="panel">
      <h2>登録済み {items.length}件</h2>
      <div className="list">
        {items.map(x=><div className="item" key={x.id}>
          <img className="thumb" src={x.image_url} alt="" />
          <div>
            <div className="small">NO.{x.display_no}</div>
            {editing===x.id ? <>
              <input className="input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
              <input className="input" style={{marginTop:5}} value={editAuthor} onChange={e=>setEditAuthor(e.target.value)} />
              <input className="file" style={{marginTop:5}} type="file" accept="image/*" onChange={e=>setEditFile(e.target.files?.[0]||null)} />
            </> : <>
              <div className="item-title">{x.title || "無題のガチャ"}</div>
              {x.author && <div className="small">by {x.author}</div>}
            </>}
          </div>
          <div className="actions">
            {editing===x.id ? <button className="primary" onClick={()=>saveEdit(x.id)}>保存</button> :
              <button className="admin-link" onClick={()=>{setEditing(x.id);setEditTitle(x.title);setEditAuthor(x.author);}}>編集</button>}
            <button className="danger" onClick={()=>del(x.id)}>削除</button>
          </div>
        </div>)}
      </div>
    </section>
    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <a href="/">← 公開ページ</a>
      <button className="admin-link" onClick={logout}>ログアウト</button>
    </div>
  </div></main>;
}