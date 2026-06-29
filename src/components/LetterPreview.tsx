import React, { useRef } from 'react';
import { Download, FileText, Send, Check } from 'lucide-react';
import { Issue } from '../types/Issue';

interface LetterPreviewProps {
  issue: Partial<Issue>;
  letterText?: string;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({ issue, letterText }) => {
  const letterRef = useRef<HTMLDivElement>(null);
  const [downloaded, setDownloaded] = React.useState(false);

  const issueId = issue.issueId || 'AP-2026-XXXX';
  const resolvedLetterText = letterText || `
MUNICIPAL ACTION REQUEST
Ref: AtlasPulse AI Security Division

To,
The Executive Engineer,
${issue.responsibleDepartment || 'Greater Chennai Corporation (GCC) Admin Division'},
Chennai, Tamil Nadu.

Subject: Immediate Request for Civic Rectification of ${issue.category || 'Damage'} (ID: ${issueId})

Ref: Visual Analysis Coordinates ${issue.latitude || 13.04}, ${issue.longitude || 80.23}

Sir / Madam,

This formal communication serves to report a critical civic hazard at the coordinates referenced above. Under the AtlasPulse AI routing protocol, the severity has been assessed as ${issue.severityLevel || 'Routine'} with an analytical Priority Score of ${issue.priorityScore || 50}/100.

Vulnerability Analysis Summary:
${issue.aiSummary || 'Pavement and structural damage spotted in regular commute lines causing active public space disruption.'}

An immediate dispatch of inspection professionals and rectification crews is required. The estimated resolution window for such events under regional GCC protocols is ${issue.estimatedResolutionDays || 5} days.

We request your prompt action and confirmation of scheduled inspections.

Yours faithfully,
${issue.citizenName || 'Concerned Resident / Citizen'}
(Filed via AtlasPulse AI Civic Reporting Platform)
`;

  const handleDownloadPDF = () => {
    const letterElement = document.getElementById('letter-content');
    if (!letterElement) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const trackingId = issueId;
    const latitude = issue.latitude?.toFixed(4) || '13.0405';
    const longitude = issue.longitude?.toFixed(4) || '80.2337';
    const letterContent = resolvedLetterText;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Municipal Action Request - ${trackingId}</title>
          <style>
            body { 
              font-family: 'Times New Roman', Georgia, serif; 
              padding: 60px 80px; 
              max-width: 750px; 
              margin: 0 auto; 
              color: #000; 
              font-size: 13px;
              line-height: 1.8;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .header h1 { font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 2px; }
            .header p { font-size: 11px; margin: 4px 0 0; color: #333; letter-spacing: 1px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 25px; font-size: 12px; }
            .meta strong { font-weight: bold; }
            .to-block { margin-bottom: 20px; }
            .to-block p { margin: 2px 0; }
            .subject { font-weight: bold; margin-bottom: 20px; text-decoration: underline; }
            .body-text p { margin-bottom: 14px; text-align: justify; }
            .signature { margin-top: 40px; }
            .signature p { margin: 3px 0; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MUNICIPAL ACTION REQUEST</h1>
            <p>AUTOMATED ESCALATION MATRIX // ATLASPULSE AI</p>
          </div>
          <div class="meta">
            <div><strong>Issue ID:</strong> ${trackingId}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</div>
            <div><strong>Status:</strong> Open</div>
            <div><strong>Coordinates:</strong> ${latitude}, ${longitude}</div>
          </div>
          <div id="letter-body">
            ${letterContent.replace(/\n/g, '<br/>')}
          </div>
          <div class="footer">
            Powered by AtlasPulse AI | Engineered with Gemini 2.5 Pro Vision & Firebase | Chennai Grid Coordination
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold font-display text-slate-100">Municipal action Request</h3>
        </div>

        <button
          onClick={handleDownloadPDF}
          id="btn-download-pdf"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span>Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Realistic formal Municipal Letter Container */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500" />
        
        {/* Paper visual */}
        <div 
          ref={letterRef}
          id="letter-content"
          className="bg-white text-slate-800 p-8 sm:p-12 font-serif text-sm leading-relaxed shadow-inner overflow-auto min-h-[600px] whitespace-pre-line"
        >
          {/* Header styling */}
          <div className="border-b border-slate-300 pb-6 mb-8 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-1">MUNICIPAL ACTION REQUEST</h1>
            <p className="text-xs uppercase tracking-widest text-[#10b981] font-sans font-semibold">AUTOMATED ESCALATION MATRIX // ATLASPULSE AI</p>
            <div className="mt-4 flex flex-wrap justify-between text-left text-[11px] text-slate-500 font-sans tracking-tight">
              <div>
                <strong>ISSUE ID:</strong> {issueId}<br />
                <strong>STATUS:</strong> {issue.status || 'REPORTED'}
              </div>
              <div className="text-right">
                <strong>DATE GENERATED:</strong> {new Date().toLocaleDateString()}<br />
                <strong>COORDINATES:</strong> {issue.latitude?.toFixed(4) || '13.0405'}, {issue.longitude?.toFixed(4) || '80.2337'}
              </div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="text-[14px] text-slate-800 tracking-wide font-serif relative z-10">
            {resolvedLetterText}
          </div>

          <div className="border-t border-slate-200 mt-12 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-sans">
            <span>Powered by AtlasPulse AI. Checked and signed digitally via Google AI Studio.</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
