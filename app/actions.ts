'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie, requireAdmin, requireSuperAdmin, requireUser } from '@/lib/auth';
import { orderRef, slugify, mt } from '@/lib/utils';
import { saveUpload } from '@/lib/upload';
import { sendOrderNotification } from '@/lib/mail';

export async function registerAction(_: any, fd: FormData) {
  const username = String(fd.get('username') || '').trim();
  const password = String(fd.get('password') || '');
  const confirm = String(fd.get('confirm') || '');
  if (username.length < 3) return { error: 'Coloque um usuário válido.' };
  if (password.length < 6) return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  if (password !== confirm) return { error: 'As senhas não combinam.' };
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { error: 'Este usuário já existe.' };
  const user = await prisma.user.create({ data: { username, password: await hashPassword(password), role: 'CUSTOMER' } });
  await setAuthCookie(signToken({ id: user.id, role: user.role }));
  redirect('/conta');
}

export async function loginAction(_: any, fd: FormData) {
  const username = String(fd.get('username') || '').trim();
  const password = String(fd.get('password') || '');
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) return { error: 'Dados incorretos.' };
  const ok = await verifyPassword(password, user.password);
  if (!ok) return { error: 'Dados incorretos.' };
  await setAuthCookie(signToken({ id: user.id, role: user.role }));
  redirect(user.role === 'CUSTOMER' ? '/conta' : '/admin');
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/');
}

export async function createOrderAction(productId: string, fd: FormData) {
  const user = await requireUser();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'ACTIVE') throw new Error('Produto indisponível');
  const method = String(fd.get('method') || '').trim();
  const order = await prisma.order.create({
    data: { reference: orderRef(), userId: user.id, productId: product.id, pricePaid: product.price, method, status: 'PENDING_PAYMENT' }
  });
  await sendOrderNotification(
    `Novo pedido criado: ${order.reference}`,
    `<h2>Novo pedido criado</h2>
     <p><b>Referência:</b> ${order.reference}</p>
     <p><b>Usuário:</b> ${user.username}</p>
     <p><b>Produto:</b> ${product.title}</p>
     <p><b>Preço:</b> ${mt(product.price)}</p>
     <p><b>Método:</b> ${method || '-'}</p>
     <p>Entre no painel admin para acompanhar.</p>`
  );
  redirect(`/conta/pedido/${order.reference}?created=1`);
}

export async function uploadProofAction(orderId: string, fd: FormData) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, user: true } });
  if (!order || order.userId !== user.id) throw new Error('Pedido não encontrado');
  if (order.status === 'APPROVED' || order.status === 'CANCELLED') throw new Error('Este pedido já não pode receber comprovativo.');
  const proof = await saveUpload(fd.get('proof') as File, 'proofs');
  if (!proof) return { error: 'Envie a foto do comprovativo.' };
  const updated = await prisma.order.update({ where: { id: order.id }, data: { proofImage: proof, status: 'PROOF_SENT' } });
  await sendOrderNotification(
    `Comprovativo recebido: ${order.reference}`,
    `<h2>Comprovativo recebido</h2>
     <p><b>Referência:</b> ${order.reference}</p>
     <p><b>Usuário:</b> ${order.user.username}</p>
     <p><b>Produto:</b> ${order.product.title}</p>
     <p><b>Preço:</b> ${mt(order.pricePaid)}</p>
     <p><b>Método:</b> ${order.method || '-'}</p>
     <p>Entre no painel admin, confira o comprovativo e aprove para liberar o acesso.</p>`
  );
  redirect(`/conta/pedido/${updated.reference}?proof=1`);
}

