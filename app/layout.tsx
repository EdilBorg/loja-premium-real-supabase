import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'Loja Premium', description:'Plataforma profissional de produtos digitais' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt"><body className="min-h-screen font-sans antialiased">{children}</body></html>}
