import React, { useState } from 'react';

export default function CodeViewer({ title, language = 'sql', code = '', annotations = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="border border-[#141413] bg-white">
      {/* Specification Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F2F0E8] border-b border-[#141413]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[#141413] text-[#FAF9F5]">
            {language}
          </span>
          <span className="text-xs font-mono font-semibold text-[#141413]">{title}</span>
          <span className="text-[11px] font-mono text-[#6E6D68]">({lines.length} lines)</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border border-[#141413] bg-white hover:bg-[#141413] hover:text-white transition"
        >
          {copied ? 'COPIED TO CLIPBOARD' : 'COPY SOURCE'}
        </button>
      </div>

      {/* Architectural Annotations / Technical Footnotes */}
      {annotations.length > 0 && (
        <div className="border-b border-[#D8D6CE] bg-[#FAF9F5] divide-y md:divide-y-0 md:grid md:grid-cols-2 md:divide-x divide-[#D8D6CE]">
          {annotations.map((note, idx) => (
            <div key={idx} className="p-3.5 text-xs leading-relaxed border-b border-[#D8D6CE] last:border-b-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-[#991B1B] shrink-0">
                  [{String(idx + 1).padStart(2, '0')}]
                </span>
                <span className="font-semibold text-[#141413]">{note.title}</span>
              </div>
              <p className="text-[#52514E] mt-1 pl-7">{note.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Source Code Listing */}
      <div className="p-4 overflow-x-auto max-h-[480px] overflow-y-auto font-mono text-[12px] leading-[1.65] bg-[#161615] text-[#E6E4DD]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => {
              const trimmed = line.trim();
              const isComment = trimmed.startsWith('--') || trimmed.startsWith('#') || trimmed.startsWith('"""') || trimmed.startsWith('=');
              return (
                <tr key={i} className="hover:bg-[#232321]">
                  <td className="select-none pr-4 text-right text-[#666560] w-9 align-top">
                    {i + 1}
                  </td>
                  <td
                    className={`whitespace-pre ${
                      isComment ? 'text-[#8F9E8B] italic' : 'text-[#ECEAE4]'
                    }`}
                  >
                    {line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
