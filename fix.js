const fs=require('fs'); 
let c=fs.readFileSync('src/components/pdf/WorkOrderPrintDocument.tsx','utf8'); 
c=c.replace(/leading-tight/g, 'leading-[1.4]'); 
c=c.replace(/className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2"/g, 'className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]"'); 

const s5=c.indexOf('{/* 5.'); 
const s6=c.indexOf('{/* 6.'); 
const s7=c.indexOf('{/* 7.'); 
if(s5>-1&&s6>-1&&s7>-1){ 
  let p5=c.substring(s5,s6); 
  let p6=c.substring(s6,s7); 
  p5=p5.replace(/5\./g,'6.'); 
  p6=p6.replace(/6\./g,'5.'); 
  p5=p5.replace('className="grid grid-cols-2 gap-4"','className="flex flex-row flex-wrap gap-4"'); 
  p5=p5.replace(/className="border border-slate-300 p-2 rounded break-inside-avoid[^"]*"/g, 'className="border border-slate-300 p-2 rounded break-inside-avoid w-[calc(50%-0.5rem)] flex-none bg-white shadow-sm"'); 
  c=c.substring(0,s5)+p6+p5+c.substring(s7); 
  fs.writeFileSync('src/components/pdf/WorkOrderPrintDocument.tsx',c); 
} else {
  console.log("Could not find sections", s5, s6, s7);
}
