import nodemailer from 'nodemailer';
export async function sendOrderNotification(subject:string, html:string){
 const to = process.env.NOTIFY_EMAIL || 'borgesedil488@gmail.com';
 if(!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS){
   console.log('EMAIL NÃO CONFIGURADO. Alerta para:', to, subject, html.replace(/<[^>]*>/g,' '));
   return;
 }
 const transporter = nodemailer.createTransport({host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT||587), secure:false, auth:{user:process.env.SMTP_USER, pass:process.env.SMTP_PASS}});
 await transporter.sendMail({from:process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html});
}
