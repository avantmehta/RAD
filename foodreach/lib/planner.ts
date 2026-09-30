export type Resource={id:string;name:string;town:string;address:string;phone:string;schedule:string;windows:{day:number;nth?:number[];open:string;close:string}[];source:string;secondarySource?:string;notes:string;residency:string|null;appointment:boolean;conflict:boolean;checked:string;lat:number;lon:number;foodTypes?:string[];idRequired?:boolean|null;languages?:string[];wheelchairAccessible?:boolean|null;freshFood?:boolean|null;attributeNote?:string};
export type Origin={id:string;name:string;address:string;lat:number;lon:number};
export type Mode='bus'|'walking'|'car';
export type WindowKind='custom'|'now'|'afternoon'|'evening'|'tomorrow';
export type TimeWindow={kind:WindowKind;date:string;leave:string;back:string};
export type Options={origin:string;modes:Mode[];windows:TimeWindow[];walk:number;residency:string;pickup:number};
export type Transit={calendar:Record<string,string>[];exceptions:Record<string,string>[];pairs:Record<string,any[][]>;source:string;method:string};
export const mins=(t:string)=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
export const clock=(m:number)=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
export function km(a:Origin,b:Origin|Resource){let r=Math.PI/180,p=a.lat*r,q=b.lat*r;return 6371*2*Math.asin(Math.min(1,Math.sqrt(Math.sin((q-p)/2)**2+Math.cos(p)*Math.cos(q)*Math.sin((b.lon-a.lon)*r/2)**2)))}
export function windows(r:Resource,date:string){const d=new Date(date+'T12:00:00Z');return r.windows.filter(w=>w.day===d.getUTCDay()&&(!w.nth||w.nth.includes(Math.ceil(d.getUTCDate()/7))))}
export function services(t:Transit,date:string){let raw=date.replaceAll('-',''),day=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date(date+'T12:00:00Z').getUTCDay()];let active=new Set(t.calendar.filter(c=>c.start_date<=raw&&c.end_date>=raw&&c[day]==='1').map(c=>c.service_id));for(const e of t.exceptions.filter(e=>e.date===raw)){if(e.exception_type==='1')active.add(e.service_id);else active.delete(e.service_id)}return active}
type Leg={arrival:number;departure:number;walk:number;description:string;route?:string};
export type Result={resource:Resource;status:'candidate'|'check'|'excluded';reasons:string[];out?:Leg;inbound?:Leg;start?:number;finish?:number;total?:number;slack?:number;walking?:number;distance:number;confidence:string;date?:string};
function legs(a:Origin|Resource,b:Origin|Resource,at:number,mode:Mode,t:Transit,active:Set<string>):Leg[]{
 if(mode==='bus')return (t.pairs[a.id+'>'+b.id]||[]).filter(v=>active.has(v[4])&&v[0]>=at+v[2]+3).map(v=>({departure:v[0]-v[2]-3,arrival:v[1]+v[3],walk:v[2]+v[3],route:v[5],description:`Walk ~${v[2]} min to ${v[6]}; allow 3 min boarding buffer; bus ${v[5]} at ${clock(v[0])}; alight ${v[7]} at ${clock(v[1])}; walk ~${v[3]} min.`})).sort((x,y)=>x.arrival-y.arrival);
 const distance=km(a as Origin,b),duration=mode==='walking'?Math.ceil(distance*1.35/0.07):Math.ceil(distance*1.4/0.4)+8;
 return [{departure:at,arrival:at+duration,walk:mode==='walking'?duration:4,description:mode==='walking'?`~${duration} min walking estimate; pedestrian route not verified.`:`~${duration} min driving estimate including parking; traffic not included.`}]
}
export function plan(resources:Resource[],origins:Origin[],t:Transit,o:Options):Result[]{
 const origin=origins.find(x=>x.id===o.origin);if(!origin)return [];
 const activeByDate=new Map<string,Set<string>>();
 const activeFor=(date:string)=>{let s=activeByDate.get(date);if(!s){s=services(t,date);activeByDate.set(date,s)}return s};
 return resources.map(r=>{
 let reasons:string[]=[];let confidence=r.conflict?'Conflicting published hours':r.appointment?'Appointment required':r.source.endsWith('.pdf')?'Directory schedule — call first':'Published schedule';
 if(r.residency&&o.residency!=='Unknown'&&r.residency!==o.residency)reasons.push(`Published eligibility is limited to ${r.residency} residents.`);
 const result:Result={resource:r,status:'excluded',reasons,distance:km(origin,r),confidence};if(reasons.length)return result;
 let best:any=null,overwalk=false,late=false,sawWindow=false,noBus=false;
 for(const tw of o.windows){
  const w=windows(r,tw.date);if(!w.length)continue;sawWindow=true;
  const active=activeFor(tw.date);
  const outbound=o.modes.flatMap(m=>legs(origin,r,mins(tw.leave),m,t,active));
  if(o.modes.length===1&&o.modes[0]==='bus'&&!outbound.length)noBus=true;
  for(const out of outbound){for(const win of w){const start=Math.max(out.arrival,mins(win.open)),finish=start+o.pickup;if(finish>mins(win.close))continue;for(const inbound of o.modes.flatMap(m=>legs(r,origin,finish,m,t,active))){const walking=out.walk+inbound.walk;if(walking>o.walk){overwalk=true;continue}if(inbound.arrival>mins(tw.back)){late=true;continue}const total=inbound.arrival-mins(tw.leave);if(!best||total<best.total)best={out,inbound,start,finish,total,walking,slack:mins(tw.back)-inbound.arrival,date:tw.date};break}}}
 }
 if(!best){result.reasons.push(!sawWindow?(r.windows.length?`No published distribution window ${o.windows.length>1?'on the days you selected':'on this date'}.`:'Pickup hours are unconfirmed; call the resource.'):overwalk?'Available round trips exceed your total walking limit.':late?'Available return journeys miss your deadline.':noBus?'No supported direct-bus round trip fits the distribution window. Transfer journeys are not searched.':'Estimated travel and pickup do not fit the opening window.');return result}
 Object.assign(result,best);result.status=r.appointment||!!r.residency||r.conflict?'check':'candidate';if(r.appointment)result.reasons.push('Arrange the required appointment before travel.');if(r.residency)result.reasons.push('Registration and eligibility still need confirmation.');if(r.conflict)result.reasons.push('Official pages disagree; the earlier morning cutoff is used.');return result;
 }).sort((a,b)=>Number(a.status==='excluded')-Number(b.status==='excluded')||(a.total??99999)-(b.total??99999));
}
export function alternatives(resources:Resource[],origins:Origin[],t:Transit,o:Options){
 const base=o.windows[0];const changes:TimeWindow[]=[];
 for(const delta of [15,30,60])if(mins(base.back)+delta<1440)changes.push({...base,back:clock(mins(base.back)+delta)});
 for(const delta of [15,30])if(mins(base.leave)-delta>=0)changes.push({...base,leave:clock(mins(base.leave)-delta)});
 for(let day=1;day<=7;day++){const d=new Date(base.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+day);changes.push({...base,date:d.toISOString().slice(0,10)})}
 return changes.map(c=>{const opts={...o,windows:[c]};return {options:opts,result:plan(resources,origins,t,opts).find(r=>r.status!=='excluded')}}).filter(x=>x.result).slice(0,3)
}
