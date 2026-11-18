import {Suspense} from 'react';
import {CheckoutStatus} from '@/components/cart/CheckoutStatus';
export default function Success(){return <main className="inner-main"><div className="inner-container"><Suspense fallback={null}><CheckoutStatus/></Suspense></div></main>}
