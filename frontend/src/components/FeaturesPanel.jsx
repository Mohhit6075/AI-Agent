// FeaturesPanel.jsx
import React from "react";
import { Mail, FileText, Twitter, Calculator, Bot} from "lucide-react";

const features = [
  { icon: <Calculator className="w-5 h-5" />, label: "Calculate BMI" },
  { icon: <Mail className="w-5 h-5" />, label: "Send Emails" },
  { icon: <Twitter className="w-5 h-5" />, label: "Post on Twitter (X)" },
  {
    icon:<FileText className="w-5 h-5" />,
    label: "Generate Pdf/docx/txt files",
  }
];

const FeaturesPanel = () => {
  return (
    <div className="absolute -right-4 bg-[#212121] border border-zinc-500 tracking-widest p-4 rounded-2xl shadow-sm z-10 max-w-md w-[20%] mx-auto mt-6 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40">
      <h2 className="text-white font-semibold text-lg mb-3 flex items-center tracking-wide gap-2">
        ⚡ What more I Can Do 
      </h2>
      <ul className="space-y-2 text-sm text-gray-300">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 hover:text-white transition-colors">
            {f.icon}
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesPanel;
