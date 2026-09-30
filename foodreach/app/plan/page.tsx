import {Suspense} from 'react';
import AppTools from '../app-tools';
import Heartfood from '../foodreach';
export default function Plan(){return <><AppTools/><Suspense fallback={null}><Heartfood/></Suspense></>}
