import assert from 'node:assert/strict';import fs from 'node:fs';import {plan,alternatives,windows,services} from '../work/planner.mjs';
const read=n=>JSON.parse(fs.readFileSync(`public/data/${n}.json`));const resources=read('resources'),origins=read('origins'),transit=read('transit');
const o={origin:'union',mode:'bus',date:'2026-09-30',leave:'10:30',back:'14:00',walk:40,residency:'Unknown',pickup:20};
let results=plan(resources,origins,transit,o),fits=results.filter(x=>x.status!=='excluded');console.log('Real default candidates',fits.map(x=>({name:x.resource.name,arrival:x.inbound.arrival,route:x.out.route,walking:x.walking})));
assert(fits.length>0,'Default real-data scenario must produce a candidate');for(const r of fits){assert(r.inbound.arrival<=840);assert(r.walking<=40);assert(r.inbound.departure>=r.finish)}
assert.equal(windows(resources.find(r=>r.id==='east'),'2026-10-01').length,0);assert.equal(windows(resources.find(r=>r.id==='east'),'2026-10-08').length,1);
assert.equal(plan(resources,origins,transit,{...o,walk:0}).filter(r=>r.status!=='excluded').length,0);
assert.equal(plan(resources,origins,transit,{...o,date:'2030-09-30'}).filter(r=>r.status!=='excluded').length,0);
assert.equal(plan(resources,origins,transit,{...o,back:'10:35'}).filter(r=>r.status!=='excluded').length,0);
assert(alternatives(resources,origins,transit,{...o,back:'10:35'}).length>0);
assert(plan(resources,origins,transit,{...o,residency:'Hartford'}).find(r=>r.resource.id==='west').status==='excluded');
const fixture={...transit,calendar:[{service_id:'test',start_date:'20260901',end_date:'20261031',wednesday:'1'}],exceptions:[{service_id:'test',date:'20260930',exception_type:'2'}]};assert(!services(fixture,o.date).has('test'));
console.log('PASS: round trip, walking cap, monthly recurrence, expiry, deadline, alternatives, residency, service exception.');

