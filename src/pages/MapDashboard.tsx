import React, { useEffect, useRef, useState } from 'react';
import { Issue } from '../types/Issue';
import { MapPin, Search, Compass, Activity, Eye, ShieldAlert, AlertCircle, Info } from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { db } from '../lib/firebase';

interface MapDashboardProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onVerify?: (issueId: string) => void;
  currentUserId?: string;
}

const hardcodedIssues = [
  { id: '1', trackingId: 'AP-2026-1001', issueCategory: 'Pothole', urgencyTier: 'Emergency', status: 'Reported', latitude: 13.0569, longitude: 80.2425, address: 'Anna Salai, Chennai', priorityScore: 94, severityLevel: 9, createdBy: 'seed' },
  { id: '2', trackingId: 'AP-2026-1002', issueCategory: 'Water Leakage', urgencyTier: 'Urgent', status: 'In Progress', latitude: 13.0418, longitude: 80.2341, address: 'T. Nagar, Chennai', priorityScore: 82, severityLevel: 7, createdBy: 'seed' },
  { id: '3', trackingId: 'AP-2026-1003', issueCategory: 'Garbage Dump', urgencyTier: 'Important', status: 'Reported', latitude: 13.0067, longitude: 80.2576, address: 'Adyar, Chennai', priorityScore: 71, severityLevel: 6, createdBy: 'seed' },
  { id: '4', trackingId: 'AP-2026-1004', issueCategory: 'Broken Streetlight', urgencyTier: 'Routine', status: 'Verified', latitude: 12.9815, longitude: 80.2180, address: 'Velachery, Chennai', priorityScore: 60, severityLevel: 5, createdBy: 'seed' },
  { id: '5', trackingId: 'AP-2026-1005', issueCategory: 'Drain Blockage', urgencyTier: 'Urgent', status: 'Reported', latitude: 13.0368, longitude: 80.2676, address: 'Mylapore, Chennai', priorityScore: 88, severityLevel: 8, createdBy: 'seed' },
  { id: '6', trackingId: 'AP-2026-1006', issueCategory: 'Road Damage', urgencyTier: 'Urgent', status: 'In Progress', latitude: 13.0358, longitude: 80.1560, address: 'Porur, Chennai', priorityScore: 91, severityLevel: 8, createdBy: 'seed' },
  { id: '7', trackingId: 'AP-2026-1007', issueCategory: 'Water Leakage', urgencyTier: 'Important', status: 'Resolved', latitude: 13.0891, longitude: 80.2108, address: 'Anna Nagar, Chennai', priorityScore: 74, severityLevel: 6, createdBy: 'seed' },
  { id: '8', trackingId: 'AP-2026-1008', issueCategory: 'Pothole', urgencyTier: 'Urgent', status: 'Reported', latitude: 12.9516, longitude: 80.2462, address: 'Sholinganallur, Chennai', priorityScore: 85, severityLevel: 7, createdBy: 'seed' },
  { id: '9', trackingId: 'AP-2026-1009', issueCategory: 'Garbage Dump', urgencyTier: 'Important', status: 'Reported', latitude: 12.9249, longitude: 80.1000, address: 'Tambaram, Chennai', priorityScore: 62, severityLevel: 5, createdBy: 'seed' },
  { id: '10', trackingId: 'AP-2026-1010', issueCategory: 'Broken Streetlight', urgencyTier: 'Routine', status: 'Verified', latitude: 13.0569, longitude: 80.2625, address: 'Nungambakkam, Chennai', priorityScore: 55, severityLevel: 4, createdBy: 'seed' },
  { id: '11', trackingId: 'AP-2026-1011', issueCategory: 'Public Safety Hazard', urgencyTier: 'Emergency', status: 'Reported', latitude: 13.0500, longitude: 80.2824, address: 'Marina Beach, Chennai', priorityScore: 96, severityLevel: 9, createdBy: 'seed' },
  { id: '12', trackingId: 'AP-2026-1012', issueCategory: 'Drain Blockage', urgencyTier: 'Urgent', status: 'In Progress', latitude: 13.0067, longitude: 80.2206, address: 'Guindy, Chennai', priorityScore: 80, severityLevel: 7, createdBy: 'seed' },
  { id: '13', trackingId: 'AP-2026-1013', issueCategory: 'Road Damage', urgencyTier: 'Emergency', status: 'Reported', latitude: 13.0827, longitude: 80.2707, address: 'Perambur, Chennai', priorityScore: 93, severityLevel: 9, createdBy: 'seed' },
  { id: '14', trackingId: 'AP-2026-1014', issueCategory: 'Water Leakage', urgencyTier: 'Urgent', status: 'Reported', latitude: 13.0200, longitude: 80.2500, address: 'Kodambakkam, Chennai', priorityScore: 78, severityLevel: 7, createdBy: 'seed' },
  { id: '15', trackingId: 'AP-2026-1015', issueCategory: 'Pothole', urgencyTier: 'Important', status: 'Verified', latitude: 12.9698, longitude: 80.1842, address: 'Chromepet, Chennai', priorityScore: 68, severityLevel: 6, createdBy: 'seed' },
];

