'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Crosshair,Database,SlidersHorizontal} from 'lucide-react';

const filterChoices=[
  ['noAppointment','No appointment'],
  ['noId','No published ID rule'],
  ['fresh','Fresh food listed'],
  ['spanish','Spanish available'],
] as const;

export default function AppTools(){
 const [filters,setFilters]=useState({noAppointment:false,noId:false,fresh:false,spanish:false});
 const [locationState,setLocationState]=useState('');
 function toggle(key:keyof typeof filters){const next={...filters,[key]:!filters[key]};setFilters(next);window.dispatchEvent(new CustomEvent('foodreach:filters',{detail:next}))}
 function locate(){
  if(!navigator.geolocation){setLocationState('Location is not supported by this browser.');return}
  setLocationState('Finding your location…');
  navigator.geolocation.getCurrentPosition(
   p=>{window.dispatchEvent(new CustomEvent('foodreach:location',{detail:{lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}}));setLocationState(`Location ready · about ${Math.round(p.coords.accuracy)} m accuracy`)},
   e=>setLocationState(e.code===1?'Location permission was not granted. Choose a landmark instead.':'Location could not be found. Choose a landmark instead.'),
   {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
  )
 }
 return <section className="app-tools" aria-label="Heartfood quick tools"><div className="tool-location"><button type="button" onClick={locate}><Crosshair size={17}/> Use my current location</button>{locationState&&<span role="status">{locationState}</span>}</div><details><summary><SlidersHorizontal size={16}/> Food and access filters</summary><div className="filter-grid">{filterChoices.map(([key,label])=><button key={key} type="button" aria-pressed={filters[key]} className={filters[key]?'active':''} onClick={()=>toggle(key)}>{label}</button>)}</div><small>“No published ID rule” includes unknown requirements. Confirm before travel.</small></details><nav><Link href="/resources"><Database size={16}/> Resource directory</Link><Link href="/provider">Provider update demo</Link></nav></section>
}
