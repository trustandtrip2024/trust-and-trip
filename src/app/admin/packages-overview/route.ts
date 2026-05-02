import { NextResponse } from "next/server";
import { packages, destinations } from "@/lib/data";

export const dynamic = "force-dynamic";

function buildHtml(): string {
  const data = {
    generatedAt: new Date().toISOString(),
    destinations: destinations.map((d) => ({
      name: d.name,
      slug: d.slug,
      country: d.country,
      region: d.region,
      priceFrom: d.priceFrom,
      highlights: d.highlights || [],
      tagline: d.tagline,
    })),
    packages: packages.map((p) => ({
      title: p.title,
      slug: p.slug,
      destinationSlug: p.destinationSlug,
      destinationName: p.destinationName,
      pricePerPerson: p.priceBreakdown?.doubleSharing ?? p.price,
      priceBreakdown: p.priceBreakdown || null,
      duration: p.duration,
      nights: p.nights,
      days: p.days,
      travelType: p.travelType,
      rating: p.rating,
      reviews: p.reviews,
      categories: p.categories || [],
      tags: p.tags || [],
      highlights: p.highlights || [],
      inclusions: p.inclusions || [],
      bestFor: p.bestFor || null,
    })),
  };

  const json = JSON.stringify(data).replace(/<\/script>/g, "<\\/script>");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Packages Overview · Trust and Trip Admin</title>
<style>
  :root { --paper:#fbf7f1; --cream:#f5e6d3; --ink:#2a2a2a; --slate:#6b7280; --gold:#c8932a; --orange:#e87b3d; --teal:#0e7c7b; --teal-deep:#094948; --rule:#e5dcc9; --white:#fff; }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font:14px/1.5 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--paper);padding:0 0 60px}
  header.top{background:var(--teal-deep);color:#fff;padding:14px 20px;position:sticky;top:0;z-index:10;border-bottom:3px solid var(--gold)}
  header.top h1{margin:0;font-size:18px;letter-spacing:-0.2px}
  header.top .sub{color:#cbd5e1;font-size:12px;margin-top:2px}
  header.top .bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
  header.top input,header.top select{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:7px 10px;border-radius:4px;font:inherit}
  header.top input::placeholder{color:#94a3b8}
  header.top input{flex:1 1 220px;min-width:200px}
  header.top select{min-width:130px}
  header.top .stats{font-size:12px;color:#cbd5e1;margin-left:auto}
  header.top button.export{background:var(--gold);color:var(--ink);border:0;padding:7px 12px;border-radius:4px;font:inherit;font-weight:600;cursor:pointer}
  header.top button.export:hover{background:#d9a73a}
  header.top a.back{color:#cbd5e1;text-decoration:none;font-size:12px}
  main{max-width:1280px;margin:0 auto;padding:16px 20px}
  .empty{color:var(--slate);padding:40px;text-align:center}
  details.dest{background:var(--white);margin:14px 0;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid var(--orange);overflow:hidden}
  details.dest>summary{cursor:pointer;padding:14px 18px;list-style:none;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  details.dest>summary::-webkit-details-marker{display:none}
  details.dest>summary::before{content:"▸";color:var(--gold);font-size:12px;width:12px;transition:transform 0.15s}
  details.dest[open]>summary::before{transform:rotate(90deg)}
  details.dest>summary .name{font-size:16px;font-weight:700;color:var(--teal-deep)}
  details.dest>summary .country{color:var(--slate);font-size:13px}
  details.dest>summary .region{background:var(--cream);color:var(--ink);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
  details.dest>summary .pkg-count{margin-left:auto;background:var(--teal);color:#fff;padding:3px 9px;border-radius:10px;font-size:12px;font-weight:600}
  details.dest>summary .visible-count{color:var(--slate);font-size:11px}
  .dest-body{padding:0 18px 14px}
  .dest-meta{border-top:1px dashed var(--rule);padding:10px 0;font-size:13px;color:var(--slate)}
  .dest-meta strong{color:var(--ink)}
  .dest-actions{display:flex;gap:8px;margin:8px 0 12px}
  .dest-actions button,.dest-actions a{background:var(--cream);color:var(--ink);border:1px solid var(--rule);padding:5px 10px;border-radius:4px;font:inherit;font-size:12px;cursor:pointer;text-decoration:none}
  .dest-actions button:hover,.dest-actions a:hover{background:#ecd9b8}
  table.pkgs{width:100%;border-collapse:collapse;font-size:13px}
  table.pkgs thead th{background:var(--cream);color:var(--ink);padding:8px 10px;text-align:left;font-weight:600;border-bottom:2px solid var(--gold)}
  table.pkgs tbody td{padding:8px 10px;border-bottom:1px solid var(--rule);vertical-align:top}
  table.pkgs tbody tr:hover{background:#fff8eb}
  table.pkgs .price{color:var(--teal-deep);font-weight:700;white-space:nowrap}
  table.pkgs .price small{font-weight:400;color:var(--slate);display:block;font-size:10px}
  table.pkgs .pill{display:inline-block;background:var(--cream);color:var(--ink);padding:2px 7px;border-radius:8px;font-size:11px;margin:1px 2px 1px 0}
  table.pkgs .pill.tag{background:#e6f4f4;color:var(--teal-deep)}
  table.pkgs .row-actions{white-space:nowrap}
  table.pkgs .row-actions button{background:transparent;border:1px solid var(--rule);padding:3px 6px;border-radius:3px;font:inherit;font-size:11px;cursor:pointer;margin-right:3px}
  table.pkgs .row-actions button:hover{background:var(--cream)}
  dialog.detail{border:0;padding:0;max-width:720px;width:95%;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
  dialog.detail::backdrop{background:rgba(0,0,0,0.5)}
  dialog.detail .head{background:var(--teal-deep);color:#fff;padding:14px 18px;display:flex;align-items:center;gap:12px}
  dialog.detail .head h3{margin:0;font-size:16px;flex:1}
  dialog.detail .head button{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);padding:4px 10px;border-radius:4px;font:inherit;cursor:pointer}
  dialog.detail .body{padding:16px 18px;max-height:70vh;overflow-y:auto}
  dialog.detail h4{margin:12px 0 4px;font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:0.5px}
  dialog.detail ul{margin:0;padding-left:18px}
  dialog.detail .price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:6px}
  dialog.detail .price-grid div{background:var(--cream);padding:8px 10px;border-radius:4px}
  dialog.detail .price-grid b{color:var(--teal-deep);display:block;font-size:14px}
  dialog.detail .price-grid span{color:var(--slate);font-size:11px}
  @media print{header.top{position:static}details.dest{page-break-inside:avoid;box-shadow:none}details.dest:not([open])>.dest-body{display:none}.row-actions,button.export,.dest-actions{display:none}}
</style>
</head>
<body>
<header class="top">
  <h1>Packages Overview · Trust and Trip Admin</h1>
  <div class="sub" id="subtitle"></div>
  <div class="bar">
    <a href="/admin" class="back">← Admin home</a>
    <input id="q" type="search" placeholder="Search title, destination, category, tag, highlight…" autocomplete="off" />
    <select id="travelType"><option value="">All travel types</option></select>
    <select id="category"><option value="">All categories</option></select>
    <select id="region"><option value="">All regions</option></select>
    <select id="sort">
      <option value="dest">Sort: Destination A→Z</option>
      <option value="price-asc">Sort: Price ↑</option>
      <option value="price-desc">Sort: Price ↓</option>
      <option value="title">Sort: Title</option>
    </select>
    <span class="stats" id="stats">—</span>
    <button class="export" id="expandAll">Expand all</button>
    <button class="export" id="collapseAll">Collapse all</button>
    <button class="export" id="downloadJson">Export JSON</button>
    <button class="export" id="downloadCsv">Export CSV</button>
    <button class="export" id="printBtn">Print</button>
  </div>
</header>
<main id="root"></main>
<dialog class="detail" id="detail"></dialog>
<script id="data" type="application/json">${json}</script>
<script>
const RAW = JSON.parse(document.getElementById("data").textContent);
const inr = (n) => n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const destBySlug = new Map(RAW.destinations.map(d => [d.slug, d]));
const groupsAll = new Map();
for (const p of RAW.packages) {
  const d = destBySlug.get(p.destinationSlug) || { name: p.destinationName, slug: p.destinationSlug };
  if (!groupsAll.has(d.slug)) groupsAll.set(d.slug, { dest: d, pkgs: [] });
  groupsAll.get(d.slug).pkgs.push(p);
}
const allTypes = [...new Set(RAW.packages.map(p => p.travelType).filter(Boolean))].sort();
const allCats  = [...new Set(RAW.packages.flatMap(p => p.categories || []))].sort();
const allReg   = [...new Set(RAW.destinations.map(d => d.region).filter(Boolean))].sort();
const fillSelect = (id, items) => { const el = document.getElementById(id); for (const v of items) { const o = document.createElement("option"); o.value = v; o.textContent = v; el.appendChild(o); } };
fillSelect("travelType", allTypes); fillSelect("category", allCats); fillSelect("region", allReg);
document.getElementById("subtitle").textContent = RAW.destinations.length + " destinations · " + RAW.packages.length + " packages · Live from data.ts";
let sortMode = "dest";
function getFilters(){return{q:document.getElementById("q").value.trim().toLowerCase(),type:document.getElementById("travelType").value,cat:document.getElementById("category").value,region:document.getElementById("region").value}}
function matchPkg(p,dest,f){if(f.type&&p.travelType!==f.type)return false;if(f.cat&&!(p.categories||[]).includes(f.cat))return false;if(f.region&&dest?.region!==f.region)return false;if(f.q){const hay=[p.title,p.destinationName,...(p.categories||[]),...(p.tags||[]),...(p.highlights||[])].join(" ").toLowerCase();if(!hay.includes(f.q))return false}return true}
function applySort(pkgs){const arr=pkgs.slice();switch(sortMode){case"price-asc":arr.sort((a,b)=>(a.pricePerPerson||0)-(b.pricePerPerson||0));break;case"price-desc":arr.sort((a,b)=>(b.pricePerPerson||0)-(a.pricePerPerson||0));break;case"title":arr.sort((a,b)=>a.title.localeCompare(b.title));break;default:arr.sort((a,b)=>a.title.localeCompare(b.title))}return arr}
function render(){
  const f=getFilters();const root=document.getElementById("root");root.innerHTML="";
  let totalPkgs=0,visibleDests=0;
  const groups=[...groupsAll.values()].sort((a,b)=>a.dest.name.localeCompare(b.dest.name));
  for(const g of groups){
    const visible=applySort(g.pkgs.filter(p=>matchPkg(p,g.dest,f)));
    if(visible.length===0)continue;visibleDests++;totalPkgs+=visible.length;
    const det=document.createElement("details");det.className="dest";det.id="dest-"+g.dest.slug;
    if(f.q||f.type||f.cat||f.region)det.open=true;
    det.innerHTML='<summary><span class="name">'+esc(g.dest.name)+'</span>'
      +(g.dest.country?'<span class="country">— '+esc(g.dest.country)+'</span>':'')
      +(g.dest.region?'<span class="region">'+esc(g.dest.region)+'</span>':'')
      +'<span class="visible-count">'+visible.length+' of '+g.pkgs.length+' shown</span>'
      +'<span class="pkg-count">'+g.pkgs.length+' total</span></summary>'
      +'<div class="dest-body">'
      +(g.dest.tagline?'<div class="dest-meta"><em>"'+esc(g.dest.tagline)+'"</em></div>':'')
      +(g.dest.highlights?.length?'<div class="dest-meta"><strong>Highlights:</strong> '+g.dest.highlights.map(esc).join(", ")+'</div>':'')
      +'<div class="dest-actions">'
      +'<button data-action="add" data-dest="'+esc(g.dest.slug)+'">+ Add package</button>'
      +'<button data-action="export-dest" data-dest="'+esc(g.dest.slug)+'">Export this destination (JSON)</button>'
      +'</div>'
      +'<table class="pkgs"><thead><tr><th>Title</th><th>Type</th><th>Duration</th><th>Price / person</th><th>Categories</th><th>Tags</th><th>Actions</th></tr></thead><tbody>'
      +visible.map(p=>'<tr data-slug="'+esc(p.slug)+'"><td><strong>'+esc(p.title)+'</strong><br><small style="color:var(--slate)">'+esc(p.slug)+'</small></td><td>'+esc(p.travelType)+'</td><td>'+esc(p.duration)+'</td><td class="price">'+inr(p.pricePerPerson)+'<small>per person · twin</small></td><td>'+(p.categories||[]).map(c=>'<span class="pill">'+esc(c)+'</span>').join("")+'</td><td>'+(p.tags||[]).map(c=>'<span class="pill tag">'+esc(c)+'</span>').join("")+'</td><td class="row-actions"><button data-action="view" data-slug="'+esc(p.slug)+'">View</button><button data-action="edit" data-slug="'+esc(p.slug)+'">Edit</button><button data-action="delete" data-slug="'+esc(p.slug)+'">Delete</button></td></tr>').join("")
      +'</tbody></table></div>';
    root.appendChild(det);
  }
  if(visibleDests===0)root.innerHTML='<div class="empty">No packages match the current filters.</div>';
  document.getElementById("stats").textContent=totalPkgs+" pkgs · "+visibleDests+" dests";
}
function showDetail(slug){
  const p=RAW.packages.find(x=>x.slug===slug);if(!p)return;
  const dlg=document.getElementById("detail");const pb=p.priceBreakdown||{};
  const cells=[pb.doubleSharing!=null?'<div><b>'+inr(pb.doubleSharing)+'</b><span>Twin sharing (per person)</span></div>':'',pb.tripleSharing!=null?'<div><b>'+inr(pb.tripleSharing)+'</b><span>Triple sharing</span></div>':'',pb.singleSupplement!=null?'<div><b>'+inr(pb.singleSupplement)+'</b><span>Single supplement</span></div>':'',pb.childUnder12!=null?'<div><b>'+inr(pb.childUnder12)+'</b><span>Child under 12</span></div>':'',pb.childUnder5!=null?'<div><b>'+(pb.childUnder5===0?'Free':inr(pb.childUnder5))+'</b><span>Child under 5</span></div>':''].join("");
  dlg.innerHTML='<div class="head"><h3>'+esc(p.title)+'</h3><button id="closeDlg">Close ✕</button></div><div class="body"><p><strong>'+esc(p.destinationName)+'</strong> · '+esc(p.duration)+' · '+esc(p.travelType)+' · <code>'+esc(p.slug)+'</code></p>'+(p.bestFor?'<p style="color:var(--slate)">Best for: '+esc(p.bestFor)+'</p>':'')+'<h4>Pricing</h4><div class="price-grid">'+cells+'</div>'+(p.categories?.length?'<h4>Categories</h4><p>'+p.categories.map(c=>'<span class="pill">'+esc(c)+'</span>').join(" ")+'</p>':'')+(p.tags?.length?'<h4>Tags</h4><p>'+p.tags.map(c=>'<span class="pill tag">'+esc(c)+'</span>').join(" ")+'</p>':'')+(p.highlights?.length?'<h4>Highlights</h4><ul>'+p.highlights.map(h=>'<li>'+esc(h)+'</li>').join("")+'</ul>':'')+(p.inclusions?.length?'<h4>Inclusions</h4><ul>'+p.inclusions.map(h=>'<li>'+esc(h)+'</li>').join("")+'</ul>':'')+'<h4>Rating</h4><p>'+(p.rating??"—")+' · '+(p.reviews??0)+' reviews</p></div>';
  dlg.showModal();document.getElementById("closeDlg").onclick=()=>dlg.close();
}
function downloadFile(name,content,type="application/json"){const blob=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click()}
function exportCsv(){const cols=["destinationName","title","slug","travelType","duration","pricePerPerson","categories","tags","highlights","inclusions"];const rows=[cols.join(",")];for(const p of RAW.packages){const cells=cols.map(c=>{const v=p[c];if(Array.isArray(v))return'"'+v.join("; ").replace(/"/g,'""')+'"';if(v==null)return"";return'"'+String(v).replace(/"/g,'""')+'"'});rows.push(cells.join(","))}downloadFile("packages.csv",rows.join("\\n"),"text/csv")}
["q","travelType","category","region","sort"].forEach(id=>{document.getElementById(id).addEventListener("input",()=>{sortMode=document.getElementById("sort").value;render()})});
document.getElementById("expandAll").onclick=()=>document.querySelectorAll("details.dest").forEach(d=>d.open=true);
document.getElementById("collapseAll").onclick=()=>document.querySelectorAll("details.dest").forEach(d=>d.open=false);
document.getElementById("downloadJson").onclick=()=>downloadFile("packages.json",JSON.stringify(RAW,null,2));
document.getElementById("downloadCsv").onclick=exportCsv;
document.getElementById("printBtn").onclick=()=>window.print();
document.addEventListener("click",(e)=>{const btn=e.target.closest("[data-action]");if(!btn)return;const slug=btn.dataset.slug;const dest=btn.dataset.dest;const action=btn.dataset.action;if(action==="view")showDetail(slug);if(action==="edit")alert("Edit hook: "+slug+"\\nWire this to /admin/packages/edit/"+slug+" or POST to /api/admin/packages.");if(action==="delete"){if(confirm("Delete "+slug+"?"))alert("Delete hook: "+slug+"\\nWire this to DELETE /api/admin/packages/"+slug+".")}if(action==="add")alert("Add package to "+dest+"\\nWire this to /admin/packages/new?dest="+dest);if(action==="export-dest"){const g=groupsAll.get(dest);if(g)downloadFile(dest+".json",JSON.stringify(g,null,2))}});
render();
</script>
</body></html>`;
}

export async function GET() {
  return new NextResponse(buildHtml(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
