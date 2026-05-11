import { prisma } from '@/lib/prisma';
import { updateOrderStatus } from '@/app/actions';
import { mt } from '@/lib/utils';

export default async function Vendas() {
  const orders = await prisma.order.findMany({ include: { user: true, product: true }, orderBy: { createdAt: 'desc' } });
  return <div className="p-6 md:p-10">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-4xl font-black">Vendas</h1><p className="mt-2 text-white/50">Analise comprovativos, aprove pagamentos e libere acesso.</p></div>
      <div className="rounded-full bg-amber-400/15 px-4 py-2 text-sm font-bold text-amber-100">{orders.filter(o => o.status === 'PROOF_SENT').length} em análise</div>
    </div>
    <div className="mt-8 space-y-5">{orders.length ? orders.map(o => <div key={o.id} className="card grid gap-5 p-5 lg:grid-cols-[1fr_240px_260px]">
      <div>
        <p className="text-xs font-black text-amber-300">{o.reference}</p>
        <h2 className="text-xl font-black">{o.product.title}</h2>
        <p className="mt-2 text-white/55">Cliente: <b className="text-white/80">{o.user.username}</b></p>
        <p className="text-white/55">Valor: {mt(o.pricePaid)} • Método: {o.method || '-'}</p>
        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${badge(o.status)}`}>{o.status}</span>
      </div>
      <div>{o.proofImage ? <a href={o.proofImage} target="_blank"><img src={o.proofImage} className="h-44 w-full rounded-[1.5rem] object-cover" /></a> : <div className="grid h-44 place-items-center rounded-[1.5rem] bg-white/10 text-center text-sm text-white/50">Sem comprovativo</div>}</div>
      <div className="flex flex-col gap-3">
        <form action={updateOrderStatus.bind(null, o.id, 'APPROVED')}><button className="btn w-full bg-emerald-500 text-white">Aprovar e liberar</button></form>
        <form action={updateOrderStatus.bind(null, o.id, 'REJECTED')}><button className="btn w-full bg-red-500/80 text-white">Rejeitar</button></form>
        <form action={updateOrderStatus.bind(null, o.id, 'CANCELLED')}><button className="btn w-full bg-white/10 text-white">Cancelar</button></form>
      </div>
    </div>) : <div className="card p-10 text-center text-white/60">Nenhum pedido ainda.</div>}</div>
  </div>;
}
function badge(s: string) { if (s === 'APPROVED') return 'bg-emerald-400/15 text-emerald-100'; if (s === 'PROOF_SENT') return 'bg-amber-400/15 text-amber-100'; if (s === 'REJECTED') return 'bg-red-400/15 text-red-100'; if (s === 'CANCELLED') return 'bg-white/10 text-white/60'; return 'bg-sky-400/15 text-sky-100'; }
