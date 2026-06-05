import { useState, useEffect } from "react";
const SUPA_URL = "https://mkvlqiksskvqqyquzvy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdmxxaWtzc3NrdnFxeXF1enZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Mzk4MDMsImV4cCI6MjA5NjIxNTgwM30.yVjbECOgBr3Krc8a9qMRsxhDFx8IiyYtZkffr92nzFE";
const db = {
  async getJobs() {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?order=created_at.desc`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async addJob(job) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs`, { method: "POST", headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(job) });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async updateJob(id, updates) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?id=eq.${id}`, { method: "PATCH", headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(updates) });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async deleteJob(id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?id=eq.${id}`, { method: "DELETE", headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } });
    if (!r.ok) throw new Error(await r.text());
  }
};
const C = { navy:"#1E2B4A",navy2:"#2D3B60",copper:"#E8956D",copperD:"#C97040",bg:"#F4F6FB",border:"#E2E6F0",txt:"#1A2035",txt2:"#5A6585",txt3:"#8E97B0",ok:"#00B86B",err:"#E03030" };
const ST_C = { "פנייה חדשה":["#EEF2FF","#4338CA"],"ממתין לאישור":["#FFFBEB","#B45309"],"אושר לביצוע":["#F0FDF4","#166534"],"נקבעה מדידה":["#EFF6FF","#1D4ED8"],"נמדד חלקית":["#FFF7ED","#C2410C"],"נמדד במלואו":["#F0FDF4","#166534"],"נדרש ביקור נוסף":["#FEF2F2","#991B1B"],"בשרטוט":["#FAF5FF","#6D28D9"],"בבקרה":["#ECFEFF","#0E7490"],"מוכן למסירה":["#F0FDF4","#14532D"],"הושלם":["#F9FAFB","#374151"] };
const PAY_C = { paid:["#F0FDF4","#166534","שולם"],partial:["#FFFBEB","#B45309","חלקי"],unpaid:["#FEF2F2","#991B1B","לא שולם"] };
const STATUSES = Object.keys(ST_C);
const TYPES = ["מדידה טופוגרפית","תשריט בית משותף","תצ\"ר","ליווי בנייה","מדידת דירה","סריקת לייזר","מדידת רחפן","סימון בשטח","ביקורת ביצוע","אחר"];
const TEAM = ["רון לוי","מיכל ברקוביץ","יוסי מזרחי","אורית ספיר"];
const Badge = ({s}) => { const c=ST_C[s]||["#F9FAFB","#374151"]; return <span style={{background:c[0],color:c[1],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{s}</span>; };
const PBadge = ({p}) => { const c=PAY_C[p]||PAY_C.unpaid; return <span style={{background:c[0],color:c[1],padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700}}>{c[2]}</span>; };
const Btn = ({label,onClick,v="copper",style={},disabled=false}) => { const vs={copper:{background:`linear-gradient(135deg,${C.copperD},${C.copper})`,color:"#fff"},navy:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,color:"#fff"},ghost:{background:"#fff",color:C.navy,border:`1.5px solid ${C.border}`},red:{background:"#FEF2F2",color:"#991B1B",border:"1.5px solid #FECACA"}}; return <button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",borderRadius:12,padding:"13px",fontFamily:"Heebo,sans-serif",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:"100%",opacity:disabled?0.6:1,...vs[v],...style}}>{label}</button>; };
const Inp = ({label,value,onChange,placeholder="",type="text",multiline=false}) => (<div style={{marginBottom:13}}>{label&&<label style={{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:"block",textAlign:"right"}}>{label}</label>}{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box",resize:"none",height:80}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box"}}/>}</div>);
const Card = ({children,style={},onClick}) => (<div onClick={onClick} style={{background:"#fff",borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(30,43,74,0.07)",overflow:"hidden",...style,cursor:onClick?"pointer":"default"}}>{children}</div>);
const Row = ({k,v}) => (<div style={{display:"flex",padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}><div style={{width:110,fontSize:12,color:C.txt3,fontWeight:700,flexShrink:0}}>{k}</div><div style={{flex:1,fontSize:13,color:C.txt,fontWeight:600}}>{v||"—"}</div></div>);
const Sbox = ({title,children}) => (<div style={{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}}>{title}</div>{children}</div>);
const Spinner = () => (<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,flexDirection:"column",gap:12}}><div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.copper,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><div style={{fontSize:13,color:C.txt3,fontWeight:600}}>טוען...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);
