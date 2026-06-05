import React from 'react'
import ReactDOM from 'react-dom/client'

const SUPA_URL = "https://mkvlqiksskvqqyquzvy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdmxxaWtzc3NrdnFxeXF1enZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Mzk4MDMsImV4cCI6MjA5NjIxNTgwM30.yVjbECOgBr3Krc8a9qMRsxhDFx8IiyYtZkffr92nzFE";

const COMPANY = {
  name: "Coordinate 3D",
  subtitle: "Measurements & Engineering",
  owner: "איהאב מרעי",
  address: "דרך בר יהודה, נשר",
};
const TEAM = ["איהאב מרעי", "ודיע דעבוס", "ג'ראם אבו סאלח"];

const db = {
  async getJobs() {
    const r = await fetch(`${SUPA_URL}/rest/v1/jobs?order=created_at.desc&limit=200`, {
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

const C = {
  navy:"#1E2B4A", navy2:"#2D3B60", copper:"#E8956D", copperD:"#C97040",
  bg:"#F4F6FB", border:"#E2E6F0", txt:"#1A2035", txt2:"#5A6585", txt3:"#8E97B0",
  ok:"#00B86B", err:"#E03030"
};

const ST_C = {
  "פנייה חדשה":["#EEF2FF","#4338CA"],
  "ממתין לאישור":["#FFFBEB","#B45309"],
  "אושר לביצוע":["#F0FDF4","#166534"],
  "נקבעה מדידה":["#EFF6FF","#1D4ED8"],
  "נמדד חלקית":["#FFF7ED","#C2410C"],
  "נמדד במלואו":["#F0FDF4","#166534"],
  "נדרש ביקור נוסף":["#FEF2F2","#991B1B"],
  "בשרטוט":["#FAF5FF","#6D28D9"],
  "בבקרה":["#ECFEFF","#0E7490"],
  "מוכן למסירה":["#F0FDF4","#14532D"],
  "הושלם":["#F9FAFB","#374151"],
  "בטיפול":["#EFF6FF","#1D4ED8"],
};
const PAY_C = {
  paid:["#F0FDF4","#166534","שולם"],
  partial:["#FFFBEB","#B45309","חלקי"],
  unpaid:["#FEF2F2","#991B1B","לא שולם"]
};
const STATUSES = Object.keys(ST_C);
const TYPES = ["מדידה טופוגרפית","תשריט בית משותף","תצ\"ר","ליווי בנייה","מדידת דירה","סריקת לייזר","מדידת רחפן","סימון בשטח","ביקורת ביצוע","פוטוגרמטריה","היתר בנייה","אחר"];

const Badge = ({s}) => {
  const c = ST_C[s] || ["#F9FAFB","#374151"];
  return React.createElement('span', {
    style:{background:c[0],color:c[1],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}
  }, s);
};

const PBadge = ({p}) => {
  const c = PAY_C[p] || PAY_C.unpaid;
  return React.createElement('span', {
    style:{background:c[0],color:c[1],padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700}
  }, c[2]);
};

function App() {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState("dash");
  const [filter, setFilter] = React.useState("הכל");
  const [search, setSearch] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [detTab, setDetTab] = React.useState("info");
  const [newSt, setNewSt] = React.useState("");
  const [newPay, setNewPay] = React.useState("");
  const [noteVal, setNoteVal] = React.useState("");
  const [toast, setToast] = React.useState(null);
  const [aiKey, setAiKey] = React.useState(null);
  const [aiLoad, setAiLoad] = React.useState(false);
  const [aiTxt, setAiTxt] = React.useState("");
  const [nj, setNj] = React.useState({
    client_name:"", client_phone:"", address:"",
    job_type: TYPES[0], due_date:"", price:"",
    notes:"", assignee: TEAM[0]
  });

  const showToast = (msg, type="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2500);
  };

  const load = React.useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await db.getJobs();
      setJobs(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openJob = (j) => {
    setSel(j); setDetTab("info");
    setNewSt(j.status); setNewPay(j.payment||"unpaid");
    setNoteVal(j.notes||"");
  };

  const saveSt = async () => {
    setSaving(true);
    try {
      await db.updateJob(sel.id, {status:newSt});
      setJobs(js=>js.map(j=>j.id===sel.id?{...j,status:newSt}:j));
      setSel(s=>({...s,status:newSt}));
      showToast("סטטוס עודכן!");
    } catch(e) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const savePay = async () => {
    setSaving(true);
    try {
      await db.updateJob(sel.id, {payment:newPay});
      setJobs(js=>js.map(j=>j.id===sel.id?{...j,payment:newPay}:j));
      setSel(s=>({...s,payment:newPay}));
      showToast("תשלום עודכן!");
    } catch(e) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      await db.updateJob(sel.id, {notes:noteVal});
      setJobs(js=>js.map(j=>j.id===sel.id?{...j,notes:noteVal}:j));
      showToast("הערות נשמרו!");
    } catch(e) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const addJob = async () => {
    if (!nj.client_name.trim()||!nj.address.trim()) { showToast("מלא שם לקוח וכתובת","err"); return; }
    setSaving(true);
    try {
      const created = await db.addJob({
        client_name:nj.client_name, client_phone:nj.client_phone,
        address:nj.address, job_type:nj.job_type,
        due_date:nj.due_date, price:parseInt(nj.price)||0,
        notes:nj.notes, assignee:nj.assignee,
        status:"פנייה חדשה", payment:"unpaid"
      });
      setJobs(js=>[created,...js]);
      setShowNew(false);
      setNj({client_name:"",client_phone:"",address:"",job_type:TYPES[0],due_date:"",price:"",notes:"",assignee:TEAM[0]});
      showToast("עבודה נפתחה: "+(created.job_number||""));
    } catch(e) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const delJob = async () => {
    if (!window.confirm("למחוק עבודה זו?")) return;
    setSaving(true);
    try {
      await db.deleteJob(sel.id);
      setJobs(js=>js.filter(j=>j.id!==sel.id));
      setSel(null);
      showToast("עבודה נמחקה");
    } catch(e) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const runAI = async (key) => {
    setAiKey(key); setAiLoad(true); setAiTxt("");
    await new Promise(r=>setTimeout(r,900));
    const active = jobs.filter(j=>j.status!=="הושלם").length;
    const unpaidN = jobs.filter(j=>j.payment!=="paid").length;
    const paid = jobs.filter(j=>j.payment==="paid").reduce((s,j)=>s+(j.price||0),0);
    const pend = jobs.filter(j=>j.payment!=="paid").reduce((s,j)=>s+(j.price||0),0);
    const texts = {
      summary:`סיכום נוכחי:\n\n• ${jobs.length} עבודות במערכת\n• ${active} עבודות פעילות\n• ${jobs.filter(j=>j.status==="בשרטוט").length} בשרטוט\n• ${unpaidN} ממתינות לגבייה\n\nהמלצה: עדיפות לעבודות הקרובות לתאריך יעד.`,
      priority:`סדר עדיפויות:\n\n${jobs.filter(j=>j.status!=="הושלם").slice(0,5).map((j,i)=>`${i+1}. ${j.job_number||""} – ${j.client_name} (${j.status})`).join("\n")}\n\nבדוק תאריכי יעד קרובים.`,
      delays:`עיכובים אפשריים:\n\n${jobs.filter(j=>["בשרטוט","בבקרה","נמדד חלקית","נדרש ביקור נוסף"].includes(j.status)).map(j=>`• ${j.job_number||""} – ${j.client_name}: ${j.status}`).join("\n")||"לא זוהו עיכובים"}\n\nבדוק תאריכי יעד.`,
      quote:`נוסח הצעת מחיר:\n\nלכבוד [שם הלקוח],\n\nלהלן הצעת מחיר עבור [סוג עבודה]:\n• מדידת שטח: ₪X\n• עיבוד ושרטוט: ₪Y\n• DWG + PDF: כלול\n\nסה"כ + מע"מ (18%)\nתוקף: 30 יום\n\n${COMPANY.name}\n${COMPANY.owner}`,
      finance:`מצב פיננסי:\n\n• שולם: ₪${paid.toLocaleString()}\n• לגבייה: ₪${pend.toLocaleString()}\n• ${unpaidN} עבודות לא שולמו\n\n${pend>0?"פנה ללקוחות עם חוב פתוח.":"מצב גבייה תקין!"}`,
    };
    setAiTxt(texts[key]||"");
    setAiLoad(false);
  };

  const filtered = jobs.filter(j=>{
    const mf = filter==="הכל" || j.status===filter;
    const ms = !search || (j.client_name||"").includes(search) || (j.job_number||"").includes(search) || (j.address||"").includes(search);
    return mf && ms;
  });

  const paidRev = jobs.filter(j=>j.payment==="paid").reduce((s,j)=>s+(j.price||0),0);
  const pendRev = jobs.filter(j=>j.payment!=="paid").reduce((s,j)=>s+(j.price||0),0);

  const s = {
    app:{fontFamily:"Heebo,sans-serif",direction:"rtl",background:C.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"},
    hdr:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"16px 18px 18px",flexShrink:0},
    card:{background:"#fff",borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(30,43,74,0.07)",overflow:"hidden",marginBottom:12},
    row:{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",gap:10},
    btn:(v="copper")=>({display:"flex",alignItems:"center",justifyContent:"center",border:"none",borderRadius:12,padding:"13px",fontFamily:"Heebo,sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",
      background:v==="copper"?`linear-gradient(135deg,${C.copperD},${C.copper})`:v==="navy"?`linear-gradient(135deg,${C.navy},${C.navy2})`:v==="red"?"#FEF2F2":"#fff",
      color:v==="red"?"#991B1B":v==="ghost"?C.navy:"#fff",
      border:v==="ghost"?`1.5px solid ${C.border}`:v==="red"?"1.5px solid #FECACA":"none"
    }),
    inp:{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"Heebo,sans-serif",fontSize:14,color:C.txt,background:"#fff",outline:"none",textAlign:"right",boxSizing:"border-box"},
    overlay:{position:"fixed",inset:0,background:C.bg,zIndex:50,display:"flex",flexDirection:"column",overflowY:"auto",maxWidth:480,margin:"0 auto"},
  };

  const Inp = ({label,value,onChange,placeholder="",type="text",multi=false}) => (
    React.createElement('div', {style:{marginBottom:13}},
      label && React.createElement('label',{style:{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:"block",textAlign:"right"}},label),
      multi
        ? React.createElement('textarea',{value,onChange:e=>onChange(e.target.value),placeholder,style:{...s.inp,height:75,resize:"none"}})
        : React.createElement('input',{type,value,onChange:e=>onChange(e.target.value),placeholder,style:s.inp})
    )
  );

  const DRow = ({k,v}) => React.createElement('div',{style:{display:"flex",padding:"10px 16px",borderBottom:`1px solid ${C.border}`}},
    React.createElement('div',{style:{width:110,fontSize:12,color:C.txt3,fontWeight:700,flexShrink:0}},k),
    React.createElement('div',{style:{flex:1,fontSize:13,color:C.txt,fontWeight:600}},v||"—")
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const DashPage = () => React.createElement('div',{style:{paddingBottom:80}},
    React.createElement('div',{style:s.hdr},
      React.createElement('div',{style:{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}},COMPANY.name),
      React.createElement('div',{style:{fontSize:20,fontWeight:900,color:"#fff",marginBottom:14}},"לוח בקרה"),
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
        [["📋",jobs.filter(j=>j.status!=="הושלם").length,"פעילות"],["📍",jobs.filter(j=>j.status==="נקבעה מדידה").length,"למדידה"],["₪",jobs.filter(j=>j.payment!=="paid").length,"לתשלום"],["✓",jobs.filter(j=>j.status==="הושלם").length,"הושלמו"]].map(([ic,v,l],i)=>
          React.createElement('div',{key:i,style:{background:"rgba(255,255,255,0.1)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,0.08)"}},
            React.createElement('div',{style:{fontSize:20,marginBottom:5}},ic),
            React.createElement('div',{style:{fontSize:26,fontWeight:900,color:"#fff"}},v),
            React.createElement('div',{style:{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}},l)
          )
        )
      )
    ),
    React.createElement('div',{style:{padding:14}},
      loading ? React.createElement('div',{style:{textAlign:"center",padding:40,color:C.txt3,fontWeight:600}},"טוען...") :
      React.createElement(React.Fragment,null,
        React.createElement('div',{style:s.card},
          React.createElement('div',{style:{display:"flex",padding:15,gap:10}},
            React.createElement('div',{style:{flex:1,textAlign:"center"}},
              React.createElement('div',{style:{fontSize:19,fontWeight:900,color:C.ok}},"₪"+Math.round(paidRev/1000)+"K"),
              React.createElement('div',{style:{fontSize:10,color:C.txt3,marginTop:2}},"שולם")
            ),
            React.createElement('div',{style:{width:1,background:C.border}}),
            React.createElement('div',{style:{flex:1,textAlign:"center"}},
              React.createElement('div',{style:{fontSize:19,fontWeight:900,color:C.err}},"₪"+Math.round(pendRev/1000)+"K"),
              React.createElement('div',{style:{fontSize:10,color:C.txt3,marginTop:2}},"לגבייה")
            )
          )
        ),
        React.createElement('button',{onClick:()=>setShowNew(true),style:{...s.btn(),...{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}},"＋ פתח עבודה חדשה"),
        React.createElement('div',{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}},
          [["✏️","בשרטוט"],["📦","מוכן למסירה"]].map(([ic,st])=>
            React.createElement('div',{key:st,style:{...s.card,padding:15,textAlign:"center",cursor:"pointer",marginBottom:0},onClick:()=>{setPage("jobs");setFilter(st);}},
              React.createElement('div',{style:{fontSize:20}},ic),
              React.createElement('div',{style:{fontSize:22,fontWeight:900,color:C.navy,marginTop:3}},jobs.filter(j=>j.status===st).length),
              React.createElement('div',{style:{fontSize:10,color:C.txt3}},st)
            )
          )
        ),
        React.createElement('div',{style:s.card},
          React.createElement('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:`1px solid ${C.border}`}},
            React.createElement('span',{style:{fontSize:14,fontWeight:800,color:C.txt}},"עבודות אחרונות"),
            React.createElement('button',{onClick:()=>setPage("jobs"),style:{border:"none",background:"none",color:C.navy,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Heebo,sans-serif"}},"הכל ←")
          ),
          ...jobs.slice(0,6).map(j=>
            React.createElement('div',{key:j.id,style:s.row,onClick:()=>openJob(j)},
              React.createElement('div',{style:{flex:1}},
                React.createElement('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},j.client_name),
                React.createElement('div',{style:{fontSize:11,color:C.txt3,marginTop:1}},j.job_type)
              ),
              React.createElement(Badge,{s:j.status})
            )
          )
        ),
        React.createElement('div',{style:s.card},
          React.createElement('div',{style:{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},"💰 ממתינים לתשלום"),
          ...jobs.filter(j=>j.payment!=="paid").slice(0,5).map(j=>
            React.createElement('div',{key:j.id,style:s.row,onClick:()=>openJob(j)},
              React.createElement('div',{style:{flex:1}},
                React.createElement('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},j.client_name),
                React.createElement('div',{style:{fontSize:10,color:C.txt3,fontFamily:"monospace"}},j.job_number)
              ),
              React.createElement('div',{style:{textAlign:"left"}},
                React.createElement('div',{style:{fontSize:14,fontWeight:800,color:C.navy}},"₪"+(j.price||0).toLocaleString()),
                React.createElement(PBadge,{p:j.payment||"unpaid"})
              )
            )
          ),
          jobs.filter(j=>j.payment!=="paid").length===0 && React.createElement('div',{style:{textAlign:"center",padding:20,color:C.txt3}},"✓ כל התשלומים מסודרים")
        )
      )
    )
  );

  // ── JOBS PAGE ─────────────────────────────────────────────────────────────
  const JobsPage = () => React.createElement('div',{style:{display:"flex",flexDirection:"column",height:"100vh"}},
    React.createElement('div',{style:{...s.hdr,display:"flex",justifyContent:"space-between",alignItems:"center"}},
      React.createElement('div',{style:{fontSize:20,fontWeight:900,color:"#fff"}},"עבודות מדידה"),
      React.createElement('button',{onClick:()=>setShowNew(true),style:{width:38,height:38,borderRadius:12,background:C.copper,border:"none",color:"#fff",fontSize:22,cursor:"pointer"}},"＋")
    ),
    React.createElement('div',{style:{background:"#fff",padding:"9px 13px",borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      React.createElement('input',{value:search,onChange:e=>setSearch(e.target.value),placeholder:"🔍 חיפוש לקוח, מספר עבודה...",style:{...s.inp,padding:"9px 12px"}})
    ),
    React.createElement('div',{style:{display:"flex",gap:7,padding:"9px 13px",overflowX:"auto",background:"#fff",borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      ["הכל","נקבעה מדידה","בשרטוט","בבקרה","מוכן למסירה","הושלם"].map(f=>
        React.createElement('button',{key:f,onClick:()=>setFilter(f),style:{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${filter===f?C.navy:C.border}`,background:filter===f?C.navy:"#fff",color:filter===f?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}},f)
      )
    ),
    React.createElement('div',{style:{flex:1,overflowY:"auto",padding:13,paddingBottom:90}},
      loading ? React.createElement('div',{style:{textAlign:"center",padding:40,color:C.txt3}},"טוען...") :
      filtered.length===0 ? React.createElement('div',{style:{textAlign:"center",padding:40,color:C.txt3}},"לא נמצאו עבודות") :
      React.createElement(React.Fragment,null,
        ...filtered.map(j=>
          React.createElement('div',{key:j.id,style:{...s.card,cursor:"pointer"},onClick:()=>openJob(j)},
            React.createElement('div',{style:{padding:14}},
              React.createElement('div',{style:{display:"flex",justifyContent:"space-between",marginBottom:8,gap:8}},
                React.createElement('div',null,
                  React.createElement('div',{style:{fontSize:14,fontWeight:800,color:C.txt}},j.client_name),
                  React.createElement('div',{style:{fontSize:10,color:C.txt3,fontFamily:"monospace"}},j.job_number)
                ),
                React.createElement(Badge,{s:j.status})
              ),
              React.createElement('div',{style:{fontSize:12,color:C.txt2,marginBottom:3}},"📐 "+j.job_type),
              React.createElement('div',{style:{fontSize:12,color:C.txt3,marginBottom:10}},"📍 "+j.address),
              React.createElement('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
                React.createElement('span',{style:{fontSize:12,color:C.txt2}},"👷 "+(j.assignee||"לא שויך")),
                React.createElement('div',{style:{display:"flex",gap:8,alignItems:"center"}},
                  React.createElement(PBadge,{p:j.payment||"unpaid"}),
                  j.due_date && React.createElement('span',{style:{fontSize:11,color:C.txt3}},"⏱ "+j.due_date)
                )
              )
            )
          )
        )
      )
    )
  );

  // ── AI PAGE ───────────────────────────────────────────────────────────────
  const AIPage = () => React.createElement('div',{style:{paddingBottom:80}},
    React.createElement('div',{style:s.hdr},
      React.createElement('div',{style:{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}},COMPANY.name),
      React.createElement('div',{style:{fontSize:20,fontWeight:900,color:"#fff",marginBottom:14}},"עוזר AI חכם"),
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
        [["summary","📊 סיכום"],["priority","🎯 תיעדוף"],["delays","⚠️ עיכובים"],["quote","📋 הצעת מחיר"],["finance","₪ כספים"]].map(([k,l])=>
          React.createElement('button',{key:k,onClick:()=>runAI(k),style:{background:aiKey===k?"rgba(232,149,109,0.2)":"rgba(255,255,255,0.07)",border:`1px solid ${aiKey===k?"#E8956D":"rgba(255,255,255,0.14)"}`,borderRadius:10,padding:"12px 10px",color:"rgba(255,255,255,0.9)",fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"right"}},l)
        )
      )
    ),
    React.createElement('div',{style:{padding:14}},
      aiLoad && React.createElement('div',{style:{...s.card,padding:18,textAlign:"center",color:C.navy,fontWeight:600}},"⏳ מנתח נתוני המשרד..."),
      aiTxt && !aiLoad && React.createElement('div',{style:s.card},
        React.createElement('div',{style:{padding:18}},
          React.createElement('div',{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}},
            React.createElement('div',{style:{width:34,height:34,borderRadius:10,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.copper}},"AI"),
            React.createElement('div',null,
              React.createElement('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},COMPANY.name+" AI"),
              React.createElement('div',{style:{fontSize:11,color:C.txt3}},"מבוסס "+jobs.length+" עבודות מהענן")
            )
          ),
          ...aiTxt.split("\n").map((line,i)=>
            React.createElement('p',{key:i,style:{fontSize:13,lineHeight:1.7,margin:0,marginBottom:2,textAlign:"right",...(line.startsWith("•")||/^\d/.test(line)?{paddingRight:8,borderRight:`2px solid ${C.copper}`}:{})}},line||"\u00A0")
          )
        )
      ),
      !aiLoad && !aiTxt && React.createElement('div',{style:{textAlign:"center",padding:50,color:C.txt3}},
        React.createElement('div',{style:{fontSize:36,marginBottom:10}},"✦"),
        React.createElement('div',{style:{fontWeight:700}},"בחר פעולה לניתוח חכם"),
        React.createElement('div',{style:{fontSize:12,marginTop:6}},"מחובר ל-"+jobs.length+" עבודות")
      )
    )
  );

  // ── SETTINGS PAGE ─────────────────────────────────────────────────────────
  const SettingsPage = () => React.createElement('div',{style:{paddingBottom:80}},
    React.createElement('div',{style:{...s.hdr,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px 24px"}},
      React.createElement('div',{style:{width:72,height:72,borderRadius:18,background:C.copper,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",marginBottom:13}},"3D"),
      React.createElement('div',{style:{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:1}},COMPANY.name.toUpperCase()),
      React.createElement('div',{style:{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:3}},COMPANY.subtitle),
      React.createElement('div',{style:{marginTop:10,background:"rgba(0,184,107,0.15)",border:"1px solid rgba(0,184,107,0.3)",borderRadius:20,padding:"5px 14px"}},
        React.createElement('span',{style:{fontSize:11,color:"#00B86B",fontWeight:700}},"● מחובר לענן Supabase")
      )
    ),
    React.createElement('div',{style:{padding:14}},
      React.createElement('div',{style:s.card},
        React.createElement('div',{style:{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},"📊 סטטיסטיקות"),
        React.createElement(DRow,{k:"סה״כ עבודות",v:String(jobs.length)}),
        React.createElement(DRow,{k:"פעילות",v:String(jobs.filter(j=>j.status!=="הושלם").length)}),
        React.createElement(DRow,{k:"הושלמו",v:String(jobs.filter(j=>j.status==="הושלם").length)}),
        React.createElement(DRow,{k:"לא שולמו",v:String(jobs.filter(j=>j.payment==="unpaid").length)}),
        React.createElement(DRow,{k:"הכנסות",v:"₪"+paidRev.toLocaleString()})
      ),
      React.createElement('div',{style:s.card},
        React.createElement('div',{style:{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},"🏢 פרטי המשרד"),
        React.createElement(DRow,{k:"שם",v:COMPANY.name}),
        React.createElement(DRow,{k:"בעל חברה",v:COMPANY.owner}),
        React.createElement(DRow,{k:"כתובת",v:COMPANY.address}),
        React.createElement(DRow,{k:"התמחות",v:COMPANY.subtitle})
      ),
      React.createElement('div',{style:s.card},
        React.createElement('div',{style:{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},"👷 צוות"),
        ...TEAM.map(t=>React.createElement(DRow,{key:t,k:t,v:"מהנדס מדידה"}))
      ),
      React.createElement('button',{onClick:load,style:{...s.btn("ghost"),marginTop:4}},"🔄 רענן נתונים")
    )
  );

  // ── NEW JOB ───────────────────────────────────────────────────────────────
  const NewJobOverlay = () => React.createElement('div',{style:s.overlay},
    React.createElement('div',{style:s.hdr},
      React.createElement('div',{style:{display:"flex",alignItems:"center",gap:12}},
        React.createElement('button',{onClick:()=>setShowNew(false),style:{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",fontSize:18,cursor:"pointer"}},"→"),
        React.createElement('div',{style:{fontSize:20,fontWeight:900,color:"#fff"}},"עבודה חדשה")
      )
    ),
    React.createElement('div',{style:{padding:16,paddingBottom:40}},
      React.createElement('div',{style:{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},
        React.createElement('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}},"פרטי לקוח"),
        React.createElement(Inp,{label:"שם לקוח *",value:nj.client_name,onChange:v=>setNj(p=>({...p,client_name:v})),placeholder:"שם מלא"}),
        React.createElement(Inp,{label:"טלפון",value:nj.client_phone,onChange:v=>setNj(p=>({...p,client_phone:v})),placeholder:"05X-XXXXXXX",type:"tel"})
      ),
      React.createElement('div',{style:{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},
        React.createElement('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}},"מיקום"),
        React.createElement(Inp,{label:"כתובת *",value:nj.address,onChange:v=>setNj(p=>({...p,address:v})),placeholder:"רחוב ומספר, עיר"})
      ),
      React.createElement('div',{style:{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},
        React.createElement('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}},"סוג עבודה"),
        React.createElement('div',{style:{display:"flex",flexWrap:"wrap",gap:6}},
          TYPES.map(t=>React.createElement('button',{key:t,onClick:()=>setNj(p=>({...p,job_type:t})),style:{padding:"7px 12px",borderRadius:20,border:`1.5px solid ${nj.job_type===t?C.copper:C.border}`,background:nj.job_type===t?C.copper:"#fff",color:nj.job_type===t?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}},t))
        )
      ),
      React.createElement('div',{style:{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},
        React.createElement('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}},"אחראי עבודה"),
        React.createElement('div',{style:{display:"flex",flexWrap:"wrap",gap:6}},
          TEAM.map(t=>React.createElement('button',{key:t,onClick:()=>setNj(p=>({...p,assignee:t})),style:{padding:"7px 12px",borderRadius:20,border:`1.5px solid ${nj.assignee===t?C.navy:C.border}`,background:nj.assignee===t?C.navy:"#fff",color:nj.assignee===t?"#fff":C.txt2,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}},t))
        )
      ),
      React.createElement('div',{style:{background:"#fff",borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},
        React.createElement('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:13,textAlign:"right"}},"תאריך ומחיר"),
        React.createElement(Inp,{label:"תאריך יעד",value:nj.due_date,onChange:v=>setNj(p=>({...p,due_date:v})),placeholder:"DD/MM/YY"}),
        React.createElement(Inp,{label:"מחיר (₪)",value:nj.price,onChange:v=>setNj(p=>({...p,price:v})),placeholder:"0",type:"number"}),
        React.createElement(Inp,{label:"הערות",value:nj.notes,onChange:v=>setNj(p=>({...p,notes:v})),placeholder:"הערות...",multi:true})
      ),
      React.createElement('button',{onClick:addJob,disabled:saving,style:{...s.btn(),opacity:saving?0.6:1}},saving?"שומר...":"✓ פתח עבודה")
    )
  );

  // ── JOB DETAIL ────────────────────────────────────────────────────────────
  const DetOverlay = () => React.createElement('div',{style:s.overlay},
    React.createElement('div',{style:s.hdr},
      React.createElement('div',{style:{display:"flex",alignItems:"center",gap:12}},
        React.createElement('button',{onClick:()=>setSel(null),style:{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",fontSize:18,cursor:"pointer"}},"→"),
        React.createElement('div',{style:{flex:1}},
          React.createElement('div',{style:{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"monospace"}},sel.job_number),
          React.createElement('div',{style:{fontSize:18,fontWeight:900,color:"#fff"}},sel.client_name)
        ),
        React.createElement(Badge,{s:sel.status})
      )
    ),
    React.createElement('div',{style:{display:"flex",background:"#fff",borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      [["info","פרטים"],["status","סטטוס"],["pay","תשלום"],["notes","הערות"]].map(([k,l])=>
        React.createElement('button',{key:k,onClick:()=>setDetTab(k),style:{flex:1,padding:"11px",textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer",borderBottom:`2.5px solid ${detTab===k?C.copper:"transparent"}`,border:"none",background:"none",color:detTab===k?C.copper:C.txt3,fontFamily:"Heebo,sans-serif"}},l)
      )
    ),
    React.createElement('div',{style:{padding:16,paddingBottom:40}},
      detTab==="info" && React.createElement(React.Fragment,null,
        React.createElement('div',{style:s.card},
          React.createElement(DRow,{k:"📐 סוג",v:sel.job_type}),
          React.createElement(DRow,{k:"📍 כתובת",v:sel.address}),
          React.createElement(DRow,{k:"📅 יעד",v:sel.due_date}),
          React.createElement(DRow,{k:"👷 אחראי",v:sel.assignee}),
          React.createElement(DRow,{k:"📞 טלפון",v:sel.client_phone}),
          React.createElement(DRow,{k:"💰 מחיר",v:"₪"+(sel.price||0).toLocaleString()}),
          React.createElement(DRow,{k:"🗓 נפתח",v:sel.created_at?new Date(sel.created_at).toLocaleDateString("he-IL"):"—"})
        ),
        React.createElement('button',{onClick:delJob,style:{...s.btn("red"),marginTop:8}},"🗑 מחק עבודה")
      ),
      detTab==="status" && React.createElement('div',{style:s.card},
        React.createElement('div',{style:{padding:"12px 16px",fontSize:13,fontWeight:700,color:C.txt2}},"בחר סטטוס חדש:"),
        React.createElement('div',{style:{padding:"0 14px 14px",display:"flex",flexWrap:"wrap",gap:6}},
          STATUSES.map(st=>React.createElement('button',{key:st,onClick:()=>setNewSt(st),style:{padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${newSt===st?C.navy:C.border}`,background:newSt===st?C.navy:"#fff",color:newSt===st?"#fff":C.txt2,fontFamily:"Heebo,sans-serif"}},st))
        ),
        React.createElement('div',{style:{padding:"0 16px 14px"}},
          React.createElement('button',{onClick:saveSt,disabled:saving,style:{...s.btn(),opacity:saving?0.6:1}},saving?"שומר...":"💾 שמור סטטוס")
        )
      ),
      detTab==="pay" && React.createElement('div',{style:{...s.card,padding:16}},
        React.createElement('div',{style:{fontSize:15,fontWeight:800,color:C.txt,marginBottom:14,textAlign:"right"}},"סכום: ₪"+(sel.price||0).toLocaleString()),
        React.createElement('div',{style:{display:"flex",gap:10,marginBottom:13}},
          [["paid","✓ שולם","#166534","#F0FDF4"],["partial","חלקי","#B45309","#FFFBEB"],["unpaid","לא שולם","#991B1B","#FEF2F2"]].map(([v,l,col,bg])=>
            React.createElement('button',{key:v,onClick:()=>setNewPay(v),style:{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${newPay===v?col:C.border}`,background:newPay===v?bg:"#fff",color:newPay===v?col:C.txt3,fontFamily:"Heebo,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}},l)
          )
        ),
        React.createElement('button',{onClick:savePay,disabled:saving,style:{...s.btn(),opacity:saving?0.6:1}},saving?"שומר...":"💾 שמור תשלום")
      ),
      detTab==="notes" && React.createElement('div',{style:{...s.card,padding:16}},
        React.createElement('label',{style:{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:"block",textAlign:"right"}},"הערות"),
        React.createElement('textarea',{value:noteVal,onChange:e=>setNoteVal(e.target.value),placeholder:"הוסף הערות...",style:{...s.inp,height:120,resize:"none"}}),
        React.createElement('button',{onClick:saveNote,disabled:saving,style:{...s.btn("navy"),marginTop:10,opacity:saving?0.6:1}},saving?"שומר...":"💾 שמור הערות")
      )
    )
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return React.createElement('div',{style:s.app},
    React.createElement('style',null,"@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&display=swap');body{margin:0;background:#F4F6FB}"),

    toast && React.createElement('div',{style:{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#FEF2F2":"#F0FDF4",border:`1px solid ${toast.type==="err"?"#FECACA":"#BBF7D0"}`,color:toast.type==="err"?"#991B1B":"#166534",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}},
      (toast.type==="err"?"❌ ":"✓ ")+toast.msg
    ),

    error && React.createElement('div',{style:{margin:16,padding:14,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,color:"#991B1B",fontSize:13,fontWeight:600,textAlign:"right"}},
      "❌ "+error+" ",
      React.createElement('button',{onClick:load,style:{background:"none",border:"none",color:"#1D4ED8",cursor:"pointer",fontWeight:700,fontFamily:"Heebo,sans-serif"}},"נסה שוב")
    ),

    showNew && React.createElement(NewJobOverlay,null),
    sel && !showNew && React.createElement(DetOverlay,null),

    !sel && !showNew && React.createElement(React.Fragment,null,
      React.createElement('div',{style:{overflowY:"auto",height:"100vh",paddingBottom:70}},
        page==="dash" && React.createElement(DashPage,null),
        page==="jobs" && React.createElement(JobsPage,null),
        page==="ai"   && React.createElement(AIPage,null),
        page==="settings" && React.createElement(SettingsPage,null)
      ),
      React.createElement('div',{style:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:`1px solid ${C.border}`,display:"flex",height:65,alignItems:"center",paddingBottom:6,zIndex:40}},
        [["dash","🏠","ראשי"],["jobs","📋","עבודות"],["ai","✦","AI"],["settings","⚙️","הגדרות"]].map(([id,icon,lbl])=>
          React.createElement('button',{key:id,onClick:()=>setPage(id),style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",padding:"8px 0"}},
            React.createElement('span',{style:{fontSize:22,lineHeight:1}},icon),
            React.createElement('span',{style:{fontSize:10,fontWeight:700,fontFamily:"Heebo,sans-serif",color:page===id?C.navy:C.txt3}},lbl),
            page===id && React.createElement('span',{style:{width:4,height:4,borderRadius:"50%",background:C.copper}})
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App, null))
);
