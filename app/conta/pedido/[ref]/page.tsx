import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mt } from '@/lib/utils';
import { uploadProofAction, cancelMyOrderAction } from '@/app/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Pedido({ params, searchParams }: { params: { ref: string }, searchParams?: { created?: string, proof?: string } }) {
  const u = await requireUser();
  const order = await prisma.order.findUnique({ where: { reference: params.ref }, include: { product: true } });
  if (!order || order.userId !== u.id) notFound();
  const settings = await prisma.paymentSetting.findFirst();
  const successCreated = searchParams?.created === '1';
  const proofSent = searchParams?.proof === '1';

  return <><Nav /><main className="min-h-screen bg-[#070713] px-4 py-10 text-white">
    <div className="mx-auto max-w-6xl">
      <Link href="/conta" className="text-sm font-bold text-amber-300">← Minha conta</Link>
      {successCreated ? <div className="mt-5 rounded-[2rem] border border-emerald-400/30 bg-emerald-500/15 p-5 shadow-2xl shadow-emerald-950/30">
        <h1 className="text-2xl font-black text-emerald-100">Compra feita com sucesso</h1>
        <p className="mt-1 text-emerald-50/75">O teu pedido foi criado. Agora faz o pagamento usando a referência abaixo e envia o comprovativo aqui na plataforma.</p>
      </div> : null}
      {proofSent ? <div className="mt-5 rounded-[2rem] border border-sky-400/30 bg-sky-500/15 p-5 shadow-2xl shadow-sky-950/30">
        <h1 className="text-2xl font-black text-sky-100">Comprovativo enviado</h1>
        <p className="mt-1 text-sky-50/75">Recebemos a imagem. O admin foi avisado por email e vai analisar para liberar o acesso.</p>
      </div> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <section className="card p-7">
          <p className="text-sm font-black text-amber-300">REFERÊNCIA DO PEDIDO</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">{order.reference}</h1>
          <p className="mt-3 text-white/60">Use esta referência no comprovativo ou na observação do pagamento.</p>

          <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
            <h2 className="text-2xl font-black">{order.product.title}</h2>
            <p className="mt-2 text-white/60">Valor: {mt(order.pricePaid)}</p>
            <p className="mt-1 text-white/60">Estado: <b className="text-white">{statusText(order.status)}</b></p>
          </div>

          {order.status === 'APPROVED' ? <div className="mt-6 rounded-[2rem] border border-emerald-400/30 bg-emerald-500/15 p-5">
            <h3 className="font-black text-emerald-200">Acesso liberado</h3>
            {order.product.fileUrl ? <a href={order.product.fileUrl} download className="btn btn-primary mt-4 inline-block">Baixar produto</a> : <p className="mt-2 text-white/60">Compra aprovada. O ficheiro ainda não foi anexado pelo admin.</p>}
          </div> : order.status === 'CANCELLED' ? <div className="mt-6 rounded-[2rem] bg-red-500/10 p-5 text-red-100">Este pedido foi cancelado.</div> : <>
            <form action={uploadProofAction.bind(null, order.id)} className="mt-6 rounded-[2rem] bg-white/10 p-5">
              <h3 className="text-xl font-black">Enviar comprovativo</h3>
              <p className="mt-2 text-sm text-white/60">Envie print/foto da mensagem de pagamento. O admin receberá alerta por email.</p>
              <input name="proof" type="file" accept="image/*" className="input mt-4" required />
              <button className="btn btn-primary mt-4 w-full">Enviar comprovativo</button>
            </form>
            <form action={cancelMyOrderAction.bind(null, order.id)} className="mt-3">
              <button className="btn w-full bg-white/10 text-white">Cancelar pedido</button>
            </form>
          </>}
        </section>

        <aside className="card p-7">
          <h2 className="text-2xl font-black">Dados de pagamento</h2>
          <p className="mt-2 text-sm text-white/55">Escolha um método, pague manualmente e envie a foto do comprovativo.</p>
          <div className="mt-5 space-y-4 text-sm">
            <PayBox title="M-Pesa" name={settings?.mpesaName} value={settings?.mpesaNumber} />
            <PayBox title="E-Mola" name={settings?.emolaName} value={settings?.emolaNumber} />
            <div className="rounded-[2rem] bg-white/10 p-4"><b>Banco</b><p>{settings?.bankName || 'Banco não configurado'}</p><p>{settings?.bankAccount || 'Conta não configurada'}</p><p>{settings?.bankHolder || ''}</p></div>
          </div>
        </aside>
      </div>
    </div>
  </main></>;
}

function PayBox({ title, name, value }: { title: string, name?: string | null, value?: string | null }) {
  return <div className="rounded-[2rem] bg-white/10 p-4"><b>{title}</b><p>{name || 'Nome não configurado'}</p><p>{value || 'Número não configurado'}</p></div>;
}
function statusText(s: string) {
  return s === 'PENDING_PAYMENT' ? 'Aguardando pagamento' : s === 'PROOF_SENT' ? 'Comprovativo em análise' : s === 'APPROVED' ? 'Aprovado' : s === 'REJECTED' ? 'Rejeitado' : 'Cancelado';
}
