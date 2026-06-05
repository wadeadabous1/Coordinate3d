import React from 'react'
import ReactDOM from 'react-dom/client'

// Use Supabase via CDN to avoid CORS issues
const SUPA_URL = "https://mlabukpafmcfnwzwhcho.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWJ1a3BhZm1jZm53endoY2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzMyMTcsImV4cCI6MjA5NjI0OTIxN30.uFD6I9SYOv9MpnEK7DKB_AkFMZVkuzN8VnmXpeLo0AA";

const HEADERS = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const api = {
  async get(table, params = '') {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: HEADERS });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'PATCH', headers: HEADERS, body: JSON.stringify(body) });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
  async del(table, id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
  }
};

const COMPANY = { name: "Coordinate 3D", sub: "Measurements & Engineering", owner: "איהאב מרעי", address: "דרך בר יהודה, נשר" };
const TEAM = ["איהאב מרעי", "ודיע דעבוס", "ג'ראם אבו סאלח"];
const TYPES = ["מדידה טופוגרפית","תשריט בית משותף","תצ\"ר","ליווי בנייה","מדידת דירה","סריקת לייזר","מדידת רחפן","סימון בשטח","ביקורת ביצוע","פוטוגרמטריה","היתר בנייה","אחר"];
const STATUSES = ["פנייה חדשה","ממתין לאישור","אושר לביצוע","נקבעה מדידה","נמדד חלקית","נמדד במלואו","נדרש ביקור נוסף","בשרטוט","בבקרה","מוכן למסירה","הושלם","בטיפול"];
const ST = { "פנייה חדשה":["#EEF2FF","#4338CA"],"ממתין לאישור":["#FFFBEB","#B45309"],"אושר לביצוע":["#F0FDF4","#166534"],"נקבעה מדידה":["#EFF6FF","#1D4ED8"],"נמדד חלקית":["#FFF7ED","#C2410C"],"נמדד במלואו":["#F0FDF4","#166534"],"נדרש ביקור נוסף":["#FEF2F2","#991B1B"],"בשרטוט":["#FAF5FF","#6D28D9"],"בבקרה":["#ECFEFF","#0E7490"],"מוכן למסירה":["#F0FDF4","#14532D"],"הושלם":["#F9FAFB","#374151"],"בטיפול":["#EFF6FF","#1D4ED8"] };
const PC = { paid:["#F0FDF4","#166534","שולם"], partial:["#FFFBEB","#B45309","חלקי"], unpaid:["#FEF2F2","#991B1B","לא שולם"] };
const C = { navy:"#1E2B4A",navy2:"#2D3B60",copper:"#E8956D",copperD:"#C97040",bg:"#F4F6FB",border:"#E2E6F0",txt:"#1A2035",txt2:"#5A6585",txt3:"#8E97B0",ok:"#00B86B",err:"#E03030" };

const e = React.createElement;
const Badge = ({s}) => { const c=ST[s]||["#F9FAFB","#374151"]; return e('span',{style:{background:c[0],color:c[1],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}},s); };
const PBadge = ({p}) => { const c=PC[p]||PC.unpaid; return e('span',{style:{background:c[0],color:c[1],padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700}},c[2]); };

