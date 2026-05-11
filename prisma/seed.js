const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main(){
 const email = process.env.ADMIN_EMAIL || 'borgesedil488@gmail.com';
 const password = process.env.ADMIN_PASSWORD || 'B@rgesedil101419';
 const hash = await bcrypt.hash(password, 12);
 await prisma.user.upsert({ where:{ username: email }, update:{ email, password:hash, role:'SUPER_ADMIN', active:true }, create:{ username:email, email, name:process.env.ADMIN_NAME || 'Borges Edil', password:hash, role:'SUPER_ADMIN' }});
 const count = await prisma.paymentSetting.count();
 if(!count) await prisma.paymentSetting.create({data:{mpesaName:'',mpesaNumber:'',emolaName:'',emolaNumber:'',bankName:'',bankAccount:'',bankHolder:'',whatsapp:''}})
 console.log('SUPER_ADMIN criado:', email);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
