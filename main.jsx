import React from 'react'
import ReactDOM from 'react-dom/client'

const SUPA_URL = "https://mkvlqiksskvqqyquzvy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdmxxaWtzc3NrdnFxeXF1enZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Mzk4MDMsImV4cCI6MjA5NjIxNTgwM30.yVjbECOgBr3Krc8a9qMRsxhDFx8IiyYtZkffr92nzFE";

function App() {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState("dash");

  React.useEffect(() => {
    fetch(`${SUPA_URL}/rest/v1/jobs?order=created_at.desc&limit=100`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()).then(data => { setJobs(data); setLoading(false); });
  }, []);

  const navy = "#1E2B4A", copper = "#E8956D";
  const ST = {"פנייה חדשה":"#6366f1","ממתין לאישור":"#f59e0b","אושר לביצוע":"#10b981","נקבעה מדידה":"#3b82f6","נמדד חלקית":"#f97316","נמדד במלואו":"#10b981","נדרש ביקור נוסף":"#ef4444","בשרטוט":"#8b5cf6","בבקרה":"#06b6d4","מוכן למסירה":"#059669","הושלם":"#6b7280"};

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F4F6FB",flexDirection:"column",gap:12,fontFamily:"Heebo,sans-serif"}}>
      <div style={{fontSize:24,fontWeight:900,color:navy}}>Coordinate 3D</div>
      <div style={{fontSize:14,color:"#8E97B0"}}>טוען עבודות...</div>
    </div>
  );

  return (
    <div style={{fontFamily:"Heebo,sans-serif",direction:"rtl",background:"#F4F6FB",minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:`linear-gradient(135deg,${navy},#2D3B60)`,padding:"20px 18px"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Coordinate 3D</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",marginTop:2}}>לוח בקרה</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
          {[["📋",jobs.filter(j=>j.status!=="הושלם").length,"פעילות"],["📍",jobs.filter(j=>j.status==="נקבעה מדידה").length,"למדידה"],["₪",jobs.filter(j=>j.payment!=="paid").length,"לתשלום"],["✓",jobs.filter(j=>j.status==="הושלם").length,"הושלמו"]].map(([ic,v,l],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:12,textAlign:"center"}}>
              <div style={{fontSize:20}}>{ic}</div>
              <div style={{fontSize:24,fontWeight:900,color:"#fff"}}>{v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E6F0",overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:"1px solid #E2E6F0",fontSize:14,fontWeight:800,color:navy}}>כל העבודות ({jobs.length})</div>
          {jobs.map(j=>(
            <div key={j.id} style={{padding:"12px 16px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1A2035"}}>{j.client_name}</div>
                <div style={{fontSize:11,color:"#8E97B0",marginTop:1}}>{j.job_type} · {j.address}</div>
                <div style={{fontSize:10,color:"#8E97B0",fontFamily:"monospace"}}>{j.job_number}</div>
              </div>
              <span style={{background:ST[j.status]+"22",color:ST[j.status]||"#6b7280",padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{j.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{height:20}}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
