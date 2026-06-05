import { useState, useEffect } from "react";

// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPA_URL = "https://mkvlqiksskvqqyquzvy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdmxxaWtzc3NrdnFxeXF1enZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Mzk4MDMsImV4cCI6MjA5NjIxNTgwM30.yVjbECOgBr3Krc8a9qMRsxhDFx8IiyYtZkffr92nzFE";

const db = {
  async getJobs() {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?order=created_at.desc`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async addJob(job) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(job)
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async updateJob(id, updates) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(updates)
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async deleteJob(id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
  }
};

// ── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  navy:"#1E2B4A", navy2:"#2D3B60", copper:"#E8956D", copperD:"#C97040",
  bg:"#F4F6FB", border:"#E2E6F0", txt:"#1A2035", txt2:"#5A6585", txt3:"#8E97B0",
  ok:"#00B86B", err:"#E03030"
};

const ST_C = {
  "פנייה חדשה":["#EEF2FF","#4338CA"],"ממתין לאישור":["#FFFBEB","#B45309"],
  "אושר לביצוע":["#F0FDF4","#166534"],"נקבעה מדידה":["#EFF6FF","#1D4ED8"],
  "נמדד חלקית":["#FFF7ED","#C2410C"],"נמדד במלואו":["#F0FDF4","#166534"],
  "נדרש ביקור נוסף":["#FEF2F2","#991B1B"],"בשרטוט":["#FAF5FF","#6D28D9"],
  "בבקרה":["#ECFEFF","#0E7490"],"מוכן למסירה":["#F0FDF4","#14532D"],"הושלם":["#F9FAFB","#374151"],
};
const PAY_C = {
  paid:["#F0FDF4","#166534","שולם"],
  partial:["#FFFBEB","#B45309","חלקי"],
  unpaid:["#FEF2F2","#991B1B","לא שולם"]
};
const STATUSES = Object.keys(ST_C);
const TYPES = ["מדידה טופוגרפית","תשריט בית משותף","תצ\"ר","ליווי בנייה","מדידת דירה","סריקת לייזר","מדידת רחפן","סימון בשטח","ביקורת ביצוע","אחר"];
const TEAM = ["רון לוי","מיכל ברקוביץ","יוסי מזרחי","אורית ספיר"];

// ── MINI COMPONENTS ───────────────────────────────────────────────────────────
const Badge = ({s}) => { const c=ST_C[s]||["#F9FAFB","#374151"]; return <span style={{background:c[0],color:c[1],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{s}</span>; };
const PBadge = ({p}) => { const c=PAY_C[p]||PAY_C.unpaid; return <span style={{background:c[0],color:c[1],padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700}}>{c[2]}</span>; };

const Btn = ({label,onClick,v="copper",style={},disabled=false}) => {
  const vs = {copper:{background:`linear-gradient(135deg,${C.copperD},${C.copper})`,color:"#fff"},navy:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,color:"#fff"},ghost:{background:"#fff",color:C.navy,border:`1.5px solid ${C.border}`},red:{background:"#FEF2F2",color:"#991B1B",border:"1.5px solid #FECACA"}};
  return <button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",borderRadius:12,padding:"13px",fontFamily:"Heebo,sans-serif",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:"100%",opacity:disabled?0.6:1,...vs[v],...style}}>{label}</button>;
};

const Inp = ({label,value,onChange,placeholder="",type="text",multiline=false}) => (
  <div style={{marginBottom:13}}>
    {label && <label style={{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:"block",textAlign:"right"}}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box",resize:"none",height:80}}/>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box"}}/>
    }
  </div>
);

const Card = ({children,style={},onClick}) => (
  <div onClick={onClick} style={{background:"#fff",borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(30,43,74,0.07)",overflow:"hidden",...style,cursor:onClick?"pointer":"default"}}>{children}</div>
);

const Row = ({k,v}) => (
  <div style={{display:"flex",padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
    <div style={{width:110,fontSize:12,color:C.txt3,fontWeight:700,flexShrink:0}}>{k}</div>
    <div style={{flex:1,fontSize:13,color:C.txt,fontWeight:600}}>{v||"—"}</div>
  </div>
);

const Sbox = ({title,children}) => (
  <div style={{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}}>{title}</div>
    {children}
  </div>
);

const Spinner = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,flexDirection:"column",gap:12}}>
    <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.copper,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{fontSize:13,color:C.txt3,fontWeight:600}}>טוען...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState("dash");
  const [filter, setFilter] = useState("הכל");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState("info");
  const [newSt, setNewSt] = useState("");
  const [newPay, setNewPay] = useState("");
  const [noteVal, setNoteVal] = useState("");
  const [aiKey, setAiKey] = useState(null);
  const [aiLoad, setAiLoad] = useState(false);
  const [aiTxt, setAiTxt] = useState("");
  const [nj, setNj] = useState({client_name:"",client_phone:"",address:"",job_type:TYPES[0],due_date:"",price:"",notes:"",assignee:TEAM[0]});
  const setNjF = (k,v) => setNj(p=>({...p,[k]:v}));
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="ok") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  };

  // Load from Supabase
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getJobs();
      setJobs(data);
    } catch(e) {
      setError("שגיאה בטעינת נתונים: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const openJob = (j) => { setSel(j); setTab("info"); setNewSt(j.status); setNewPay(j.payment); setNoteVal(j.notes||""); };

  const saveSt = async () => {
    setSaving(true);
    try {
      const updated = await db.updateJob(sel.id, {status: newSt});
      setJobs(js => js.map(j => j.id===sel.id ? {...j, status:newSt} : j));
      setSel(s => ({...s, status:newSt}));
      showToast("סטטוס עודכן: " + newSt);
    } catch(e) { showToast("שגיאה: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const savePay = async () => {
    setSaving(true);
    try {
      await db.updateJob(sel.id, {payment: newPay});
      setJobs(js => js.map(j => j.id===sel.id ? {...j, payment:newPay} : j));
      setSel(s => ({...s, payment:newPay}));
      showToast("תשלום עודכן!");
    } catch(e) { showToast("שגיאה: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      await db.updateJob(sel.id, {notes: noteVal});
      setJobs(js => js.map(j => j.id===sel.id ? {...j, notes:noteVal} : j));
      showToast("הערות נשמרו!");
    } catch(e) { showToast("שגיאה: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const addJob = async () => {
    if (!nj.client_name.trim() || !nj.address.trim()) { showToast("מלא שם לקוח וכתובת", "err"); return; }
    setSaving(true);
    try {
      const created = await db.addJob({
        client_name: nj.client_name,
        client_phone: nj.client_phone,
        address: nj.address,
        job_type: nj.job_type,
        due_date: nj.due_date,
        price: parseInt(nj.price)||0,
        notes: nj.notes,
        assignee: nj.assignee,
        status: "פנייה חדשה",
        payment: "unpaid"
      });
      setJobs(js => [created, ...js]);
      setShowNew(false);
      setNj({client_name:"",client_phone:"",address:"",job_type:TYPES[0],due_date:"",price:"",notes:"",assignee:TEAM[0]});
      showToast("עבודה " + created.job_number + " נפתחה!");
    } catch(e) { showToast("שגיאה: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("למחוק עבודה זו?")) return;
    setSaving(true);
    try {
      await db.deleteJob(id);
      setJobs(js => js.filter(j => j.id !== id));
      setSel(null);
      showToast("עבודה נמחקה");
    } catch(e) { showToast("שגיאה: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const runAI = async (key) => {
    setAiKey(key); setAiLoad(true); setAiTxt("");
    await new Promise(r => setTimeout(r, 900));
    const active = jobs.filter(j=>j.status!=="הושלם").length;
    const unpaidN = jobs.filter(j=>j.payment!=="paid").length;
    const paid = jobs.filter(j=>j.payment==="paid").reduce((s,j)=>s+(j.price||0),0);
    const pend = jobs.filter(j=>j.payment!=="paid").reduce((s,j)=>s+(j.price||0),0);
    const draft = jobs.filter(j=>j.status==="בשרטוט").length;
    const texts = {
      summary:`📊 סיכום נוכחי:\n\n• ${jobs.length} עבודות במערכת\n• ${active} עבודות פעילות\n• ${draft} בשרטוט\n• ${unpaidN} ממתינות לגבייה\n\n💡 המלצה: עדיפות לעבודות הקרובות לתאריך יעד.`,
      priority:`🎯 סדר עדיפויות:\n\n${jobs.filter(j=>j.status!=="הושלם").slice(0,4).map((j,i)=>`${i+1}. ${j.job_number} – ${j.client_name} (${j.status})`).join("\n")}\n\n⚡ בדוק תאריכי יעד קרובים.`,
      delays:`⚠️ עיכובים אפשריים:\n\n${jobs.filter(j=>["בשרטוט","בבקרה","נמדד חלקית"].includes(j.status)).map(j=>`• ${j.job_number} – ${j.client_name}: ${j.status}`).join("\n")||"✅ לא זוהו עיכובים"}\n\nבדוק תאריכי יעד.`,
      quote:`📋 נוסח הצעת מחיר:\n\nלכבוד [שם הלקוח],\n\nלהלן הצעת מחיר עבור [סוג עבודה]:\n• מדידת שטח: ₪X\n• עיבוד ושרטוט: ₪Y\n• DWG + PDF: כלול\n\nסה"כ + מע"מ (18%)\nתוקף: 30 יום\n\nCoordinate 3D`,
      finance:`₪ מצב פיננסי:\n\n• שולם: ₪${paid.toLocaleString()}\n• לגבייה: ₪${pend.toLocaleString()}\n• ${unpaidN} עבודות לא שולמו\n\n${pend>0?"💡 פנה ללקוחות עם חוב פתוח.":"✅ מצב גבייה תקין!"}`,
    };
    setAiTxt(texts[key]||"");
    setAiLoad(false);
  };

  const filtered = jobs.filter(j => {
    const mf = filter==="הכל" || j.status===filter;
    const ms = !search || (j.client_name||"").includes(search) || (j.job_number||"").includes(search) || (j.address||"").includes(search);
    return mf && ms;
  });

  const paidRev = jobs.filter(j=>j.payment==="paid").reduce((s,j)=>s+(j.price||0),0);
  const pendRev = jobs.filter(j=>j.payment!=="paid").reduce((s,j)=>s+(j.price||0),0);

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  const DashPage = () => (
    <div style={{paddingBottom:80}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px 18px"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>Coordinate 3D</div>
        <div style={{fontSize:20,fontWeight:900,color:"#fff",marginBottom:14}}>לוח בקרה</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["📋",jobs.filter(j=>j.status!=="הושלם").length,"פעילות"],["📍",jobs.filter(j=>j.status==="נקבעה מדידה").length,"למדידה"],["₪",jobs.filter(j=>j.payment!=="paid").length,"לתשלום"],["✓",jobs.filter(j=>j.status==="הושלם").length,"הושלמו"]].map(([icon,val,lbl],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.1)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:20,marginBottom:5}}>{icon}</div>
              <div style={{fontSize:26,fontWeight:900,color:"#fff"}}>{val}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
        {loading ? <Spinner/> : (
          <>
            <Card>
              <div style={{display:"flex",padding:15,gap:10}}>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:19,fontWeight:900,color:C.ok}}>₪{Math.round(paidRev/1000)}K</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:2}}>שולם</div>
                </div>
                <div style={{width:1,background:C.border}}/>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:19,fontWeight:900,color:C.err}}>₪{Math.round(pendRev/1000)}K</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:2}}>לגבייה</div>
                </div>
              </div>
            </Card>
            <Btn label="＋ פתח עבודה חדשה" onClick={()=>setShowNew(true)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["✏️","בשרטוט"],["📦","מוכן למסירה"]].map(([ic,st])=>(
                <Card key={st} style={{padding:15,textAlign:"center"}} onClick={()=>{setPage("jobs");setFilter(st);}}>
                  <div style={{fontSize:20}}>{ic}</div>
                  <div style={{fontSize:22,fontWeight:900,color:C.navy,marginTop:3}}>{jobs.filter(j=>j.status===st).length}</div>
                  <div style={{fontSize:10,color:C.txt3}}>{st}</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:14,fontWeight:800,color:C.txt}}>עבודות אחרונות</span>
                <button style={{border:"none",background:"none",color:C.navy,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Heebo,sans-serif"}} onClick={()=>setPage("jobs")}>הכל ←</button>
              </div>
              {jobs.slice(0,5).map(j=>(
                <div key={j.id} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",gap:10}} onClick={()=>openJob(j)}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{j.client_name}</div>
                    <div style={{fontSize:11,color:C.txt3,marginTop:1}}>{j.job_type} · {j.job_number}</div>
                  </div>
                  <Badge s={j.status}/>
                </div>
              ))}
              {jobs.length===0 && <div style={{textAlign:"center",padding:24,color:C.txt3}}>אין עבודות עדיין</div>}
            </Card>
            <Card>
              <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}}>💰 ממתינים לתשלום</div>
              {jobs.filter(j=>j.payment!=="paid").length===0
                ? <div style={{textAlign:"center",padding:24,color:C.txt3}}>✓ כל התשלומים מסודרים</div>
                : jobs.filter(j=>j.payment!=="paid").map(j=>(
                  <div key={j.id} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",gap:10}} onClick={()=>openJob(j)}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{j.client_name}</div>
                      <div style={{fontSize:10,color:C.txt3,fontFamily:"monospace"}}>{j.job_number}</div>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.navy}}>₪{(j.price||0).toLocaleString()}</div>
                      <PBadge p={j.payment}/>
                    </div>
                  </div>
                ))
              }
            </Card>
          </>
        )}
      </div>
    </div>
  );

  // ── JOBS ─────────────────────────────────────────────────────────────────────
  const JobsPage = () => (
    <div style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>עבודות מדידה</div>
          <button onClick={()=>setShowNew(true)} style={{width:38,height:38,borderRadius:12,background:C.copper,border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>＋</button>
        </div>
      </div>
      <div style={{background:"#fff",padding:"9px 13px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 חיפוש לקוח, מספר עבודה..."
          style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"flex",gap:7,padding:"9px 13px",overflowX:"auto",background:"#fff",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {["הכל","נקבעה מדידה","בשרטוט","בבקרה","מוכן למסירה","הושלם"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${filter===f?C.navy:C.border}`,background:filter===f?C.navy:"#fff",color:filter===f?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{f}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:13,display:"flex",flexDirection:"column",gap:10,paddingBottom:90}}>
        {loading ? <Spinner/> : filtered.length===0
          ? <div style={{textAlign:"center",padding:40,color:C.txt3}}>לא נמצאו עבודות</div>
          : filtered.map(j=>(
            <Card key={j.id} onClick={()=>openJob(j)}>
              <div style={{padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,gap:8}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:C.txt}}>{j.client_name}</div>
                    <div style={{fontSize:10,color:C.txt3,fontFamily:"monospace"}}>{j.job_number}</div>
                  </div>
                  <Badge s={j.status}/>
                </div>
                <div style={{fontSize:12,color:C.txt2,marginBottom:3}}>📐 {j.job_type}</div>
                <div style={{fontSize:12,color:C.txt3,marginBottom:10}}>📍 {j.address}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.txt2}}>👷 {j.assignee}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <PBadge p={j.payment}/>
                    {j.due_date && <span style={{fontSize:11,color:C.txt3}}>⏱ {j.due_date}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );

  // ── AI ───────────────────────────────────────────────────────────────────────
  const AIPage = () => (
    <div style={{paddingBottom:80}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px 18px"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>Coordinate 3D</div>
        <div style={{fontSize:20,fontWeight:900,color:"#fff",marginBottom:14}}>עוזר AI חכם</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["summary","📊 סיכום"],["priority","🎯 תיעדוף"],["delays","⚠️ עיכובים"],["quote","📋 הצעת מחיר"],["finance","₪ כספים"]].map(([k,l])=>(
            <button key={k} onClick={()=>runAI(k)} style={{background:aiKey===k?"rgba(232,149,109,0.2)":"rgba(255,255,255,0.07)",border:`1px solid ${aiKey===k?"#E8956D":"rgba(255,255,255,0.14)"}`,borderRadius:10,padding:"12px 10px",color:"rgba(255,255,255,0.9)",fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"right"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
        {aiLoad && <Card style={{padding:18,textAlign:"center",color:C.navy,fontWeight:600}}>⏳ מנתח נתוני המשרד...</Card>}
        {aiTxt && !aiLoad && (
          <Card style={{padding:18}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:34,height:34,borderRadius:10,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.copper}}>AI</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.txt}}>Coordinate 3D AI</div>
                <div style={{fontSize:11,color:C.txt3}}>מבוסס {jobs.length} עבודות מהענן</div>
              </div>
            </div>
            {aiTxt.split("\n").map((line,i)=>(
              <p key={i} style={{fontSize:13,lineHeight:1.7,margin:0,marginBottom:2,textAlign:"right",...(line.startsWith("•")||(/^\d/.test(line))?{paddingRight:8,borderRight:`2px solid ${C.copper}`}:{})}}>{line||"\u00A0"}</p>
            ))}
          </Card>
        )}
        {!aiLoad&&!aiTxt&&<div style={{textAlign:"center",padding:50,color:C.txt3}}><div style={{fontSize:36,marginBottom:10}}>✦</div><div style={{fontWeight:700}}>בחר פעולה לניתוח חכם</div><div style={{fontSize:12,marginTop:6}}>מחובר ל-{jobs.length} עבודות בענן</div></div>}
      </div>
    </div>
  );

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  const SettingsPage = () => (
    <div style={{paddingBottom:80}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"28px 20px 24px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:72,height:72,borderRadius:18,background:C.copper,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",marginBottom:13}}>3D</div>
        <div style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:1}}>COORDINATE 3D</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:3}}>Measurements & Engineering</div>
        <div style={{marginTop:10,background:"rgba(0,184,107,0.15)",border:"1px solid rgba(0,184,107,0.3)",borderRadius:20,padding:"5px 14px"}}>
          <span style={{fontSize:11,color:"#00B86B",fontWeight:700}}>● מחובר לענן Supabase</span>
        </div>
      </div>
      <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}}>📊 סטטיסטיקות</div>
          <Row k="סה״כ עבודות" v={String(jobs.length)}/>
          <Row k="פעילות" v={String(jobs.filter(j=>j.status!=="הושלם").length)}/>
          <Row k="הושלמו" v={String(jobs.filter(j=>j.status==="הושלם").length)}/>
          <Row k="לא שולמו" v={String(jobs.filter(j=>j.payment==="unpaid").length)}/>
          <Row k="הכנסות" v={"₪"+paidRev.toLocaleString()}/>
        </Card>
        <Card>
          <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}}>🏢 פרטי המשרד</div>
          <Row k="שם" v="Coordinate 3D"/>
          <Row k="התמחות" v="Measurements & Engineering"/>
          <Row k="ענן" v="Supabase ✓"/>
          <Row k="מסד נתונים" v="PostgreSQL"/>
        </Card>
        <Card>
          <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}}>👷 צוות</div>
          {TEAM.map(t=><Row key={t} k={t} v="עובד"/>)}
        </Card>
        <Btn label="🔄 רענן נתונים" onClick={loadJobs} v="ghost"/>
      </div>
    </div>
  );

  // ── NEW JOB OVERLAY ──────────────────────────────────────────────────────────
  const NewJobOverlay = () => (
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:50,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setShowNew(false)} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",fontSize:18,cursor:"pointer"}}>→</button>
          <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>עבודה חדשה</div>
        </div>
      </div>
      <div style={{padding:16,paddingBottom:40}}>
        <Sbox title="פרטי לקוח">
          <Inp label="שם לקוח *" value={nj.client_name} onChange={v=>setNjF("client_name",v)} placeholder="שם מלא"/>
          <Inp label="טלפון" value={nj.client_phone} onChange={v=>setNjF("client_phone",v)} placeholder="05X-XXXXXXX" type="tel"/>
        </Sbox>
        <Sbox title="מיקום">
          <Inp label="כתובת *" value={nj.address} onChange={v=>setNjF("address",v)} placeholder="רחוב ומספר, עיר"/>
        </Sbox>
        <Sbox title="סוג עבודה">
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {TYPES.map(t=>(
              <button key={t} onClick={()=>setNjF("job_type",t)} style={{padding:"7px 12px",borderRadius:20,border:`1.5px solid ${nj.job_type===t?C.copper:C.border}`,background:nj.job_type===t?C.copper:"#fff",color:nj.job_type===t?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
        </Sbox>
        <Sbox title="אחראי עבודה">
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {TEAM.map(t=>(
              <button key={t} onClick={()=>setNjF("assignee",t)} style={{padding:"7px 12px",borderRadius:20,border:`1.5px solid ${nj.assignee===t?C.navy:C.border}`,background:nj.assignee===t?C.navy:"#fff",color:nj.assignee===t?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
        </Sbox>
        <Sbox title="תאריך ומחיר">
          <Inp label="תאריך יעד" value={nj.due_date} onChange={v=>setNjF("due_date",v)} placeholder="DD/MM/YY"/>
          <Inp label="מחיר (₪)" value={nj.price} onChange={v=>setNjF("price",v)} placeholder="0" type="number"/>
          <Inp label="הערות" value={nj.notes} onChange={v=>setNjF("notes",v)} placeholder="הערות לעבודה..." multiline/>
        </Sbox>
        <Btn label={saving?"שומר...":"✓ פתח עבודה"} onClick={addJob} disabled={saving}/>
      </div>
    </div>
  );

  // ── JOB DETAIL OVERLAY ───────────────────────────────────────────────────────
  const DetOverlay = () => (
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:50,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSel(null)} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",fontSize:18,cursor:"pointer"}}>→</button>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"monospace"}}>{sel.job_number}</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{sel.client_name}</div>
          </div>
          <Badge s={sel.status}/>
        </div>
      </div>
      <div style={{display:"flex",background:"#fff",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[["info","פרטים"],["status","סטטוס"],["pay","תשלום"],["notes","הערות"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"11px",textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer",borderBottom:`2.5px solid ${tab===k?C.copper:"transparent"}`,border:"none",borderBottom:`2.5px solid ${tab===k?C.copper:"transparent"}`,background:"none",color:tab===k?C.copper:C.txt3,fontFamily:"Heebo,sans-serif"}}>{l}</button>
        ))}
      </div>
      <div style={{padding:16,paddingBottom:40}}>
        {tab==="info" && (
          <div>
            <Card style={{marginBottom:12}}>
              <Row k="📐 סוג" v={sel.job_type}/>
              <Row k="📍 כתובת" v={sel.address}/>
              <Row k="📅 יעד" v={sel.due_date}/>
              <Row k="👷 אחראי" v={sel.assignee}/>
              <Row k="📞 טלפון" v={sel.client_phone}/>
              <Row k="💰 מחיר" v={"₪"+(sel.price||0).toLocaleString()}/>
              <Row k="🗓 נפתח" v={sel.created_at ? new Date(sel.created_at).toLocaleDateString("he-IL") : "—"}/>
            </Card>
            <Btn label="🗑 מחק עבודה" onClick={()=>deleteJob(sel.id)} v="red" style={{marginTop:4}}/>
          </div>
        )}
        {tab==="status" && (
          <Card>
            <div style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:C.txt2}}>בחר סטטוס חדש:</div>
            <div style={{padding:"0 14px 14px",display:"flex",flexWrap:"wrap",gap:6}}>
              {STATUSES.map(s=>(
                <button key={s} onClick={()=>setNewSt(s)} style={{padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${newSt===s?C.navy:C.border}`,background:newSt===s?C.navy:"#fff",color:newSt===s?"#fff":C.txt2,fontFamily:"Heebo,sans-serif"}}>{s}</button>
              ))}
            </div>
            <div style={{padding:"0 16px 14px"}}><Btn label={saving?"שומר...":"💾 שמור סטטוס"} onClick={saveSt} disabled={saving}/></div>
          </Card>
        )}
        {tab==="pay" && (
          <Card style={{padding:16}}>
            <div style={{fontSize:15,fontWeight:800,color:C.txt,marginBottom:14,textAlign:"right"}}>סכום: ₪{(sel.price||0).toLocaleString()}</div>
            <div style={{display:"flex",gap:10,marginBottom:13}}>
              {[["paid","✓ שולם","#166534","#F0FDF4"],["partial","חלקי","#B45309","#FFFBEB"],["unpaid","לא שולם","#991B1B","#FEF2F2"]].map(([v,l,col,bg])=>(
                <button key={v} onClick={()=>setNewPay(v)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${newPay===v?col:C.border}`,background:newPay===v?bg:"#fff",color:newPay===v?col:C.txt3,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <Btn label={saving?"שומר...":"💾 שמור תשלום"} onClick={savePay} disabled={saving}/>
          </Card>
        )}
        {tab==="notes" && (
          <Card style={{padding:16}}>
            <Inp label="הערות" value={noteVal} onChange={setNoteVal} placeholder="הוסף הערות..." multiline/>
            <Btn label={saving?"שומר...":"💾 שמור הערות"} onClick={saveNote} v="navy" disabled={saving}/>
          </Card>
        )}
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"Heebo,sans-serif",direction:"rtl",background:C.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&display=swap');body{margin:0;background:#F4F6FB}`}</style>

      {/* TOAST */}
      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#FEF2F2":"#F0FDF4",border:`1px solid ${toast.type==="err"?"#FECACA":"#BBF7D0"}`,color:toast.type==="err"?"#991B1B":"#166534",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
          {toast.type==="err"?"❌":"✓"} {toast.msg}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={{margin:16,padding:14,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,color:"#991B1B",fontSize:13,fontWeight:600,textAlign:"right"}}>
          ❌ {error}
          <button onClick={loadJobs} style={{marginRight:10,background:"none",border:"none",color:"#1D4ED8",cursor:"pointer",fontWeight:700,fontFamily:"Heebo,sans-serif"}}>נסה שוב</button>
        </div>
      )}

      {showNew && <NewJobOverlay/>}
      {sel && !showNew && <DetOverlay/>}

      {!sel && !showNew && (
        <>
          <div style={{overflowY:"auto",height:"100vh",paddingBottom:70}}>
            {page==="dash"     && <DashPage/>}
            {page==="jobs"     && <JobsPage/>}
            {page==="ai"       && <AIPage/>}
            {page==="settings" && <SettingsPage/>}
          </div>
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:`1px solid ${C.border}`,display:"flex",height:65,alignItems:"center",paddingBottom:6,zIndex:40}}>
            {[["dash","🏠","ראשי"],["jobs","📋","עבודות"],["ai","✦","AI"],["settings","⚙️","הגדרות"]].map(([id,icon,lbl])=>(
              <button key={id} onClick={()=>setPage(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",padding:"8px 0"}}>
                <span style={{fontSize:22,lineHeight:1}}>{icon}</span>
                <span style={{fontSize:10,fontWeight:700,fontFamily:"Heebo,sans-serif",color:page===id?C.navy:C.txt3}}>{lbl}</span>
                {page===id&&<span style={{width:4,height:4,borderRadius:"50%",background:C.copper}}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