function App() {
  const [jobs,setJobs]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [saving,setSaving]=React.useState(false);
  const [err,setErr]=React.useState(null);
  const [page,setPage]=React.useState('dash');
  const [filter,setFilter]=React.useState('הכל');
  const [search,setSearch]=React.useState('');
  const [sel,setSel]=React.useState(null);
  const [showNew,setShowNew]=React.useState(false);
  const [tab,setTab]=React.useState('info');
  const [newSt,setNewSt]=React.useState('');
  const [newPay,setNewPay]=React.useState('');
  const [noteVal,setNoteVal]=React.useState('');
  const [toast,setToast]=React.useState(null);
  const [aiKey,setAiKey]=React.useState(null);
  const [aiLoad,setAiLoad]=React.useState(false);
  const [aiTxt,setAiTxt]=React.useState('');
  const [nj,setNj]=React.useState({client_name:'',client_phone:'',address:'',job_type:TYPES[0],due_date:'',price:'',notes:'',assignee:TEAM[0]});

  const showT=(msg,type='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  const load=React.useCallback(async()=>{
    try{setLoading(true);setErr(null);
      const data=await api.get('jobs','order=created_at.desc&limit=200');
      setJobs(data);
    }catch(e){setErr(e.message);}
    finally{setLoading(false);}
  },[]);

  React.useEffect(()=>{load();},[load]);

  const openJob=(j)=>{setSel(j);setTab('info');setNewSt(j.status);setNewPay(j.payment||'unpaid');setNoteVal(j.notes||'');};

  const saveSt=async()=>{setSaving(true);try{await api.patch('jobs',sel.id,{status:newSt});setJobs(js=>js.map(j=>j.id===sel.id?{...j,status:newSt}:j));setSel(s=>({...s,status:newSt}));showT('סטטוס עודכן!');}catch(e){showT(e.message,'err');}finally{setSaving(false);}};
  const savePay=async()=>{setSaving(true);try{await api.patch('jobs',sel.id,{payment:newPay});setJobs(js=>js.map(j=>j.id===sel.id?{...j,payment:newPay}:j));setSel(s=>({...s,payment:newPay}));showT('תשלום עודכן!');}catch(e){showT(e.message,'err');}finally{setSaving(false);}};
  const saveNote=async()=>{setSaving(true);try{await api.patch('jobs',sel.id,{notes:noteVal});setJobs(js=>js.map(j=>j.id===sel.id?{...j,notes:noteVal}:j));showT('הערות נשמרו!');}catch(e){showT(e.message,'err');}finally{setSaving(false);}};
  const delJob=async()=>{if(!window.confirm('למחוק?'))return;setSaving(true);try{await api.del('jobs',sel.id);setJobs(js=>js.filter(j=>j.id!==sel.id));setSel(null);showT('נמחק');}catch(e){showT(e.message,'err');}finally{setSaving(false);}};
  const addJob=async()=>{
    if(!nj.client_name.trim()||!nj.address.trim()){showT('מלא שם לקוח וכתובת','err');return;}
    setSaving(true);
    try{
      const res=await api.post('jobs',{...nj,price:parseInt(nj.price)||0,status:'פנייה חדשה',payment:'unpaid'});
      const created=Array.isArray(res)?res[0]:res;
      setJobs(js=>[created,...js]);
      setShowNew(false);
      setNj({client_name:'',client_phone:'',address:'',job_type:TYPES[0],due_date:'',price:'',notes:'',assignee:TEAM[0]});
      showT('עבודה נפתחה: '+(created.job_number||''));
    }catch(ex){showT(ex.message,'err');}
    finally{setSaving(false);}
  };

  const runAI=async(key)=>{
    setAiKey(key);setAiLoad(true);setAiTxt('');
    await new Promise(r=>setTimeout(r,900));
    const active=jobs.filter(j=>j.status!=='הושלם').length;
    const unpaidN=jobs.filter(j=>j.payment!=='paid').length;
    const paid=jobs.filter(j=>j.payment==='paid').reduce((s,j)=>s+(j.price||0),0);
    const pend=jobs.filter(j=>j.payment!=='paid').reduce((s,j)=>s+(j.price||0),0);
    const texts={
      summary:`סיכום נוכחי:\n\n• ${jobs.length} עבודות במערכת\n• ${active} עבודות פעילות\n• ${jobs.filter(j=>j.status==='בשרטוט').length} בשרטוט\n• ${unpaidN} ממתינות לגבייה\n\nהמלצה: עדיפות לעבודות הקרובות לתאריך יעד.`,
      priority:`סדר עדיפויות:\n\n${jobs.filter(j=>j.status!=='הושלם').slice(0,5).map((j,i)=>`${i+1}. ${j.job_number||''} – ${j.client_name} (${j.status})`).join('\n')}\n\nבדוק תאריכי יעד קרובים.`,
      delays:`עיכובים אפשריים:\n\n${jobs.filter(j=>['בשרטוט','בבקרה','נמדד חלקית','נדרש ביקור נוסף'].includes(j.status)).map(j=>`• ${j.job_number||''} – ${j.client_name}: ${j.status}`).join('\n')||'לא זוהו עיכובים'}\n\nבדוק תאריכי יעד.`,
      quote:`נוסח הצעת מחיר:\n\nלכבוד [שם הלקוח],\n\nלהלן הצעת מחיר עבור [סוג עבודה]:\n• מדידת שטח: ₪X\n• עיבוד ושרטוט: ₪Y\n• DWG + PDF: כלול\n\nסה"כ + מע"מ (18%)\nתוקף: 30 יום\n\n${COMPANY.name} | ${COMPANY.owner}`,
      finance:`מצב פיננסי:\n\n• שולם: ₪${paid.toLocaleString()}\n• לגבייה: ₪${pend.toLocaleString()}\n• ${unpaidN} עבודות לא שולמו\n\n${pend>0?'פנה ללקוחות עם חוב פתוח.':'מצב גבייה תקין!'}`,
    };
    setAiTxt(texts[key]||'');setAiLoad(false);
  };

  const filtered=jobs.filter(j=>{
    const mf=filter==='הכל'||j.status===filter;
    const ms=!search||(j.client_name||'').includes(search)||(j.job_number||'').includes(search)||(j.address||'').includes(search);
    return mf&&ms;
  });
  const paidRev=jobs.filter(j=>j.payment==='paid').reduce((s,j)=>s+(j.price||0),0);
  const pendRev=jobs.filter(j=>j.payment!=='paid').reduce((s,j)=>s+(j.price||0),0);

  const hdr=(title,right)=>e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'16px 18px 18px',flexShrink:0}},
    e('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
      e('div',null,
        e('div',{style:{fontSize:10,color:'rgba(255,255,255,0.45)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:2}},COMPANY.name),
        e('div',{style:{fontSize:20,fontWeight:900,color:'#fff'}},title)
      ),
      right
    )
  );

  const card=(children,style={},onClick)=>e('div',{onClick,style:{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,boxShadow:'0 2px 10px rgba(30,43,74,0.07)',overflow:'hidden',marginBottom:12,...style,cursor:onClick?'pointer':'default'}},children);
  const btn=(label,onClick,v='copper',dis=false)=>e('button',{onClick,disabled:dis,style:{display:'flex',alignItems:'center',justifyContent:'center',border:'none',borderRadius:12,padding:'13px',fontFamily:'Heebo,sans-serif',fontSize:15,fontWeight:700,cursor:dis?'not-allowed':'pointer',width:'100%',opacity:dis?0.6:1,background:v==='copper'?`linear-gradient(135deg,${C.copperD},${C.copper})`:v==='navy'?`linear-gradient(135deg,${C.navy},${C.navy2})`:v==='red'?'#FEF2F2':'#fff',color:v==='red'?'#991B1B':v==='ghost'?C.navy:'#fff',border:v==='ghost'?`1.5px solid ${C.border}`:v==='red'?'1.5px solid #FECACA':'none'}},label);
  const inp=(value,onChange,placeholder='',type='text',multi=false)=>multi?e('textarea',{value,onChange:ev=>onChange(ev.target.value),placeholder,style:{width:'100%',padding:'10px 12px',border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:'Heebo,sans-serif',fontSize:14,color:C.txt,background:'#fff',outline:'none',textAlign:'right',boxSizing:'border-box',resize:'none',height:80}}):e('input',{type,value,onChange:ev=>onChange(ev.target.value),placeholder,style:{width:'100%',padding:'10px 12px',border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:'Heebo,sans-serif',fontSize:14,color:C.txt,background:'#fff',outline:'none',textAlign:'right',boxSizing:'border-box'}});
  const igrp=(label,value,onChange,placeholder='',type='text',multi=false)=>e('div',{style:{marginBottom:13}},label&&e('label',{style:{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:'block',textAlign:'right'}},label),inp(value,onChange,placeholder,type,multi));
  const drow=(k,v)=>e('div',{style:{display:'flex',padding:'10px 16px',borderBottom:`1px solid ${C.border}`}},e('div',{style:{width:110,fontSize:12,color:C.txt3,fontWeight:700,flexShrink:0}},k),e('div',{style:{flex:1,fontSize:13,color:C.txt,fontWeight:600}},v||'—'));
  const sbox=(title,children)=>e('div',{style:{background:'#fff',borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:12}},e('div',{style:{fontSize:11,fontWeight:800,color:C.txt3,letterSpacing:1.5,textTransform:'uppercase',marginBottom:13,textAlign:'right'}},title),children);

  const overlay=e('div',{style:{position:'fixed',inset:0,background:C.bg,zIndex:50,display:'flex',flexDirection:'column',overflowY:'auto',maxWidth:480,margin:'0 auto'}});

  // DASH
  const DashPage=()=>e('div',{style:{paddingBottom:80}},
    hdr('לוח בקרה',null),
    e('div',{style:{padding:'0 16px 0',background:`linear-gradient(135deg,${C.navy},${C.navy2})`}},
      e('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,paddingBottom:18}},
        [['📋',jobs.filter(j=>j.status!=='הושלם').length,'פעילות'],['📍',jobs.filter(j=>j.status==='נקבעה מדידה').length,'למדידה'],['₪',jobs.filter(j=>j.payment!=='paid').length,'לתשלום'],['✓',jobs.filter(j=>j.status==='הושלם').length,'הושלמו']].map(([ic,v,l],i)=>
          e('div',{key:i,style:{background:'rgba(255,255,255,0.1)',borderRadius:13,padding:13,border:'1px solid rgba(255,255,255,0.08)'}},
            e('div',{style:{fontSize:20,marginBottom:5}},ic),
            e('div',{style:{fontSize:26,fontWeight:900,color:'#fff'}},v),
            e('div',{style:{fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:1}},l)
          )
        )
      )
    ),
    e('div',{style:{padding:14}},
      loading?e('div',{style:{textAlign:'center',padding:40,color:C.txt3,fontWeight:600}},'טוען...'):
      e(React.Fragment,null,
        card(e('div',{style:{display:'flex',padding:15,gap:10}},
          e('div',{style:{flex:1,textAlign:'center'}},e('div',{style:{fontSize:19,fontWeight:900,color:C.ok}},'₪'+Math.round(paidRev/1000)+'K'),e('div',{style:{fontSize:10,color:C.txt3,marginTop:2}},'שולם')),
          e('div',{style:{width:1,background:C.border}}),
          e('div',{style:{flex:1,textAlign:'center'}},e('div',{style:{fontSize:19,fontWeight:900,color:C.err}},'₪'+Math.round(pendRev/1000)+'K'),e('div',{style:{fontSize:10,color:C.txt3,marginTop:2}},'לגבייה'))
        )),
        btn('＋ פתח עבודה חדשה',()=>setShowNew(true),'copper',false),
        e('div',{style:{height:12}}),
        e('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}},
          [['✏️','בשרטוט'],['📦','מוכן למסירה']].map(([ic,st])=>
            card(e(React.Fragment,null,e('div',{style:{fontSize:20}},ic),e('div',{style:{fontSize:22,fontWeight:900,color:C.navy,marginTop:3}},jobs.filter(j=>j.status===st).length),e('div',{style:{fontSize:10,color:C.txt3}},st)),{padding:15,textAlign:'center',marginBottom:0},()=>{setPage('jobs');setFilter(st);})
          )
        ),
        card(e(React.Fragment,null,
          e('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 16px',borderBottom:`1px solid ${C.border}`}},
            e('span',{style:{fontSize:14,fontWeight:800,color:C.txt}},'עבודות אחרונות'),
            e('button',{onClick:()=>setPage('jobs'),style:{border:'none',background:'none',color:C.navy,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'Heebo,sans-serif'}},'הכל ←')
          ),
          ...jobs.slice(0,6).map(j=>e('div',{key:j.id,style:{display:'flex',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${C.border}`,cursor:'pointer',gap:10},onClick:()=>openJob(j)},e('div',{style:{flex:1}},e('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},j.client_name),e('div',{style:{fontSize:11,color:C.txt3,marginTop:1}},j.job_type)),e(Badge,{s:j.status}))),
          jobs.length===0&&e('div',{style:{textAlign:'center',padding:20,color:C.txt3}},'אין עבודות עדיין')
        )),
        card(e(React.Fragment,null,
          e('div',{style:{padding:'13px 16px',borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},'💰 ממתינים לתשלום'),
          ...jobs.filter(j=>j.payment!=='paid').slice(0,5).map(j=>e('div',{key:j.id,style:{display:'flex',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${C.border}`,cursor:'pointer',gap:10},onClick:()=>openJob(j)},
            e('div',{style:{flex:1}},e('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},j.client_name),e('div',{style:{fontSize:10,color:C.txt3,fontFamily:'monospace'}},j.job_number)),
            e('div',{style:{textAlign:'left'}},e('div',{style:{fontSize:14,fontWeight:800,color:C.navy}},'₪'+(j.price||0).toLocaleString()),e(PBadge,{p:j.payment||'unpaid'}))
          )),
          jobs.filter(j=>j.payment!=='paid').length===0&&e('div',{style:{textAlign:'center',padding:20,color:C.txt3}},'✓ כל התשלומים מסודרים')
        ))
      )
    )
  );

  // JOBS
  const JobsPage=()=>e('div',{style:{display:'flex',flexDirection:'column',height:'100vh'}},
    e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'16px 18px',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center'}},
      e('div',{style:{fontSize:20,fontWeight:900,color:'#fff'}},'עבודות מדידה'),
      e('button',{onClick:()=>setShowNew(true),style:{width:38,height:38,borderRadius:12,background:C.copper,border:'none',color:'#fff',fontSize:22,cursor:'pointer'}},'＋')
    ),
    e('div',{style:{background:'#fff',padding:'9px 13px',borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      e('input',{value:search,onChange:ev=>setSearch(ev.target.value),placeholder:'🔍 חיפוש לקוח, מספר עבודה...',style:{width:'100%',padding:'9px 12px',border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:'Heebo,sans-serif',fontSize:14,color:C.txt,background:'#fff',outline:'none',textAlign:'right',boxSizing:'border-box'}})
    ),
    e('div',{style:{display:'flex',gap:7,padding:'9px 13px',overflowX:'auto',background:'#fff',borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      ['הכל','נקבעה מדידה','בשרטוט','בבקרה','מוכן למסירה','הושלם'].map(f=>
        e('button',{key:f,onClick:()=>setFilter(f),style:{padding:'5px 13px',borderRadius:20,border:`1.5px solid ${filter===f?C.navy:C.border}`,background:filter===f?C.navy:'#fff',color:filter===f?'#fff':C.txt2,fontFamily:'Heebo,sans-serif',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}},f)
      )
    ),
    e('div',{style:{flex:1,overflowY:'auto',padding:13,paddingBottom:90}},
      loading?e('div',{style:{textAlign:'center',padding:40,color:C.txt3}},'טוען...'):
      filtered.length===0?e('div',{style:{textAlign:'center',padding:40,color:C.txt3}},'לא נמצאו עבודות'):
      e(React.Fragment,null,...filtered.map(j=>
        card(e('div',{style:{padding:14}},
          e('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:8,gap:8}},
            e('div',null,e('div',{style:{fontSize:14,fontWeight:800,color:C.txt}},j.client_name),e('div',{style:{fontSize:10,color:C.txt3,fontFamily:'monospace'}},j.job_number)),
            e(Badge,{s:j.status})
          ),
          e('div',{style:{fontSize:12,color:C.txt2,marginBottom:3}},'📐 '+j.job_type),
          e('div',{style:{fontSize:12,color:C.txt3,marginBottom:10}},'📍 '+j.address),
          e('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
            e('span',{style:{fontSize:12,color:C.txt2}},'👷 '+(j.assignee||'לא שויך')),
            e('div',{style:{display:'flex',gap:8,alignItems:'center'}},e(PBadge,{p:j.payment||'unpaid'}),j.due_date&&e('span',{style:{fontSize:11,color:C.txt3}},'⏱ '+j.due_date))
          )
        ),{cursor:'pointer'},()=>openJob(j))
      ))
    )
  );

  // AI
  const AIPage=()=>e('div',{style:{paddingBottom:80}},
    e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'16px 18px 18px'}},
      e('div',{style:{fontSize:10,color:'rgba(255,255,255,0.45)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:2}},COMPANY.name),
      e('div',{style:{fontSize:20,fontWeight:900,color:'#fff',marginBottom:14}},'עוזר AI חכם'),
      e('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
        [['summary','📊 סיכום'],['priority','🎯 תיעדוף'],['delays','⚠️ עיכובים'],['quote','📋 הצעת מחיר'],['finance','₪ כספים']].map(([k,l])=>
          e('button',{key:k,onClick:()=>runAI(k),style:{background:aiKey===k?'rgba(232,149,109,0.2)':'rgba(255,255,255,0.07)',border:`1px solid ${aiKey===k?'#E8956D':'rgba(255,255,255,0.14)'}`,borderRadius:10,padding:'12px 10px',color:'rgba(255,255,255,0.9)',fontFamily:'Heebo,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',textAlign:'right'}},l)
        )
      )
    ),
    e('div',{style:{padding:14}},
      aiLoad&&card(e('div',{style:{padding:18,textAlign:'center',color:C.navy,fontWeight:600}},'⏳ מנתח נתוני המשרד...')),
      aiTxt&&!aiLoad&&card(e('div',{style:{padding:18}},
        e('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}},
          e('div',{style:{width:34,height:34,borderRadius:10,background:C.navy,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:C.copper}},'AI'),
          e('div',null,e('div',{style:{fontSize:13,fontWeight:700,color:C.txt}},COMPANY.name+' AI'),e('div',{style:{fontSize:11,color:C.txt3}},'מבוסס '+jobs.length+' עבודות'))
        ),
        ...aiTxt.split('\n').map((line,i)=>e('p',{key:i,style:{fontSize:13,lineHeight:1.7,margin:0,marginBottom:2,textAlign:'right',...(line.startsWith('•')||/^\d/.test(line)?{paddingRight:8,borderRight:`2px solid ${C.copper}`}:{})}},line||'\u00A0'))
      )),
      !aiLoad&&!aiTxt&&e('div',{style:{textAlign:'center',padding:50,color:C.txt3}},e('div',{style:{fontSize:36,marginBottom:10}},'✦'),e('div',{style:{fontWeight:700}},'בחר פעולה לניתוח חכם'))
    )
  );

  // SETTINGS
  const SettingsPage=()=>e('div',{style:{paddingBottom:80}},
    e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'28px 20px 24px',display:'flex',flexDirection:'column',alignItems:'center'}},
      e('div',{style:{width:72,height:72,borderRadius:18,background:C.copper,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:900,color:'#fff',marginBottom:13}},'3D'),
      e('div',{style:{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:1}},COMPANY.name.toUpperCase()),
      e('div',{style:{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:3}},COMPANY.sub),
      e('div',{style:{marginTop:10,background:'rgba(0,184,107,0.15)',border:'1px solid rgba(0,184,107,0.3)',borderRadius:20,padding:'5px 14px'}},e('span',{style:{fontSize:11,color:'#00B86B',fontWeight:700}},'● מחובר לענן'))
    ),
    e('div',{style:{padding:14}},
      card(e(React.Fragment,null,e('div',{style:{padding:'13px 16px',borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},'📊 סטטיסטיקות'),drow('סה״כ עבודות',String(jobs.length)),drow('פעילות',String(jobs.filter(j=>j.status!=='הושלם').length)),drow('הושלמו',String(jobs.filter(j=>j.status==='הושלם').length)),drow('לא שולמו',String(jobs.filter(j=>j.payment==='unpaid').length)),drow('הכנסות','₪'+paidRev.toLocaleString()))),
      card(e(React.Fragment,null,e('div',{style:{padding:'13px 16px',borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},'🏢 פרטי המשרד'),drow('שם',COMPANY.name),drow('בעל חברה',COMPANY.owner),drow('כתובת',COMPANY.address),drow('התמחות',COMPANY.sub))),
      card(e(React.Fragment,null,e('div',{style:{padding:'13px 16px',borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.txt}},'👷 צוות'),...TEAM.map(t=>drow(t,'מהנדס מדידה')))),
      btn('🔄 רענן נתונים',load,'ghost')
    )
  );

  // NEW JOB
  const NewJobOverlay=()=>e('div',{style:{position:'fixed',inset:0,background:C.bg,zIndex:50,display:'flex',flexDirection:'column',overflowY:'auto',maxWidth:480,margin:'0 auto'}},
    e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'16px 18px',flexShrink:0}},
      e('div',{style:{display:'flex',alignItems:'center',gap:12}},
        e('button',{onClick:()=>setShowNew(false),style:{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.12)',border:'none',color:'#fff',fontSize:18,cursor:'pointer'}},'→'),
        e('div',{style:{fontSize:20,fontWeight:900,color:'#fff'}},'עבודה חדשה')
      )
    ),
    e('div',{style:{padding:16,paddingBottom:40}},
      sbox('פרטי לקוח',e(React.Fragment,null,igrp('שם לקוח *',nj.client_name,v=>setNj(p=>({...p,client_name:v})),'שם מלא'),igrp('טלפון',nj.client_phone,v=>setNj(p=>({...p,client_phone:v})),'05X-XXXXXXX','tel'))),
      sbox('מיקום',igrp('כתובת *',nj.address,v=>setNj(p=>({...p,address:v})),'רחוב ומספר, עיר')),
      sbox('סוג עבודה',e('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},TYPES.map(t=>e('button',{key:t,onClick:()=>setNj(p=>({...p,job_type:t})),style:{padding:'7px 12px',borderRadius:20,border:`1.5px solid ${nj.job_type===t?C.copper:C.border}`,background:nj.job_type===t?C.copper:'#fff',color:nj.job_type===t?'#fff':C.txt2,fontFamily:'Heebo,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}},t)))),
      sbox('אחראי',e('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},TEAM.map(t=>e('button',{key:t,onClick:()=>setNj(p=>({...p,assignee:t})),style:{padding:'7px 12px',borderRadius:20,border:`1.5px solid ${nj.assignee===t?C.navy:C.border}`,background:nj.assignee===t?C.navy:'#fff',color:nj.assignee===t?'#fff':C.txt2,fontFamily:'Heebo,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}},t)))),
      sbox('תאריך ומחיר',e(React.Fragment,null,igrp('תאריך יעד',nj.due_date,v=>setNj(p=>({...p,due_date:v})),'DD/MM/YY'),igrp('מחיר (₪)',nj.price,v=>setNj(p=>({...p,price:v})),'0','number'),igrp('הערות',nj.notes,v=>setNj(p=>({...p,notes:v})),'הערות...',undefined,true))),
      btn(saving?'שומר...':'✓ פתח עבודה',addJob,'copper',saving)
    )
  );

  // JOB DETAIL
  const DetOverlay=()=>e('div',{style:{position:'fixed',inset:0,background:C.bg,zIndex:50,display:'flex',flexDirection:'column',overflowY:'auto',maxWidth:480,margin:'0 auto'}},
    e('div',{style:{background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:'16px 18px',flexShrink:0}},
      e('div',{style:{display:'flex',alignItems:'center',gap:12}},
        e('button',{onClick:()=>setSel(null),style:{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.12)',border:'none',color:'#fff',fontSize:18,cursor:'pointer'}},'→'),
        e('div',{style:{flex:1}},e('div',{style:{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace'}},sel.job_number),e('div',{style:{fontSize:18,fontWeight:900,color:'#fff'}},sel.client_name)),
        e(Badge,{s:sel.status})
      )
    ),
    e('div',{style:{display:'flex',background:'#fff',borderBottom:`1px solid ${C.border}`,flexShrink:0}},
      [['info','פרטים'],['status','סטטוס'],['pay','תשלום'],['notes','הערות']].map(([k,l])=>
        e('button',{key:k,onClick:()=>setTab(k),style:{flex:1,padding:'11px',textAlign:'center',fontSize:12,fontWeight:700,cursor:'pointer',borderBottom:`2.5px solid ${tab===k?C.copper:'transparent'}`,border:'none',background:'none',color:tab===k?C.copper:C.txt3,fontFamily:'Heebo,sans-serif'}},l)
      )
    ),
    e('div',{style:{padding:16,paddingBottom:40}},
      tab==='info'&&e(React.Fragment,null,
        card(e(React.Fragment,null,drow('📐 סוג',sel.job_type),drow('📍 כתובת',sel.address),drow('📅 יעד',sel.due_date),drow('👷 אחראי',sel.assignee),drow('📞 טלפון',sel.client_phone),drow('💰 מחיר','₪'+(sel.price||0).toLocaleString()),drow('🗓 נפתח',sel.created_at?new Date(sel.created_at).toLocaleDateString('he-IL'):'—'))),
        e('div',{style:{marginTop:8}},btn('🗑 מחק עבודה',delJob,'red'))
      ),
      tab==='status'&&card(e(React.Fragment,null,
        e('div',{style:{padding:'12px 16px',fontSize:13,fontWeight:700,color:C.txt2}},'בחר סטטוס חדש:'),
        e('div',{style:{padding:'0 14px 14px',display:'flex',flexWrap:'wrap',gap:6}},STATUSES.map(s=>e('button',{key:s,onClick:()=>setNewSt(s),style:{padding:'6px 12px',borderRadius:20,fontSize:11,fontWeight:700,cursor:'pointer',border:`1.5px solid ${newSt===s?C.navy:C.border}`,background:newSt===s?C.navy:'#fff',color:newSt===s?'#fff':C.txt2,fontFamily:'Heebo,sans-serif'}},s))),
        e('div',{style:{padding:'0 16px 14px'}},btn(saving?'שומר...':'💾 שמור סטטוס',saveSt,'copper',saving))
      )),
      tab==='pay'&&card(e('div',{style:{padding:16}},
        e('div',{style:{fontSize:15,fontWeight:800,color:C.txt,marginBottom:14,textAlign:'right'}},'סכום: ₪'+(sel.price||0).toLocaleString()),
        e('div',{style:{display:'flex',gap:10,marginBottom:13}},
          [['paid','✓ שולם','#166534','#F0FDF4'],['partial','חלקי','#B45309','#FFFBEB'],['unpaid','לא שולם','#991B1B','#FEF2F2']].map(([v,l,col,bg])=>e('button',{key:v,onClick:()=>setNewPay(v),style:{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${newPay===v?col:C.border}`,background:newPay===v?bg:'#fff',color:newPay===v?col:C.txt3,fontFamily:'Heebo,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}},l))
        ),
        btn(saving?'שומר...':'💾 שמור תשלום',savePay,'copper',saving)
      ),{},null),
      tab==='notes'&&card(e('div',{style:{padding:16}},
        e('label',{style:{fontSize:12,fontWeight:700,color:C.txt2,marginBottom:5,display:'block',textAlign:'right'}},'הערות'),
        e('textarea',{value:noteVal,onChange:ev=>setNoteVal(ev.target.value),placeholder:'הוסף הערות...',style:{width:'100%',padding:'10px 12px',border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:'Heebo,sans-serif',fontSize:14,color:C.txt,background:'#fff',outline:'none',textAlign:'right',boxSizing:'border-box',resize:'none',height:120}}),
        e('div',{style:{marginTop:10}},btn(saving?'שומר...':'💾 שמור הערות',saveNote,'navy',saving))
      ),{},null)
    )
  );

  return e('div',{style:{fontFamily:'Heebo,sans-serif',direction:'rtl',background:C.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',position:'relative'}},
    e('style',null,"@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&display=swap');body{margin:0;background:#F4F6FB}"),
    toast&&e('div',{style:{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:toast.type==='err'?'#FEF2F2':'#F0FDF4',border:`1px solid ${toast.type==='err'?'#FECACA':'#BBF7D0'}`,color:toast.type==='err'?'#991B1B':'#166534',padding:'10px 20px',borderRadius:12,fontSize:13,fontWeight:700,zIndex:999,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}},( toast.type==='err'?'❌ ':'✓ ')+toast.msg),
    err&&e('div',{style:{margin:16,padding:14,background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:12,color:'#991B1B',fontSize:13,fontWeight:600,textAlign:'right'}},'❌ '+err+' ',e('button',{onClick:load,style:{background:'none',border:'none',color:'#1D4ED8',cursor:'pointer',fontWeight:700,fontFamily:'Heebo,sans-serif'}},'נסה שוב')),
    showNew&&e(NewJobOverlay,null),
    sel&&!showNew&&e(DetOverlay,null),
    !sel&&!showNew&&e(React.Fragment,null,
      e('div',{style:{overflowY:'auto',height:'100vh',paddingBottom:70}},
        page==='dash'&&e(DashPage,null),
        page==='jobs'&&e(JobsPage,null),
        page==='ai'&&e(AIPage,null),
        page==='settings'&&e(SettingsPage,null)
      ),
      e('div',{style:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'#fff',borderTop:`1px solid ${C.border}`,display:'flex',height:65,alignItems:'center',paddingBottom:6,zIndex:40}},
        [['dash','🏠','ראשי'],['jobs','📋','עבודות'],['ai','✦','AI'],['settings','⚙️','הגדרות']].map(([id,icon,lbl])=>
          e('button',{key:id,onClick:()=>setPage(id),style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,border:'none',background:'transparent',cursor:'pointer',padding:'8px 0'}},
            e('span',{style:{fontSize:22,lineHeight:1}},icon),
            e('span',{style:{fontSize:10,fontWeight:700,fontFamily:'Heebo,sans-serif',color:page===id?C.navy:C.txt3}},lbl),
            page===id&&e('span',{style:{width:4,height:4,borderRadius:'50%',background:C.copper}})
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(React.StrictMode,null,e(App,null)));