export const MapDashboard: React.FC<MapDashboardProps> = ({ issues, onSelectIssue, onVerify, currentUserId }) => {
  const firestoreIssues = issues;
  
  // Create a combined list while ensuring we don't have duplicates based on trackingId / issueId / id
  const rawCombined = [...hardcodedIssues, ...firestoreIssues];
  const seenIds = new Set<string>();
  const uniqueCombined: any[] = [];

  rawCombined.forEach((item: any) => {
    const idKey = (item.issueId || item.trackingId || item.id || '').toString();
    if (idKey && !seenIds.has(idKey)) {
      seenIds.add(idKey);
      uniqueCombined.push(item);
    }
  });

  const allIssues = uniqueCombined.map((item: any) => ({
    ...item,
    issueId: item.issueId || item.trackingId || item.id || '',
    category: item.category || item.issueCategory || '',
    severityLevel: typeof item.severityLevel === 'number' ? item.urgencyTier : (item.severityLevel || item.urgencyTier || 'Routine'),
    urgencyTier: item.urgencyTier || (typeof item.severityLevel === 'string' ? item.severityLevel : 'Routine'),
    responsibleDepartment: item.responsibleDepartment || 'Municipal Corporation',
    routingReason: item.routingReason || 'Pre-registered landmark data point',
    estimatedResolutionDays: item.estimatedResolutionDays || 4,
    aiSummary: item.aiSummary || `${item.issueCategory || item.category} detected near ${item.address || 'Chennai'}.`,
    imageUrl: item.imageUrl || '',
    confidenceScore: item.confidenceScore || 90,
    createdAt: item.createdAt || new Date().toISOString(),
  }));

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Wards');
  const [severityFilter, setSeverityFilter] = useState<string>('All Severities');

  // Find the overall newest issue in the list to place the pulsing LIVE indicator
  const sortedNewest = [...allIssues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const newestIssueId = sortedNewest.length > 0 ? sortedNewest[0].issueId : null;

  const categories = ['All Wards', 'Pothole', 'Road Damage', 'Garbage Dump', 'Water Leakage', 'Broken Streetlight', 'Drain Blockage', 'Public Safety Hazard'];
  const severities = ['All Severities', 'Emergency', 'Urgent', 'Important', 'Routine'];

  // Filter issues based on criteria
  const filteredIssues = allIssues.filter(issue => {
    const matchesSearch = 
      (issue.issueId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.responsibleDepartment || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All Wards' || categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All Severities' || severityFilter === 'All' || issue.severityLevel === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Re-initialize map when L is loaded and element exists
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Create Leaflet map instance centered on T Nagar / central Chennai
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [13.0405, 80.2337],
        zoom: 12,
        zoomControl: false
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Add gorgeous premium Dark tiles from CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when issues load or change
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    filteredIssues.forEach(issue => {
      // Determine dot color based on urgencyTier
      let markerColor = '#a855f7'; // fallback
      const urgency = issue.urgencyTier || issue.severityLevel;
      if (urgency === 'Emergency') markerColor = '#EF4444';
      else if (urgency === 'Urgent') markerColor = '#F97316';
      else if (urgency === 'Important') markerColor = '#EAB308';
      else if (urgency === 'Routine') markerColor = '#22C55E';

      const isNewest = issue.issueId === newestIssueId;

      // Define Custom Div Icon for premium styling
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            ${isNewest ? `<div class="absolute w-8 h-8 rounded-full bg-${urgency === 'Emergency' ? 'red' : 'emerald'}-400/20 animate-ping"></div>` : ''}
            <div 
              style="background-color: ${markerColor};" 
              class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg relative z-10 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-125"
            >
              <div class="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Build Marker Popups Content
      const popupHtml = `
        <div class="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 font-sans max-w-[240px]">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">ID: ${issue.issueId}</span>
            ${isNewest ? '<span class="text-[9px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-widest font-mono animate-pulse"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> LIVE</span>' : ''}
          </div>
          <div class="text-sm font-bold text-slate-200 mt-1.5">${issue.category}</div>
          <div class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1 font-mono">Priority Score: ${issue.priorityScore}/100</div>
          <p class="text-[11px] text-slate-500 mt-2 font-mono leading-relaxed truncate">${issue.responsibleDepartment}</p>
        </div>
      `;

      const lat = typeof issue.latitude === 'string' ? parseFloat(issue.latitude) : issue.latitude;
      const lng = typeof issue.longitude === 'string' ? parseFloat(issue.longitude) : issue.longitude;

      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(popupHtml, { closeButton: false, offset: [0, -5] });

        markersRef.current.push(marker);
      }
    });

    // Auto-bounds to fit the markers
    if (filteredIssues.length > 0 && mapInstanceRef.current && markersRef.current.length > 0) {
      try {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [filteredIssues, newestIssueId]);

  const snapToMarker = (issue: Issue) => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    const lat = typeof issue.latitude === 'string' ? parseFloat(issue.latitude) : issue.latitude;
    const lng = typeof issue.longitude === 'string' ? parseFloat(issue.longitude) : issue.longitude;

    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true, duration: 1 });
    }
    
    // Find matching marker and trigger popup
    const targetIdx = filteredIssues.findIndex(i => i.issueId === issue.issueId);
    if (targetIdx !== -1 && markersRef.current[targetIdx]) {
      markersRef.current[targetIdx].openPopup();
    }
  };

  return (
    <div className="w-full relative min-h-[calc(100vh-140px)] flex flex-col lg:flex-row z-10 text-left">
      
      {/* Side search panel */}
      <div className="w-full lg:w-96 flex flex-col justify-between bg-slate-950/90 border-r border-slate-800 backdrop-blur z-20 flex-shrink-0 relative overflow-hidden">
        {/* Background gradient element */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

        {/* Filters */}
        <div className="p-5 space-y-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest font-display text-slate-100">Chennai Regional Grid</h3>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, department or category..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 transition placeholder:text-slate-700 font-medium"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Severity Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* List of filtered points */}
        <div className="flex-grow p-4 space-y-2 overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-extrabold px-1 mb-2">
            <span>Points Listed ({filteredIssues.length})</span>
            <span className="flex items-center gap-1"><Info className="w-3 h-3 text-emerald-500" /> Pulse Indicators Active</span>
          </div>

          {(() => {
            console.log('Issues array:', allIssues);
            console.log('Filtered issues:', filteredIssues);
            return null;
          })()}

          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-600">No active incidents match current criteria filters.</div>
          ) : (
            filteredIssues.map(issue => {
              const isNewest = issue.issueId === newestIssueId;
              return (
                <div 
                  key={issue.issueId}
                  onClick={() => snapToMarker(issue)}
                  className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 cursor-pointer hover:bg-slate-950 transition duration-300 relative group"
                >
                  {isNewest && (
                    <span className="absolute top-3.5 right-3.5 text-[8px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-widest font-mono select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span> LIVE
                    </span>
                  )}

                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">
                      {issue.issueId}
                    </span>
                    <div className="text-xs">
                      <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{issue.category}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{issue.responsibleDepartment}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex justify-between items-center gap-2">
                    <SeverityBadge severity={issue.severityLevel} />
                    
                    <div className="flex items-center gap-1.5">
                      {onVerify && currentUserId && issue.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerify(issue.id!);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 transition text-[9px] font-bold uppercase tracking-wider text-slate-400 disabled:opacity-50"
                          disabled={issue.verifiedBy?.includes(currentUserId) || issue.createdBy === currentUserId || issue.userId === currentUserId}
                        >
                          {issue.verifiedBy?.includes(currentUserId) ? (
                            <span className="text-emerald-400">✓ Verified</span>
                          ) : (issue.createdBy === currentUserId || issue.userId === currentUserId) ? (
                            <span className="text-slate-600">Your report</span>
                          ) : (
                            <span>Verify ({issue.verificationCount || 0})</span>
                          )}
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(issue);
                        }}
                        className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[9px] uppercase tracking-wider transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" /> Escalate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map Box */}
      <div className="flex-grow min-h-[400px] lg:min-h-[auto] relative bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10 min-h-[400px] lg:min-h-full" />
        
        {/* Float Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5 pointer-events-none">
          <div className="p-3 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800/80 shadow-md max-w-xs text-left">
            <h4 className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Telemetry Map Key</h4>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Emergency Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Urgent Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Important Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Routine Level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
