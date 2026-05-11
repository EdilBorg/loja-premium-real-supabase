export const mt = (v:number)=> new Intl.NumberFormat('pt-MZ',{style:'currency',currency:'MZN',maximumFractionDigits:0}).format(v).replace('MZN','MT');
export function slugify(s:string){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
export function orderRef(){return 'LP-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,7).toUpperCase()}
