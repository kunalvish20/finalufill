import type {Metadata} from 'next';
import '@fontsource-variable/dm-sans/wght.css';
import './globals.css';
import './unwind.css';
import './premium.css';
import './morph.css';
import './refinements.css';
import './card-upgrade.css';
import './product-page.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {CustomCursor} from '@/components/layout/CustomCursor';
import {CartNotice} from '@/components/cart/CartNotice';
import SmoothExperience from '@/components/layout/SmoothExperience';
export const metadata:Metadata={title:{default:'UFILL3D | Filament for Your Next Idea',template:'%s | UFILL3D'},description:'Explore UFILL3D filament materials, compare colors and preview the spool in 3D before choosing your next print.',openGraph:{title:'UFILL3D | Filament for Your Next Idea',description:'Explore filament materials, colors and a closer 3D view of the spool.',images:['/opengraph-image.png']},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SmoothExperience/><Header/><CustomCursor/>{children}<Footer/><CartNotice/></body></html>}