export async function cancelMyOrderAction(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });
  if (!order || order.userId !== user.id) throw new Error('Pedido não encontrado');
  if (order.status === 'APPROVED') throw new Error('Pedido aprovado não pode ser cancelado pelo cliente.');
  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
  await sendOrderNotification(
    `Pedido cancelado pelo cliente: ${order.reference}`,
    `<h2>Pedido cancelado pelo cliente</h2>
     <p><b>Referência:</b> ${order.reference}</p>
     <p><b>Usuário:</b> ${user.username}</p>
     <p><b>Produto:</b> ${order.product.title}</p>
     <p><b>Preço:</b> ${mt(order.pricePaid)}</p>`
  );
  redirect('/conta');
}

export async function savePaymentSettings(fd: FormData) {
  await requireAdmin();
  const current = await prisma.paymentSetting.findFirst();
  const data = {
    mpesaName: String(fd.get('mpesaName') || ''),
    mpesaNumber: String(fd.get('mpesaNumber') || ''),
    emolaName: String(fd.get('emolaName') || ''),
    emolaNumber: String(fd.get('emolaNumber') || ''),
    bankName: String(fd.get('bankName') || ''),
    bankAccount: String(fd.get('bankAccount') || ''),
    bankHolder: String(fd.get('bankHolder') || ''),
    whatsapp: String(fd.get('whatsapp') || '')
  };
  if (current) await prisma.paymentSetting.update({ where: { id: current.id }, data });
  else await prisma.paymentSetting.create({ data });
  await sendOrderNotification('Configurações de pagamento atualizadas', '<p>As configurações de pagamento da plataforma foram atualizadas no painel admin.</p>');
  redirect('/admin/pagamentos');
}

export async function createProductAction(fd: FormData) {
  await requireAdmin();
  const title = String(fd.get('title') || '').trim();
  const price = Number(fd.get('price') || 0);
  const category = String(fd.get('category') || 'Geral').trim();
  const description = String(fd.get('description') || '').trim();
  if (!title || !price || price <= 0) throw new Error('Dados inválidos');
  const cover = await saveUpload(fd.get('cover') as File, 'products');
  const video = await saveUpload(fd.get('video') as File, 'products');
  const file = await saveUpload(fd.get('file') as File, 'products');
  let slug = slugify(title);
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) slug = `${slugify(title)}-${i++}`;
  await prisma.product.create({
    data: {
      title,
      slug,
      price,
      oldPrice: Number(fd.get('oldPrice') || 0) || null,
      category,
      description,
      coverImage: cover,
      videoUrl: video,
      fileUrl: file,
      status: String(fd.get('status') || 'ACTIVE') as any
    }
  });
  await sendOrderNotification(`Produto criado: ${title}`, `<p>Novo produto criado no painel admin: <b>${title}</b> — ${mt(price)}</p>`);
  redirect('/admin/produtos');
}

export async function updateOrderStatus(orderId: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') {
  await requireAdmin();
  const order = await prisma.order.update({ where: { id: orderId }, data: { status }, include: { user: true, product: true } });
  const label = status === 'APPROVED' ? 'aprovado e acesso liberado' : status === 'REJECTED' ? 'rejeitado' : 'cancelado';
  await sendOrderNotification(
    `Pedido ${label}: ${order.reference}`,
    `<h2>Pedido ${label}</h2>
     <p><b>Referência:</b> ${order.reference}</p>
     <p><b>Usuário:</b> ${order.user.username}</p>
     <p><b>Produto:</b> ${order.product.title}</p>
     <p><b>Preço:</b> ${mt(order.pricePaid)}</p>`
  );
  redirect('/admin/vendas');
}

export async function createAdminAction(fd: FormData) {
  await requireSuperAdmin();
  const username = String(fd.get('username') || '').trim();
  const password = String(fd.get('password') || '');
  const role = String(fd.get('role') || 'ADMIN') as any;
  if (!username || password.length < 6) throw new Error('Dados inválidos.');
  await prisma.user.create({ data: { username, email: username.includes('@') ? username : null, password: await hashPassword(password), role } });
  await sendOrderNotification(`Novo admin criado: ${username}`, `<p>Foi criada uma nova conta admin: <b>${username}</b> com cargo <b>${role}</b>.</p>`);
  redirect('/admin/administradores');
}
