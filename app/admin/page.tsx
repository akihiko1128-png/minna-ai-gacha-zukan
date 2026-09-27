"use client";

import { useEffect, useState } from "react";

type App = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  logo_url: string;
  background_url: string;
  primary_color: string;
  item_name: string;
  item_name_plural: string;
  show_x_account: boolean;
  show_creator: boolean;
  show_number: boolean;
  is_public: boolean;
};

type Gacha = { id:string; display_no:number; title:string; author:string; author_x:string; image_url:string; };

function xUrl(value:string) {
  const v=value.trim().replace(/^@/,"");
  if(!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://x.com/${encodeURIComponent(v)}`;
}

export default function AdminPage() {
  const [logged,setLogged]=useState<boolean|null>(null);
  const [key,setKey]=useState("");
  const [apps,setApps]=useState<App[]>([]);
  const [appSlug,setAppSlug]=useState("ai-gacha");
  const [newName,setNewName]=useState("");
  const [newSlug,setNewSlug]=useState("");
  const [newItemName,setNewItemName]=useState("作品");
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
  const [settings,setSettings]=useState<App|null>(null);
  const [siteTitle,setSiteTitle]=useState("");
  const [siteSubtitle,setSiteSubtitle]=useState("");
  const [description,setDescription]=useState("");
  const [itemName,setItemName]=useState("作品");
  const [itemNamePlural,setItemNamePlural]=useState("作品");
  const [primaryColor,setPrimaryColor]=useState("#111827");
  const [showX,setShowX]=useState(true);
  const [showCreator,setShowCreator]=useState(true);
  const [showNumber,setShowNumber]=useState(true);
  const [background,setBackground]=useState<File|null>(null);
  const [logo,setLogo]=useState<File|null>(null);
  const [savingSite,setSavingSite]=useState(false);

  const loadApps=async()=>{
    const r=await fetch("/api/admin/apps");
    if(r.status===401){setLogged(false);return false;}
    const d=await r.json();
    const list=d.apps||[];
    setApps(list);
    setLogged(true);
    if(list.length && !list.some((x:App)=>x.slug===appSlug)) setAppSlug(list[0].slug);
    return true;
  };

  const load=async(slug=appSlug)=>{
    const r=await fetch(`/api/admin/gachas?app=${encodeURIComponent(slug)}`);
    if(r.status===401){setLogged(false);return;}
    const d=await r.json(); setItems(d.gachas||[]);
    const sr=await fetch(`/api/admin/settings?app=${encodeURIComponent(slug)}`);
    if(sr.ok){
      const sd=await sr.json(); const x=sd.settings as App;
      setSettings(x); setSiteTitle(x.name||""); setSiteSubtitle(x.subtitle||"");
      setDescription(x.description||""); setItemName(x.item_name||"作品"); setItemNamePlural(x.item_name_plural||x.item_name||"作品");
      setPrimaryColor(x.primary_color||"#111827"); setShowX(x.show_x_account!==false); setShowCreator(x.show_creator!==false); setShowNumber(x.show_number!==false);
    }
    setLogged(true);
  };

  useEffect(()=>{ loadApps(); },[]);
  useEffect(()=>{ if(logged) load(appSlug); },[appSlug,logged]);

  const login=async()=>{
    const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key})});
    if(!r.ok){setMessage("管理キーが違います。");return;}
    setKey(""); setMessage("ログインしました。"); await loadApps(); await load(appSlug);
  };

  const createApp=async()=>{
    if(!newName.trim()) {setMessage("新しい図鑑名を入力してください。");return;}
    const r=await fetch("/api/admin/apps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      name:newName,slug:newSlug, item_name:newItemName,item_name_plural:newItemName, show_x_account:true,show_creator:true,show_number:true,is_public:true
    })});
    const d=await r.json();
    if(!r.ok){setMessage(d.error||"図鑑の作成に失敗しました。");return;}
    setNewName("");setNewSlug("");setNewItemName("作品");setMessage("新しい図鑑を作成しました。");
    await loadApps(); setAppSlug(d.app.slug);
  };

  const add=async()=>{
    if(!files?.length){setMessage("先に画像を選択してください。");return;}
    setBusy(true);
    const f=new FormData(); Array.from(files).forEach(x=>f.append("images",x));
    f.append("title",title); f.append("author",author); f.append("author_x",authorX);
    const r=await fetch(`/api/admin/gachas?app=${encodeURIComponent(appSlug)}`,{method:"POST",body:f}); const d=await r.json();
    if(!r.ok){setBusy(false);setMessage(d.error||"追加に失敗しました。");return;}
    setFiles(null);setTitle("");setAuthor("");setAuthorX("");setMessage(`${d.gachas?.length||0}件追加しました。`);
    const input=document.getElementById("multi") as HTMLInputElement|null;if(input)input.value="";
    await load(appSlug);setBusy(false);
  };

  const saveEdit=async(id:string)=>{
    const f=new FormData(); f.append("title",editTitle); f.append("author",editAuthor); f.append("author_x",editAuthorX); if(editFile)f.append("image",editFile);
    const r=await fetch(`/api/admin/gachas/${id}`,{method:"PATCH",body:f}); const d=await r.json();
    if(!r.ok){setMessage(d.error||"更新失敗");return;} setEditing(null);setEditFile(null);setMessage("更新しました。");load(appSlug);
  };

  const del=async(id:string)=>{if(!confirm("この作品を削除しますか？"))return;const r=await fetch(`/api/admin/gachas/${id}`,{method:"DELETE"});if(r.ok){setMessage("削除しました。");load(appSlug);}else setMessage("削除に失敗しました。");};
  const logout=async()=>{await fetch("/api/admin/logout",{method:"POST"});setLogged(false);};

  const saveSite=async()=>{
    setSavingSite(true);
    const f=new FormData();
    f.append("title",siteTitle);f.append("subtitle",siteSubtitle);f.append("description",description);
    f.append("item_name",itemName);f.append("item_name_plural",itemNamePlural);f.append("primary_color",primaryColor);
    f.append("show_x_account",String(showX));f.append("show_creator",String(showCreator));f.append("show_number",String(showNumber));
    if(background)f.append("background",background); if(logo)f.append("logo",logo);
    const r=await fetch(`/api/admin/settings?app=${encodeURIComponent(appSlug)}`,{method:"POST",body:f});const d=await r.json();
    if(!r.ok)setMessage(d.error||"設定の保存に失敗しました。");
    else{setSettings(d.settings);setBackground(null);setLogo(null);setMessage("図鑑設定を保存しました。");}
    setSavingSite(false);
  };

  if(logged===null)return <main className="container"><div className="loading">確認中…</div></main>;
  if(!logged)return <main className="container"><div className="admin"><div className="panel"><h1>🔐 管理者ページ</h1><p className="small">公開ページはログイン不要。ここだけ管理キーが必要です。</p><input className="input" type="password" placeholder="管理キー" value={key} onChange={e=>setKey(e.target.value)}/><button className="primary" style={{marginTop:10}} onClick={login}>管理画面に入る</button>{message&&<div className="notice" style={{marginTop:10}}>{message}</div>}</div></div></main>;

  return <main className="container"><div className="admin">
    <div className="hero"><h1>図鑑管理センター</h1><p>1つの仕組みから、独立した図鑑・ギャラリーを何個でも作れます。</p></div>
    {message&&<div className="notice">{message}</div>}

    <section className="panel">
      <h2>📚 図鑑を選ぶ</h2>
      <select className="input" value={appSlug} onChange={e=>setAppSlug(e.target.value)}>
        {apps.map(a=><option key={a.id} value={a.slug}>{a.name}　/{a.slug}</option>)}
      </select>
      {settings&&<p className="small" style={{marginTop:8}}>公開URL：/ {settings.slug}　（公開ページ）</p>}
    </section>

    <section className="panel">
      <h2>➕ 新しい図鑑を作る</h2>
      <div className="row three">
        <input className="input" placeholder="図鑑名（例：ご当地キャラクター図鑑）" value={newName} onChange={e=>setNewName(e.target.value)}/>
        <input className="input" placeholder="URL用ID（例：local-characters）" value={newSlug} onChange={e=>setNewSlug(e.target.value)}/>
        <input className="input" placeholder="作品の呼び方（例：キャラクター）" value={newItemName} onChange={e=>setNewItemName(e.target.value)}/>
      </div>
      <button className="primary" style={{marginTop:10}} onClick={createApp}>この内容で新しい図鑑を作る</button>
    </section>

    <section className="panel">
      <h2>⚙️ 「{settings?.name||appSlug}」の設定</h2>
      <div className="row">
        <input className="input" placeholder="図鑑タイトル" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)}/>
        <input className="input" placeholder="説明文" value={siteSubtitle} onChange={e=>setSiteSubtitle(e.target.value)}/>
      </div>
      <textarea className="input" style={{minHeight:90,marginTop:8}} placeholder="図鑑の詳しい説明" value={description} onChange={e=>setDescription(e.target.value)}/>
      <div className="row three" style={{marginTop:8}}>
        <input className="input" placeholder="単数：キャラクター" value={itemName} onChange={e=>setItemName(e.target.value)}/>
        <input className="input" placeholder="複数：キャラクター" value={itemNamePlural} onChange={e=>setItemNamePlural(e.target.value)}/>
        <input className="input" type="text" placeholder="#111827" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)}/>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",margin:"12px 0"}}>
        <label><input type="checkbox" checked={showX} onChange={e=>setShowX(e.target.checked)}/> Xアカウントを表示</label>
        <label><input type="checkbox" checked={showCreator} onChange={e=>setShowCreator(e.target.checked)}/> 作成者を表示</label>
        <label><input type="checkbox" checked={showNumber} onChange={e=>setShowNumber(e.target.checked)}/> 番号を表示</label>
      </div>
      <div className="row">
        <label className="upload-box compact" htmlFor="logo"><strong>ロゴ画像</strong><span>{logo?.name||settings?.logo_url?"設定済み":"未設定"}</span></label>
        <input id="logo" className="file-hidden" type="file" accept="image/*" onChange={e=>setLogo(e.target.files?.[0]||null)}/>
        <label className="upload-box compact" htmlFor="background"><strong>背景画像</strong><span>{background?.name||settings?.background_url?"設定済み":"未設定"}</span></label>
        <input id="background" className="file-hidden" type="file" accept="image/*" onChange={e=>setBackground(e.target.files?.[0]||null)}/>
      </div>
      <button className="primary" style={{marginTop:10}} disabled={savingSite} onClick={saveSite}>{savingSite?"保存中…":"図鑑設定を保存"}</button>
    </section>

    <section className="panel">
      <h2>🖼️ 「{settings?.item_name_plural||"作品"}」を追加（画像は横4：縦3）</h2>
      <div className="row three">
        <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)}/>
        <input className="input" placeholder="作成者名" value={author} onChange={e=>setAuthor(e.target.value)}/>
        <input className="input" placeholder="作成者のXアカウント" value={authorX} onChange={e=>setAuthorX(e.target.value)}/>
      </div>
      <label className="upload-box" htmlFor="multi"><span className="upload-icon">＋</span><strong>画像を選択</strong><span>複数選択OK・表示比率は横4：縦3</span></label>
      <input id="multi" className="file-hidden" type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)}/>
      <p className="selected-count">{files?.length?`選択中：${files.length}枚`:"まだ画像が選択されていません"}</p>
      <button className="primary register-button" disabled={busy||!files?.length} onClick={add}>{busy?"登録中…":"✓ 画像を登録する"}</button>
    </section>

    <section className="panel"><h2>登録済み {items.length}件</h2><div className="list">
      {items.map(x=><div className="item" key={x.id}><img className="thumb" src={x.image_url} alt=""/><div>
        <div className="small">NO.{x.display_no}</div>
        {editing===x.id?<>
          <input className="input" value={editTitle} placeholder="タイトル" onChange={e=>setEditTitle(e.target.value)}/>
          <input className="input" style={{marginTop:5}} value={editAuthor} placeholder="作成者名" onChange={e=>setEditAuthor(e.target.value)}/>
          <input className="input" style={{marginTop:5}} value={editAuthorX} placeholder="作成者のXアカウント" onChange={e=>setEditAuthorX(e.target.value)}/>
          <input className="file" style={{marginTop:5}} type="file" accept="image/*" onChange={e=>setEditFile(e.target.files?.[0]||null)}/>
        </>:<>
          <div className="item-title">{x.title||"無題の作品"}</div>
          {x.author&&<div className="small">作成者：{x.author}</div>}
          {x.author_x&&<a className="x-link" href={xUrl(x.author_x)} target="_blank" rel="noopener noreferrer">𝕏 {x.author_x}</a>}
        </>}
      </div><div className="actions">
        {editing===x.id?<button className="primary" onClick={()=>saveEdit(x.id)}>保存</button>:<button className="admin-link" onClick={()=>{setEditing(x.id);setEditTitle(x.title);setEditAuthor(x.author);setEditAuthorX(x.author_x||"");}}>編集</button>}
        <button className="danger" onClick={()=>del(x.id)}>削除</button>
      </div></div>)}
    </div></section>

    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
      <a href={settings?`/${settings.slug}`:"/"}>← 公開ページ</a>
      <button className="admin-link" onClick={logout}>ログアウト</button>
    </div>
  </div></main>;
}
