import type { Metadata } from "next";
import "./globals.css";

const criticalStyles = `
:root{--zf-bg:#f8faf8;--zf-ink:#172018;--zf-muted:#647067;--zf-green:#0b7a3b;--zf-red:#c62828;--zf-orange:#ff9800;--zf-line:rgba(15,23,42,.08);--zf-shadow:0 24px 70px rgba(18,46,28,.12)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--zf-bg);color:var(--zf-ink);font-family:Inter,Poppins,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:inherit;text-decoration:none}
button,input,select,textarea{font:inherit}
button,a{touch-action:manipulation}
img{display:block;max-width:100%}
main{min-height:100vh}
section{padding:56px 24px}
.font-display,h1,h2,h3{font-family:Poppins,Inter,ui-sans-serif,system-ui,sans-serif}
.grain{background-image:radial-gradient(circle at 20% 20%,rgba(198,40,40,.08),transparent 26rem),radial-gradient(circle at 80% 10%,rgba(255,152,0,.14),transparent 22rem),radial-gradient(circle at 50% 80%,rgba(46,125,50,.12),transparent 28rem)}
.mx-auto{margin-left:auto;margin-right:auto}
.max-w-7xl{max-width:1280px}
.max-w-4xl{max-width:896px}
.max-w-3xl{max-width:768px}
.max-w-2xl{max-width:672px}
.max-w-xl{max-width:576px}
.text-center{text-align:center}
.hidden{display:none!important}
.block{display:block}
.place-items-center{place-items:center}
.relative{position:relative}
.absolute{position:absolute}
.overflow-hidden{overflow:hidden}
.grid{display:grid}
.flex{display:flex}
.inline-flex{display:inline-flex}
.flex-wrap{flex-wrap:wrap}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.gap-2{gap:.5rem}
.gap-3{gap:.75rem}
.gap-4{gap:1rem}
.gap-6{gap:1.5rem}
.gap-10{gap:2.5rem}
.space-y-2>*+*{margin-top:.5rem}
.space-y-3>*+*{margin-top:.75rem}
.space-y-4>*+*{margin-top:1rem}
.space-y-8>*+*{margin-top:2rem}
.p-4{padding:1rem}
.p-5{padding:1.25rem}
.p-6{padding:1.5rem}
.p-8{padding:2rem}
.p-2\\.5{padding:.625rem}
.px-3{padding-left:.75rem;padding-right:.75rem}
.px-4{padding-left:1rem;padding-right:1rem}
.px-5{padding-left:1.25rem;padding-right:1.25rem}
.px-6{padding-left:1.5rem;padding-right:1.5rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}
.py-2{padding-top:.5rem;padding-bottom:.5rem}
.py-3{padding-top:.75rem;padding-bottom:.75rem}
.pt-10{padding-top:2.5rem}
.pb-16{padding-bottom:4rem}
.mt-1{margin-top:.25rem}
.mt-2{margin-top:.5rem}
.mt-3{margin-top:.75rem}
.mt-4{margin-top:1rem}
.mt-5{margin-top:1.25rem}
.mt-6{margin-top:1.5rem}
.mt-7{margin-top:1.75rem}
.mt-8{margin-top:2rem}
.mt-10{margin-top:2.5rem}
.mb-8{margin-bottom:2rem}
.mr-2{margin-right:.5rem}
.ml-2{margin-left:.5rem}
.rounded-full{border-radius:999px}
.rounded-xl{border-radius:.75rem}
.rounded-2xl{border-radius:1rem}
.rounded-\\[1\\.25rem\\]{border-radius:1.25rem}
.rounded-\\[1\\.5rem\\],.rounded-\\[1\\.6rem\\]{border-radius:1.5rem}
.rounded-\\[2rem\\]{border-radius:2rem}
.rounded-\\[3rem\\]{border-radius:3rem}
.border{border:1px solid var(--zf-line)}
.border-t{border-top:1px solid rgba(255,255,255,.12)}
.bg-white{background:#fff}
.bg-zestBg{background:#eef9f1}
.bg-zinc-950{background:#09090b}
.bg-zestRed{background:var(--zf-red)}
.bg-zestGreen{background:var(--zf-green)}
.bg-red-50{background:#fff1f2}
.bg-green-50{background:#effdf4}
.bg-orange-50{background:#fff7ed}
.bg-zinc-50{background:#fafafa}
.bg-white\\/10{background:rgba(255,255,255,.1)}
.text-white{color:#fff}
.text-zinc-950,.text-zinc-900{color:#111827}
.text-zinc-700{color:#3f3f46}
.text-zinc-500{color:#71717a}
.text-zinc-400{color:#a1a1aa}
.text-zinc-300{color:#d4d4d8}
.text-zinc-200{color:#e4e4e7}
.text-zestRed{color:var(--zf-red)}
.text-zestGreen{color:var(--zf-green)}
.text-zestOrange{color:var(--zf-orange)}
.font-black{font-weight:900}
.font-bold{font-weight:800}
.font-semibold{font-weight:700}
.font-medium{font-weight:600}
.text-xs{font-size:.75rem}
.text-sm{font-size:.875rem}
.text-base{font-size:1rem}
.text-lg{font-size:1.125rem}
.text-xl{font-size:1.25rem}
.text-2xl{font-size:1.5rem}
.text-3xl{font-size:1.875rem}
.text-4xl{font-size:2.25rem}
.text-5xl{font-size:3rem}
.leading-7{line-height:1.75rem}
.leading-8{line-height:2rem}
.leading-tight{line-height:1.12}
.tracking-tight{letter-spacing:0}
.uppercase{text-transform:uppercase}
.shadow-soft,.shadow-premium{box-shadow:var(--zf-shadow)}
.transition{transition:all .2s ease}
.object-cover{object-fit:cover}
.aspect-\\[4\\/3\\]{aspect-ratio:4/3}
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);border-bottom:1px solid var(--zf-line);backdrop-filter:blur(18px)}
header nav{max-width:1280px;margin:auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px}
header nav>div{display:flex;align-items:center;gap:12px}
header a{font-weight:900}
header nav>div:nth-child(2) a{padding:10px 12px;border-radius:999px;color:#334155}
header nav>div:nth-child(2) a:hover{background:#f1f5f9;color:#111827}
header nav>div:last-child a:first-child{background:#fff;color:#111827;border:1px solid var(--zf-line)}
header nav>div:last-child a:last-child{background:var(--zf-red);color:#fff}
header nav>div:last-child a{padding:12px 16px;border-radius:999px;box-shadow:0 10px 24px rgba(15,23,42,.08)}
#top{padding-top:48px;padding-bottom:72px}
#top>div{display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:48px}
#top h1{font-size:clamp(44px,7vw,84px);line-height:1.02;margin:28px 0 0;font-weight:900;color:#111827}
#top p{font-size:1.08rem;line-height:1.75;color:#3f3f46}
#top .shadow-premium{border-radius:2rem;background:#fff;padding:20px;box-shadow:var(--zf-shadow)}
#top .aspect-\\[4\\/3\\]{position:relative;overflow:hidden;border-radius:1.25rem;background:#fff1f2;min-height:360px}
#top img{width:100%;height:100%;object-fit:cover}
#top a,#top button,#products a,#order a,form button{border:0;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;font-weight:900;cursor:pointer}
#top a:nth-child(1),#products a:nth-child(2),form button{background:var(--zf-red);color:#fff}
#top a:nth-child(2),#products a:nth-child(1),#order a:nth-child(1){background:var(--zf-green);color:#fff}
#top a:nth-child(n+3),#top button,#products a:nth-child(3){background:#fff;color:#111827;border:1px solid var(--zf-line)}
#products article{display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border-radius:1.6rem;background:#fff;border:1px solid var(--zf-line);box-shadow:var(--zf-shadow)}
#products article>div:first-child{position:relative;min-height:360px;background:linear-gradient(135deg,#fff1f2,#fff7ed,#effdf4)}
#products article>div:first-child img{width:100%;height:100%;object-fit:cover;padding:28px}
#products article>div:last-child{padding:32px}
#products h2,#prices h2,#quality h2,#order h2,#faq h2{font-size:clamp(32px,4vw,56px);line-height:1.05;margin:16px 0 0;font-weight:900;color:#111827}
#products h3{font-size:2rem;margin:20px 0 0}
#products ul{list-style:none;padding:0;margin:12px 0 0}
#products li{display:flex;gap:8px;line-height:1.5}
#prices{overflow:hidden}
#prices table{width:100%;min-width:1000px;border-collapse:separate;border-spacing:0;background:#fff;border-radius:1.6rem;overflow:hidden;box-shadow:var(--zf-shadow)}
#prices th{background:#09090b;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;padding:18px 16px}
#prices td{border-bottom:1px solid #eef2f7;padding:16px;color:#27272a;font-weight:700}
#prices td img{width:64px;height:64px;object-fit:cover;border-radius:16px;background:#fff1f2}
#order{padding:64px 24px}
#order>div{max-width:1280px;margin:auto;border-radius:2rem;background:#09090b;color:#fff;padding:40px;box-shadow:var(--zf-shadow)}
footer{background:#09090b;color:#fff;padding:52px 24px}
footer>div{max-width:1280px;margin:auto;display:grid;grid-template-columns:1.2fr .8fr .7fr;gap:28px}
form{display:grid;grid-template-columns:1fr .75fr;overflow:hidden;border-radius:2rem;background:#fff;border:1px solid var(--zf-line);box-shadow:var(--zf-shadow)}
form>div{padding:32px}
form aside{background:#09090b;color:#fff;padding:32px}
form h2{font-size:2.2rem;margin:0;color:#111827}
form label{display:grid;gap:8px;color:#3f3f46;font-weight:900;font-size:.9rem}
form input,form select,form textarea{width:100%;border:1px solid #e4e4e7;border-radius:16px;padding:13px 15px;background:#fff;color:#111827;outline:none}
form input:focus,form select:focus,form textarea:focus{border-color:var(--zf-red);box-shadow:0 0 0 4px rgba(198,40,40,.12)}
form>div>.mt-6{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
form textarea{resize:vertical}
form aside a{display:flex;align-items:center;gap:12px;border-radius:18px;background:rgba(255,255,255,.1);padding:16px;color:#fff}
@media (min-width:640px){.sm\\:inline-flex{display:inline-flex!important}.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:768px){.md\\:flex{display:flex!important}.md\\:text-6xl{font-size:3.75rem}.md\\:text-7xl{font-size:4.5rem}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:p-8{padding:2rem}.md\\:p-10{padding:2.5rem}.md\\:col-span-2{grid-column:span 2/span 2}}
@media (min-width:1024px){.lg\\:inline-flex{display:inline-flex!important}.lg\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.lg\\:grid-cols-\\[1\\.05fr_0\\.95fr\\]{grid-template-columns:1.05fr .95fr}.lg\\:grid-cols-\\[1fr_0\\.75fr\\]{grid-template-columns:1fr .75fr}.lg\\:px-8{padding-left:2rem;padding-right:2rem}.lg\\:pt-16{padding-top:4rem}.lg\\:pb-24{padding-bottom:6rem}}
@media (max-width:900px){section{padding:42px 16px}header nav,#top>div,#products article,form,footer>div{grid-template-columns:1fr;flex-wrap:wrap}header nav{align-items:flex-start}header nav>div:nth-child(2){order:3;width:100%;overflow:auto;padding-bottom:4px}#top .aspect-\\[4\\/3\\],#products article>div:first-child{min-height:280px}form>div>.mt-6{grid-template-columns:1fr}#prices{overflow-x:auto}}
`;

export const metadata: Metadata = {
  title: "ZestFresh Premium Red Chilli Powder",
  description:
    "Premium mirchi powder product information for ZestFresh with variety details, quality notes, stock status, and enquiry support.",
  openGraph: {
    title: "ZestFresh Mirchi Powder",
    description: "Premium red chilli powder varieties with quick enquiry support.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
