import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
export async function hashPassword(p:string){return bcrypt.hash(p,12)}
export async function verifyPassword(p:string,h:string){return bcrypt.compare(p,h)}
export function signToken(payload:any){return jwt.sign(payload, secret, {expiresIn:'7d'})}
export async function setAuthCookie(token:string){(await cookies()).set('lp_token', token, {httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:60*60*24*7})}
export async function clearAuthCookie(){(await cookies()).delete('lp_token')}
export async function currentUser(){const token=(await cookies()).get('lp_token')?.value; if(!token) return null; try{const data:any=jwt.verify(token, secret); return prisma.user.findUnique({where:{id:data.id}})}catch{return null}}
export async function requireUser(){const u=await currentUser(); if(!u) throw new Error('UNAUTHORIZED'); return u}
export async function requireAdmin(){const u=await requireUser(); if(!['ADMIN','SUPER_ADMIN'].includes(u.role)) throw new Error('FORBIDDEN'); return u}
export async function requireSuperAdmin(){const u=await requireUser(); if(u.role!=='SUPER_ADMIN') throw new Error('FORBIDDEN'); return u}
