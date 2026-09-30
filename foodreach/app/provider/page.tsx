'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {Resource} from '@/lib/planner';

export default function ProviderDemo(){
 const [resources,setResources]=useState<Resource[]>([]),[id,setId]=useState('manna'),[note,setNote]=useState(''),[saved,setSaved]=useState('');
 useEffect(()=>{fetch('/data/resources.json').then(r=>r.json()).then(setResources)},[]);
 function update(status:string){const current=JSON.parse(localStorage.getItem('foodreach-provider-status')||'{}');current[id]={status,note:note.trim(),updated:new Date().toISOString(),demo:true};localStorage.setItem('foodreach-provider-status',JSON.stringify(current));window.dispatchEvent(new Event('foodreach:provider-status'));setSaved(`${status} saved locally at ${new Date().toLocaleTimeString()}.`)}
 return <main className="directory-shell"><Link href="/">← Back to trip planner</Link><div className="eyebrow">SIMULATED STAFF WORKFLOW</div><h1>Provider status update</h1><p>This hackathon demo stores updates only in this browser. It does not publish or represent a real provider statement. A production version would require authenticated provider accounts and an audit log.</p><section className="provider-form"><label htmlFor="provider">Resource</label><select id="provider" value={id} onChange={e=>setId(e.target.value)}>{resources.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><label htmlFor="note">Optional resident-facing note</label><textarea id="note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Example: Distribution ends at 3 PM today."/><div className="status-actions"><button onClick={()=>update('Open as scheduled')}>Open as scheduled</button><button onClick={()=>update('Limited availability')}>Limited availability</button><button className="cancel" onClick={()=>update('Canceled')}>Canceled today</button><button onClick={()=>update('Unknown')}>Reset to unknown</button></div>{saved&&<p role="status"><strong>{saved}</strong> Return to the planner to see the effect.</p>}</section></main>
}
