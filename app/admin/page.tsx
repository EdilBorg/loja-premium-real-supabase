import { prisma } from '@/lib/prisma';
import { mt } from '@/lib/utils';
import AdminChart from '@/components/AdminChart';

export default async function Admin() {
  const [products, orders, clients] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ include: { product: true, user: true }, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } })
  ]);
  const approved = orders.filter(o => o.status === 'APPROVED');
  const pending = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
  const proofSent = orders.filter(o => o.status === 'PROOF_SENT').length;
  const rejected = orders.filter(o => o.status === 'REJECTED').length;
  const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
  const revenue = approved.reduce((s, o) => s + o.pricePaid, 0);
  const expected = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REJECTED').reduce((s, o) => s + o.pricePaid, 0);
  const conversion = orders.length ? Math.round((approved.length / orders.length) * 100) : 0;
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(5, 10);
    const dayOrders = orders.filter(o => o.createdAt.toISOString().slice(5, 10) === key);
    return { name: key, total: dayOrders.filter(o => o.status === 'APPROVED').reduce((s, o) => s + o.pricePaid, 0) };
  });

  return <div className="p-6 md:p-10">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[.3em] text-amber-300">Painel de controlo</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Dashboard</h1>
        <p className="mt-2 text-white/50">Resumo real da plataforma: vendas, lucro aprovado, pedidos em análise e produtos.</p>
      </div>
      <div className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white/70">Relatório atualizado em tempo real</div>
    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Card t="Lucro aprovado" v={mt(revenue)} hint="Conta só pedidos aprovados" />
      <Card t="Valor em aberto" v={mt(expected - revenue)} hint="Pedidos ainda não aprovados" />
      <Card t="Pedidos em análise" v={proofSent} hint="Com comprovativo enviado" />
      <Card t="Taxa de aprovação" v={`${conversion}%`} hint="Pedidos aprovados / total" />
    </div>

    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      <Mini t="Produtos" v={products} />
      <Mini t="Clientes" v={clients} />
      <Mini t="Pendentes" v={pending} />
      <Mini t="Rejeitados" v={rejected} />
      <Mini t="Cancelados" v={cancelled} />
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Lucro aprovado nos últimos 7 dias</h2><span className="text-sm text-white/45">MT</span></div>
        <AdminChart data={data} />
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-black">Fila de atenção</h2>
        <p className="mt-1 text-sm text-white/50">Priorize pedidos com comprovativo.</p>
        <div className="mt-4 space-y-3">{orders.filter(o => o.status === 'PROOF_SENT').slice(0, 6).map(o => <div key={o.id} className="rounded-[1.5rem] bg-amber-400/10 p-4">
          <b>{o.reference}</b>
          <p className="text-sm text-white/60">{o.user.username} • {o.product.title}</p>
          <p className="text-sm font-bold text-amber-200">{mt(o.pricePaid)}</p>
        </div>)}{proofSent === 0 ? <div className="rounded-[1.5rem] bg-white/10 p-6 text-center text-white/50">Nenhum comprovativo em análise.</div> : null}</div>
      </section>
    </div>

    <section className="card mt-8 p-6">
      <h2 className="text-xl font-black">Pedidos recentes</h2>
      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/10 text-white/50"><tr><th className="p-4">Ref.</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Estado</th></tr></thead>
          <tbody>{orders.slice(0, 8).map(o => <tr key={o.id} className="border-t border-white/10"><td className="p-4 font-bold text-amber-300">{o.reference}</td><td>{o.user.username}</td><td>{o.product.title}</td><td>{mt(o.pricePaid)}</td><td>{o.status}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>;
}

function Card({ t, v, hint }: { t: string, v: any, hint: string }) { return <div className="card p-6"><p className="text-sm text-white/50">{t}</p><strong className="mt-2 block text-3xl font-black">{v}</strong><p className="mt-2 text-xs text-white/40">{hint}</p></div>; }
function Mini({ t, v }: { t: string, v: any }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[.06] p-4"><p className="text-xs text-white/45">{t}</p><b className="text-2xl">{v}</b></div>; }
