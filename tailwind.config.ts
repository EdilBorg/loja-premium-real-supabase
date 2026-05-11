import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { boxShadow: { glow: '0 20px 80px rgba(239,68,68,.22)' } } }, plugins: [] };
export default config;
