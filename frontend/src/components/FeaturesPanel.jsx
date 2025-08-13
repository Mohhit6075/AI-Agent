/* eslint-disable no-unused-vars */
// FeaturesPanel.jsx
// import React from "react";
import { Mail, FileText, Twitter, Calculator,Zap} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

const features = [
  { icon: Calculator, title: "Calculate BMI", subtitle: "Quick health check" },
    { icon: Mail, title: "Send Emails", subtitle: "Draft & deliver fast" },
    { icon: Twitter, title: "Post on Twitter (X)", subtitle: "Compose & schedule" },
    { icon: FileText, title: "Generate PDF/DOCX/TXT", subtitle: "Produce docs quickly" },
  
];

const FeaturesPanel = ({drawer}) => {
  return (
    // <div className="-ml-2 bg-[#212121] border border-zinc-500 tracking-widest p-4 rounded-2xl shadow-sm z-10 max-w-md w-fit mx-auto mt-6 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40">
    //   <h2 className="text-white font-semibold text-lg mb-3 flex items-center tracking-wide gap-2">
    //     ⚡ What more I Can Do 
    //   </h2>
    //   <ul className="space-y-2 text-sm text-gray-300">
    //     {features.map((f, i) => (
    //       <li key={i} className="flex items-center gap-2 hover:text-white transition-colors">
    //         {f.icon}
    //         <span>{f.label}</span>
    //       </li>
    //     ))}
    //   </ul>
    // </div>



     <div className="sticky top-[74px]">
      <Card className={`rounded-2xl ${drawer === "drawer" ? "bg-[#212121]" : "bg-gradient-to-b from-white/10 to-white/5"} `}>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Zap className="h-4 w-4 text-amber-400" />
            What more I can do
          </CardTitle>
          <p className="text-xs text-neutral-400">Explore quick actions and tools</p>
        </CardHeader>
        <CardContent className="grid gap-2">
          
          {features.map(({ icon: Icon, title, subtitle }) => (
            <button
              key={title}
              className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-[#101318]/70 p-3 text-left transition hover:border-emerald-500/30 hover:bg-[#11161d]"
            >
              <Icon className="mt-0.5 h-4 w-4 text-neutral-300" />
              <div className="flex-1">
                <div className="text-sm text-white">{title}</div>
                <div className="text-xs text-neutral-400">{subtitle}</div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesPanel;
