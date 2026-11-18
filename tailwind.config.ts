import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme: {extend:{colors:{ink:'#0B0615',deep:'#17052E',royal:'#5B21B6',electric:'#8B5CF6',lavender:'#A78BFA',mist:'#EDE9FE',paper:'#FAF8FF'},fontFamily:{sans:['var(--font-dm-sans)','Helvetica Neue','Helvetica','Arial','sans-serif']}}},plugins:[] } satisfies Config;
