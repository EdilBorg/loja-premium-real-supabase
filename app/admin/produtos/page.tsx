import { prisma } from '@/lib/prisma';
import { createProductAction } from '@/app/actions';
import { mt } from '@/lib/utils';

export default async function Produtos() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return <div className="p-6 md:p-10">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-4xl font-black">Produtos</h1><p className="mt-2 text-white/50">Adicione produtos reais. Imagem, vídeo e arquivo são opcionais.</p></div>
      <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-100">{products.length} produto(s)</div>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <form action={createProductAction} className="card space-y-4 p-6">
        <h2 className="text-2xl font-black">Novo produto</h2>
        <input name="title" className="input" placeholder="Nome do produto" required />
        <input name="category" className="input" placeholder="Categoria" required />
        <textarea name="description" className="input min-h-28" placeholder="Descrição" required />
        <div className="grid gap-3 sm:grid-cols-2"><input name="price" type="number" className="input" placeholder="Preço MT" required /><input name="oldPrice" type="number" className="input" placeholder="Preço antigo opcional" /></div>
        <label className="block text-sm font-bold">Imagem do produto <span className="text-white/45">(opcional)</span><input name="cover" type="file" accept="image/*" className="input mt-2" /></label>
        <label className="block text-sm font-bold">Vídeo <span className="text-white/45">(opcional)</span><input name="video" type="file" accept="video/*" className="input mt-2" /></label>
        <label className="block text-sm font-bold">Arquivo para download <span className="text-white/45">(opcional)</span><input name="file" type="file" className="input mt-2" /></label>
        <select name="status" className="input"><option value="ACTIVE">Ativo</option><option value="DRAFT">Rascunho</option></select>
        <button className="btn btn-primary w-full">Salvar produto</button>
      </form>
      <section className="card p-6">
        <h2 className="text-2xl font-black">Lista de produtos</h2>
        <div className="mt-5 space-y-3">{products.length ? products.map(p => <div key={p.id} className="flex gap-4 rounded-[2rem] bg-white/10 p-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 text-2xl">{p.coverImage ? <img src={p.coverImage} className="h-full w-full object-cover" /> : '🛍️'}</div>
          <div className="flex-1"><b>{p.title}</b><p className="text-sm text-white/55">{p.category} • {mt(p.price)} • {p.status}</p><p className="mt-1 line-clamp-2 text-xs text-white/40">{p.description}</p></div>
        </div>) : <p className="rounded-[2rem] bg-white/10 p-6 text-white/60">Nenhum produto criado. O catálogo público ficará vazio até você adicionar produtos.</p>}</div>
      </section>
    </div>
  </div>;
}
