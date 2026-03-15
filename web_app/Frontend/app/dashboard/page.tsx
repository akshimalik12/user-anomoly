"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Activity, Search, Calendar, Shield, ShieldCheck,
  Monitor, MousePointer2, Network, AlertTriangle,
  CheckCircle, X, Clock, Eye, Crosshair,
  Lock, Zap, Terminal, RefreshCw, Sun, Moon,
  Plus, Minus, LocateFixed, ArrowRight, CalendarDays,
  Code, ClipboardPaste, Globe,
  ArrowDown, ArrowUp, BarChart3, Users
} from 'lucide-react';

// --- TYPES ---
export type GeoLocation = {
  lat: number;
  lng: number;
  city: string;
  country: string;
};

export type SessionModules = {
  context: {
    os: string;
    res: string;
    devToolsOpen: boolean;
    match: boolean;
  };
  hci: {
    velocity: string;
    trajectory: string;
    pasteDetected: boolean;
    human: boolean;
    typingWpm: number;
  };
  network: {
    ipType: string;
    proxy: string;
    protocol: string;
    download: string;
    upload: string;
    risk: string;
  };
};

export type Session = {
  id: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
    ip: string;
    attempts?: number;
  };
  status: string;
  verdict: 'Safe' | 'Warning' | 'Critical';
  geo: GeoLocation;
  modules: SessionModules;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

// --- COMPONENTS ---

const StatusBadge = ({ verdict }: { verdict: 'Safe' | 'Warning' | 'Critical' }) => {
  const styles = {
    Safe: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
  };

  const icons = {
    Safe: <CheckCircle size={14} className="mr-1.5" />,
    Warning: <AlertTriangle size={14} className="mr-1.5" />,
    Critical: <Shield size={14} className="mr-1.5" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[verdict]}`}>
      {icons[verdict]}
      {verdict.toUpperCase()}
    </span>
  );
};

interface LiveMapProps extends GeoLocation {
  verdict: 'Safe' | 'Warning' | 'Critical';
  isDarkMode: boolean;
}

// Real Live Map Component
const LiveMap = ({ lat, lng, city, country, verdict, isDarkMode }: LiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      if (!isMounted) return;

      if (mapRef.current && !mapInstance.current && window.L) {
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([lat, lng], 4);

        const tileUrl = isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        tileLayerRef.current = window.L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstance.current);

        const color = verdict === 'Critical' ? '#f43f5e' : verdict === 'Warning' ? '#f59e0b' : '#10b981';

        window.L.circleMarker([lat, lng], {
          radius: 6, fillColor: color, color: color, weight: 2, opacity: 1, fillOpacity: 0.8
        }).addTo(mapInstance.current);

        window.L.circleMarker([lat, lng], {
          radius: 15, fillColor: color, color: 'transparent', weight: 0, opacity: 0, fillOpacity: 0.2
        }).addTo(mapInstance.current);
      } else if (mapInstance.current) {
        mapInstance.current.setView([lat, lng], 4);
        if (tileLayerRef.current) {
          const newTileUrl = isDarkMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
          tileLayerRef.current.setUrl(newTileUrl);
        }
      }
    };

    initMap();

    return () => { isMounted = false; };
  }, [lat, lng, verdict, isDarkMode]);

  const handleZoomIn = () => mapInstance.current?.zoomIn();
  const handleZoomOut = () => mapInstance.current?.zoomOut();
  const handleRecenter = () => mapInstance.current?.setView([lat, lng], 4);

  return (
    <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>

      <div className="absolute top-2 right-2 z-[400] flex flex-col gap-1 shadow-lg">
        <button suppressHydrationWarning onClick={handleZoomIn} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-t text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
        <button suppressHydrationWarning onClick={handleZoomOut} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-b text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 border-t-0 transition-colors">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 right-2 z-[400] shadow-lg">
        <button suppressHydrationWarning onClick={handleRecenter} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors" title="Recenter Location">
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-slate-950/80 backdrop-blur border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded shadow-lg pointer-events-none">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{lat.toFixed(4)}°, {lng.toFixed(4)}°</p>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{city}, {country}</p>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

const SAMPLE_SESSIONS: Session[] = [
  {
    id: "abnormality-001",
    timestamp: "2026-02-26T19:45:00.000Z",
    user: {
      name: "System Administrator (Simulated)",
      role: "Superuser / Root",
      ip: "10.0.0.84",
    },
    status: "Locked",
    verdict: "Critical",
    geo: {
      lat: 34.0522,
      lng: -118.2437,
      city: "Los Angeles",
      country: "USA"
    },
    modules: {
      context: {
        os: "Kali Linux / Headless",
        res: "1920x1080",
        devToolsOpen: true,
        match: false
      },
      hci: {
        velocity: "5200 px/s",
        trajectory: "Inhuman / Instant",
        pasteDetected: true,
        human: false,
        typingWpm: 0
      },
      network: {
        ipType: "Data Center (AWS)",
        proxy: "Shadowsocks VPN",
        protocol: "SSH-Tunnel",
        download: "2.4 GB",
        upload: "1.8 GB",
        risk: "High"
      }
    }
  },
  {
    id: "normal-002",
    timestamp: "2026-02-26T18:00:00.000Z",
    user: {
      name: "Marcus Aurelius",
      role: "Cloud Architect",
      ip: "192.168.1.15",
    },
    status: "Locked",
    verdict: "Safe",
    geo: {
      lat: 48.8566,
      lng: 2.3522,
      city: "Paris",
      country: "France"
    },
    modules: {
      context: {
        os: "macOS Sonoma",
        res: "2880x1800",
        devToolsOpen: false,
        match: true
      },
      hci: {
        velocity: "840 px/s",
        trajectory: "Natural Human",
        pasteDetected: false,
        human: true,
        typingWpm: 68
      },
      network: {
        ipType: "Residential (Orange SA)",
        proxy: "None",
        protocol: "HTTPS/3",
        download: "128 MB",
        upload: "14 MB",
        risk: "Low"
      }
    }
  }
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(SAMPLE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showStats, setShowStats] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Derive the active session live from the sessions array so the side panel auto-updates
  const selectedSession = useMemo(
    () => sessions.find(s => s.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  // WebSocket Integration
  useEffect(() => {
    let socket: WebSocket;
    try {
      socket = new WebSocket('ws://localhost:8000/ws/soc');
      socket.onopen = () => setWsConnected(true);
      socket.onclose = () => setWsConnected(false);
      socket.onerror = () => setWsConnected(false);

      socket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        // Handle SESSION_ENDED: flip any matching Live session to Locked
        if (data.type === "SESSION_ENDED") {
          setSessions(prev => {
            const fingerprint = `${data.ip_address}|${data.os}|${data.resolution}`;
            const idx = prev.findIndex(s =>
              s.user.name === data.username &&
              s.status === 'Live' &&
              `${s.user.ip}|${s.modules.context.os}|${s.modules.context.res}` === fingerprint
            );
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], status: 'Locked' };
            return updated;
          });
          return;
        }

        const newSession: Session = {
          id: `live-${data.username}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: {
            name: data.username || "Unknown",
            role: data.type === "FINAL_EVALUATION" ? "User" : "Streaming...",
            ip: data.ip_address,
            attempts: data.attempts || 1
          },
          status: data.type === "LIVE_UPDATE" ? "Live" : "Locked",
          verdict: (data.risk_status || "").toString().toUpperCase().includes("CRITICAL") ? "Critical" :
            (data.risk_status || "").toString().toUpperCase().includes("WARNING") || data.risk_status?.includes("ANOMALY") ? "Warning" : "Safe",
          geo: {
            lat: data.lat || 0,
            lng: data.lon || 0,
            city: "Detected",
            country: "Live"
          },
          modules: {
            context: {
              os: data.os || "Unknown",
              res: data.resolution || "Unknown",
              devToolsOpen: data.tab_switch_count > 2,
              // Fingerprint match: true only if this is a known returning device (live injections are always unverified)
              match: data.type !== "LIVE_UPDATE" && !data.risk_status?.includes("ANOMALY")
            },
            hci: {
              velocity: `${data.mouse_velocity || 0} px/s`,
              trajectory: data.mouse_velocity > 2000 ? "Erratic / Inhuman" : "Natural Human",
              pasteDetected: data.avg_keystroke_delay < 0.05,
              // Human: false if bot indicators are present
              human: data.mouse_velocity <= 3000 && data.avg_keystroke_delay >= 0.05 && !data.risk_status?.includes("ANOMALY"),
              typingWpm: data.typing_wpm || (data.avg_keystroke_delay > 0 ? Math.round((60 / data.avg_keystroke_delay) / 5) : 0)
            },
            network: {
              // IP type: private/datacenter ranges → Data Center, otherwise Residential
              ipType: (() => {
                const ip = data.ip_address || "";
                if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.") || ip.startsWith("0.")) return "Private / Internal";
                if (data.risk_status?.includes("ANOMALY") || data.mouse_velocity > 3000) return "Data Center / Hosting";
                return "Residential ISP";
              })(),
              // Proxy: detect from active processes
              proxy: (() => {
                const procs = data.active_processes || "";
                if (procs.includes("Tor")) return "Tor Network";
                if (procs.includes("Wireshark") || procs.includes("nmap")) return "Packet Sniffer";
                if (procs.includes("Burp")) return "Burp Suite Proxy";
                if (procs.includes("VPN")) return "VPN Detected";
                return "None";
              })(),
              protocol: data.protocol || "WSS",
              download: formatBytes(data.bytes_received || 0),
              upload: formatBytes(data.bytes_sent || 0),
              // Risk: High for anomaly, high data, suspicious location, or high mouse velocity
              risk: (
                data.risk_status?.includes("ANOMALY") ||
                data.risk_status?.includes("unknown_location") ||
                (data.bytes_sent || 0) > 100_000_000 ||
                data.mouse_velocity > 3000
              ) ? "High" : (data.mouse_velocity > 1500 || (data.bytes_sent || 0) > 10_000_000) ? "Medium" : "Low"
            }
          }
        };

        // Fingerprint = IP + OS + Resolution. Same fingerprint = same session (update in-place).
        const fingerprint = `${data.ip_address}|${data.os}|${data.resolution}`;

        setSessions((prev) => {
          // Only merge into an actively LIVE session — never overwrite a Locked/completed session
          const existingIdx = prev.findIndex(s =>
            s.user.name === newSession.user.name &&
            s.status === 'Live' &&
            s.id.startsWith('live-') &&
            `${s.user.ip}|${s.modules.context.os}|${s.modules.context.res}` === fingerprint
          );
          if (existingIdx !== -1) {
            // Update existing live session in-place
            const updated = [...prev];
            updated[existingIdx] = { ...newSession, id: prev[existingIdx].id, timestamp: prev[existingIdx].timestamp };
            return updated;
          }
          // No matching live session found — this is a new session (fresh login)
          return [newSession, ...prev];
        });
      };
    } catch { setWsConnected(false); }

    return () => { try { socket?.close(); } catch { } };
  }, []);

  // Poll Mock DB for Prototype Logins
  useEffect(() => {
    const pollDb = async () => {
      try {
        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GET_SESSIONS' })
        });
        const data = await res.json();

        if (data.success && data.sessions) {
          setSessions(prev => {
            const updated = [...prev];
            let changed = false;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.sessions.forEach((s: any) => {
              const isAnomaly = s.telemetry?.risk_status?.some((r: string) => r.includes("ANOMALY") || r.includes("UNKNOWN"));
              const riskStr = s.telemetry?.risk_status?.join(" ").toUpperCase() || "";
              let verdict: "Safe" | "Warning" | "Critical" = "Safe";
              if (riskStr.includes("CRITICAL")) verdict = "Critical";
              else if (riskStr.includes("WARNING") || isAnomaly) verdict = "Warning";

              const newSession: Session = {
                id: s.id,
                timestamp: s.timestamp,
                user: {
                  name: s.username,
                  role: s.status === "Brute-Force Attempt" ? "Brute-Force Attempt" : "Prototype User",
                  ip: s.telemetry?.ip_address || "Unknown",
                  attempts: s.attempts
                },
                status: s.status === "Brute-Force Attempt" ? "Login Failed" : "Locked",
                verdict: verdict,
                geo: {
                  lat: s.telemetry?.lat || 0,
                  lng: s.telemetry?.lon || 0,
                  city: "Detected",
                  country: "Live"
                },
                modules: {
                  context: {
                    os: s.telemetry?.os || "Unknown",
                    res: s.telemetry?.resolution || "Unknown",
                    devToolsOpen: s.telemetry?.tab_switch_count > 2 || false,
                    match: !isAnomaly && (s.telemetry?.avg_keystroke_delay || 1) >= 0.05
                  },
                  hci: {
                    velocity: `${s.telemetry?.mouse_velocity || 0} px/s`,
                    trajectory: (s.telemetry?.mouse_velocity || 0) > 2000 ? "Erratic / Inhuman" : "Natural Human",
                    pasteDetected: (s.telemetry?.avg_keystroke_delay || 1) < 0.05,
                    human: (s.telemetry?.mouse_velocity || 0) <= 3000 && (s.telemetry?.avg_keystroke_delay || 1) >= 0.05 && !isAnomaly,
                    typingWpm: s.telemetry?.typing_wpm || ((s.telemetry?.avg_keystroke_delay || 0) > 0 ? Math.round((60 / s.telemetry.avg_keystroke_delay) / 5) : 0)
                  },
                  network: {
                    ipType: (() => {
                      const ip = s.telemetry?.ip_address || "";
                      if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return "Private / Internal";
                      if (isAnomaly || (s.telemetry?.mouse_velocity || 0) > 3000) return "Data Center / Hosting";
                      return "Residential ISP";
                    })(),
                    proxy: (() => {
                      const procs = s.telemetry?.active_processes || "";
                      if (procs.includes("Tor")) return "Tor Network";
                      if (procs.includes("Wireshark") || procs.includes("nmap")) return "Packet Sniffer";
                      if (procs.includes("Burp")) return "Burp Suite Proxy";
                      return "None";
                    })(),
                    protocol: s.telemetry?.protocol || "HTTPS",
                    download: formatBytes(s.telemetry?.bytes_received || 0),
                    upload: formatBytes(s.telemetry?.bytes_sent || 0),
                    risk: (
                      isAnomaly ||
                      s.telemetry?.risk_status?.includes("unknown_location") ||
                      (s.telemetry?.bytes_sent || 0) > 100_000_000 ||
                      (s.telemetry?.mouse_velocity || 0) > 3000
                    ) ? "High" : ((s.telemetry?.mouse_velocity || 0) > 1500 || (s.telemetry?.bytes_sent || 0) > 10_000_000) ? "Medium" : "Low"
                  }
                }
              };

              // Match by ID first, then by username+fingerprint to avoid duplicates
              const existingIndex = updated.findIndex(u => u.id === newSession.id);
              const dbFingerprint = `${newSession.user.ip}|${newSession.modules.context.os}|${newSession.modules.context.res}`;

              if (existingIndex !== -1) {
                // Completely replace the object reference to trigger UI re-render of status
                updated[existingIndex] = { ...newSession, id: newSession.id };
                changed = true;
              } else {
                // Check if there's a live session with same username + same device fingerprint
                const fpIndex = updated.findIndex(u =>
                  u.user.name === newSession.user.name &&
                  `${u.user.ip}|${u.modules.context.os}|${u.modules.context.res}` === dbFingerprint &&
                  u.status === 'Live'
                );

                if (fpIndex !== -1) {
                  // Upgrade the Live session to the Locked DB record 
                  updated[fpIndex] = { ...newSession, id: newSession.id }; // Overwrite with new Locked status and DB ID
                  changed = true;
                } else {
                  updated.unshift(newSession);
                  changed = true;
                }
              }
            });
            return changed ? updated : prev;
          });
        }
      } catch (err) {
        // ignore
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollDb, 3000);
    pollDb(); // initial call
    return () => clearInterval(interval);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleRowClick = (session: Session) => {
    setSelectedSessionId(session.id);
    setIsPanelOpen(true);
  };

  const applyCustomDate = () => {
    if (customStart && customEnd) {
      const startObj = new Date(customStart);
      const endObj = new Date(customEnd);

      const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const startStr = startObj.toLocaleDateString(undefined, formatOptions);
      const endStr = endObj.toLocaleDateString(undefined, formatOptions);

      setTimeRange(`${startStr} - ${endStr}`);
    }
    setIsCustomModalOpen(false);
  };

  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter((s: Session) => {
      const matchesSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) ||
        s.user.ip.includes(search);
      const matchesRisk = filterRisk === 'All' || s.verdict === filterRisk;

      let matchesTime = true;
      const sessionTime = new Date(s.timestamp).getTime();
      const now = new Date().getTime();

      if (timeRange === 'Last 1 Hour') {
        matchesTime = sessionTime >= now - (60 * 60 * 1000);
      } else if (timeRange === 'Last 24 Hours') {
        matchesTime = sessionTime >= now - (24 * 60 * 60 * 1000);
      } else if (timeRange === 'Last 7 Days') {
        matchesTime = sessionTime >= now - (7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'Last 30 Days') {
        matchesTime = sessionTime >= now - (30 * 24 * 60 * 60 * 1000);
      } else if (customStart && customEnd && timeRange.includes('-')) {
        const start = new Date(customStart).getTime();
        const end = new Date(customEnd).getTime();
        matchesTime = sessionTime >= start && sessionTime <= end;
      }

      return matchesSearch && matchesRisk && matchesTime;
    });

    return filtered;
  }, [search, filterRisk, timeRange, customStart, customEnd, sessions]);

  // --- ANALYTICS COMPUTED DATA ---
  const analytics = useMemo(() => {
    const verdicts = { Safe: 0, Warning: 0, Critical: 0 };
    const ipGroups: Record<string, { count: number; users: string[]; worstVerdict: string }> = {};
    const userTargets: Record<string, { attempts: number; verdict: string }> = {};
    const threatTypes = { bot: 0, vpnProxy: 0, devTools: 0, pasteInput: 0, highData: 0, bruteForce: 0 };
    const locationGroups: Record<string, { count: number; city: string; country: string; verdicts: string[] }> = {};

    filteredSessions.forEach(s => {
      verdicts[s.verdict]++;

      // IP grouping
      const ip = s.user.ip;
      if (!ipGroups[ip]) ipGroups[ip] = { count: 0, users: [], worstVerdict: 'Safe' };
      ipGroups[ip].count++;
      if (!ipGroups[ip].users.includes(s.user.name)) ipGroups[ip].users.push(s.user.name);
      if (s.verdict === 'Critical') ipGroups[ip].worstVerdict = 'Critical';
      else if (s.verdict === 'Warning' && ipGroups[ip].worstVerdict !== 'Critical') ipGroups[ip].worstVerdict = 'Warning';

      // User targeting
      if (!userTargets[s.user.name]) userTargets[s.user.name] = { attempts: 0, verdict: 'Safe' };
      userTargets[s.user.name].attempts += (s.user.attempts || 1);
      if (s.verdict === 'Critical') userTargets[s.user.name].verdict = 'Critical';
      else if (s.verdict === 'Warning' && userTargets[s.user.name].verdict !== 'Critical') userTargets[s.user.name].verdict = 'Warning';

      // Threat types
      if (!s.modules.hci.human) threatTypes.bot++;
      if (s.modules.network.proxy !== 'None') threatTypes.vpnProxy++;
      if (s.modules.hci.pasteDetected) threatTypes.pasteInput++;
      if (s.modules.network.risk === 'High') threatTypes.highData++;
      if ((s.user.attempts || 0) >= 3) threatTypes.bruteForce++;

      // Location grouping
      const locKey = `${s.geo.city}-${s.geo.country}`;
      if (!locationGroups[locKey]) locationGroups[locKey] = { count: 0, city: s.geo.city, country: s.geo.country, verdicts: [] };
      locationGroups[locKey].count++;
      locationGroups[locKey].verdicts.push(s.verdict);
    });

    const uniqueIps = Object.keys(ipGroups).length;
    const bruteForceUsers = Object.values(userTargets).filter(u => u.attempts > 3).length;
    const totalSessions = filteredSessions.length;
    const criticalCount = verdicts.Critical;

    // Sort IP groups by count desc
    const sortedIps = Object.entries(ipGroups).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
    const sortedUsers = Object.entries(userTargets).sort((a, b) => b[1].attempts - a[1].attempts).slice(0, 6);
    const sortedLocations = Object.entries(locationGroups).sort((a, b) => b[1].count - a[1].count).slice(0, 6);

    return { verdicts, ipGroups, userTargets, threatTypes, uniqueIps, bruteForceUsers, totalSessions, criticalCount, sortedIps, sortedUsers, sortedLocations, locationGroups };
  }, [filteredSessions]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden transition-colors duration-300">

      {/* --- 1. GLOBAL CONTROLS & HEADER LAYER --- */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-10 shrink-0 hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span>Neurometric<span className="text-blue-500">Shield</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-300 ${wsConnected ? 'bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800' : 'bg-rose-100 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50'}`}>
            <span className="relative flex h-2.5 w-2.5">
              {wsConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${wsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`text-xs font-mono font-bold ${wsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{wsConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>

          <button
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Toggle Theme"
          >
            {mounted ? (isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* --- FILTER & CONTROL BAR --- */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0B0F19] px-6 flex items-center justify-between z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search user or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-64 transition-all"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1 transition-colors duration-300">
            {['All', 'Safe', 'Warning', 'Critical'].map(level => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterRisk === level
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="truncate max-w-[200px]">{timeRange}</span>
            </button>

            {isTimeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTimeDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                  {['Last 1 Hour', 'Last 24 Hours', 'Last 7 Days', 'Last 30 Days'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${timeRange === range ? 'bg-blue-50 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      {range}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800"></div>
                  <button
                    onClick={() => {
                      setIsCustomModalOpen(true);
                      setIsTimeDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between"
                  >
                    Custom Range...
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            className="flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-500/30 w-9 h-9 rounded-lg text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all group shadow-sm"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* --- 2. MAIN MONITORING VIEW (Surface Level) --- */}
        <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isPanelOpen ? 'pr-[420px]' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              Active Behavior Telemetry
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${showStats ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <BarChart3 className="w-4 h-4" />
                {showStats ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                {filteredSessions.length} SESSION{filteredSessions.length !== 1 && 'S'} FOUND
              </span>
              <div className="text-sm font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {mounted ? `${currentTime.toISOString().replace('T', ' ').substr(0, 19)} UTC` : 'Loading...'}
              </div>
            </div>
          </div>

          {/* ═══ KPI SUMMARY CARDS ═══ */}
          {showStats && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Sessions', value: analytics.totalSessions, icon: <Activity className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { label: 'Critical Alerts', value: analytics.criticalCount, icon: <Shield className="w-5 h-5" />, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
                  { label: 'Unique IPs', value: analytics.uniqueIps, icon: <Globe className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { label: 'Brute-force Users', value: analytics.bruteForceUsers, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map((kpi, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${kpi.bg} bg-white dark:bg-[#111827] transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`${kpi.color}`}>{kpi.icon}</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* ═══ ANALYTICS CHARTS ROW ═══ */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

                {/* --- Verdict Distribution Donut --- */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Verdict Distribution
                  </h3>
                  <div className="flex items-center justify-center">
                    {(() => {
                      const { Safe, Warning, Critical } = analytics.verdicts;
                      const total = Safe + Warning + Critical || 1;
                      const safeAngle = (Safe / total) * 360;
                      const warnAngle = (Warning / total) * 360;
                      const critAngle = (Critical / total) * 360;

                      const polarToCart = (cx: number, cy: number, r: number, deg: number) => {
                        const rad = (deg - 90) * Math.PI / 180;
                        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
                      };

                      const arc = (cx: number, cy: number, r: number, start: number, end: number) => {
                        if (end - start >= 360) end = start + 359.99;
                        const s = polarToCart(cx, cy, r, start);
                        const e = polarToCart(cx, cy, r, end);
                        const large = end - start > 180 ? 1 : 0;
                        return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
                      };

                      let offset = 0;
                      const slices = [
                        { val: Safe, color: '#10b981', label: 'Safe' },
                        { val: Warning, color: '#f59e0b', label: 'Warning' },
                        { val: Critical, color: '#f43f5e', label: 'Critical' },
                      ].filter(s => s.val > 0);

                      return (
                        <div className="flex items-center gap-6">
                          <svg viewBox="0 0 120 120" className="w-28 h-28">
                            {slices.map((sl, i) => {
                              const angle = (sl.val / total) * 360;
                              const path = arc(60, 60, 50, offset, offset + angle);
                              offset += angle;
                              return <path key={i} d={path} fill={sl.color} opacity={0.85} />;
                            })}
                            <circle cx="60" cy="60" r="28" className="fill-white dark:fill-[#111827]" />
                            <text x="60" y="58" textAnchor="middle" className="fill-slate-900 dark:fill-white text-lg font-bold" fontSize="18">{total}</text>
                            <text x="60" y="72" textAnchor="middle" className="fill-slate-500" fontSize="8">total</text>
                          </svg>
                          <div className="space-y-2">
                            {slices.map((sl, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sl.color }}></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">{sl.label}: <span className="font-bold text-slate-900 dark:text-white">{sl.val}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* --- IP Threat Grouping --- */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" /> Sessions by IP Address
                  </h3>
                  <div className="space-y-2.5">
                    {analytics.sortedIps.length === 0 && <p className="text-xs text-slate-500">No data</p>}
                    {analytics.sortedIps.map(([ip, data], i) => {
                      const maxCount = analytics.sortedIps[0]?.[1]?.count || 1;
                      const pct = (data.count / maxCount) * 100;
                      const barColor = data.worstVerdict === 'Critical' ? 'bg-rose-500' : data.worstVerdict === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500';
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{ip}</span>
                            <span className="text-slate-500">{data.count} session{data.count > 1 ? 's' : ''} • {data.users.length} user{data.users.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* --- Top Targeted Users --- */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" /> Top Targeted Users
                  </h3>
                  <div className="space-y-2.5">
                    {analytics.sortedUsers.length === 0 && <p className="text-xs text-slate-500">No data</p>}
                    {analytics.sortedUsers.map(([name, data], i) => {
                      const maxAttempts = analytics.sortedUsers[0]?.[1]?.attempts || 1;
                      const pct = (data.attempts / maxAttempts) * 100;
                      const barColor = data.verdict === 'Critical' ? 'bg-rose-500' : data.verdict === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500';
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{name}</span>
                            <span className="text-slate-500 font-mono">{data.attempts} attempts</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ═══ THREAT BREAKDOWN + LOCATION ROW ═══ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Threat Type Breakdown */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-500" /> Threat Type Breakdown
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Bot / Script', count: analytics.threatTypes.bot, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
                      { label: 'VPN / Proxy', count: analytics.threatTypes.vpnProxy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                      { label: 'DevTools Open', count: analytics.threatTypes.devTools, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                      { label: 'Paste Input', count: analytics.threatTypes.pasteInput, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                      { label: 'High Data Tx', count: analytics.threatTypes.highData, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                      { label: 'Brute Force', count: analytics.threatTypes.bruteForce, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
                    ].map((t, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${t.color} text-center`}>
                        <div className="text-xl font-bold">{t.count}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Clustering */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-500" /> Login Clusters by Location
                  </h3>
                  <div className="space-y-2">
                    {analytics.sortedLocations.length === 0 && <p className="text-xs text-slate-500">No data</p>}
                    {analytics.sortedLocations.map(([key, data], i) => {
                      const hasCritical = data.verdicts.includes('Critical');
                      const hasWarning = data.verdicts.includes('Warning');
                      return (
                        <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${hasCritical ? 'bg-rose-500/5 border-rose-500/20' : hasWarning ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                          }`}>
                          <div className="flex items-center gap-2">
                            <Crosshair className={`w-3.5 h-3.5 ${hasCritical ? 'text-rose-500' : hasWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{data.city}, {data.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500">{data.count} session{data.count > 1 ? 's' : ''}</span>
                            {hasCritical && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl dark:shadow-2xl transition-colors duration-300 flex-shrink-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold transition-colors duration-300">
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">Identity Summary</th>
                  <th className="p-4">Attempts</th>
                  <th className="p-4">Session Status</th>
                  <th className="p-4">Unified AI Verdict</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredSessions.map((session: Session) => (
                  <tr
                    key={session.id}
                    onClick={() => handleRowClick(session)}
                    className={`group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${selectedSession?.id === session.id ? 'bg-blue-50/50 dark:bg-slate-800/50 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                        {session.timestamp.split('T')[1].substring(0, 8)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {session.timestamp.split('T')[0]}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                          {session.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{session.user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{session.user.ip}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            <span>{session.user.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const attempts = session.user.attempts || 1;
                        const color = attempts > 5 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse' : attempts > 3 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                        return (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
                            {attempts}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      {session.status === 'Live' ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 w-max px-2 py-1 rounded border border-blue-200 dark:border-blue-500/20">
                          <Activity className="w-3.5 h-3.5" /> Live Stream
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-max px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          <Lock className="w-3.5 h-3.5" /> Locked / Final
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge verdict={session.verdict} />
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button suppressHydrationWarning className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 rounded-lg flex items-center gap-2 ml-auto text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Analyze</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Search className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-base font-medium">No telemetry matches your filters.</p>
                        <p className="text-sm mt-1 opacity-70">Try expanding your time range or clearing the search query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- 3. DEEP DIVE VIEW (Side-Panel) --- */}
        <div
          className={`absolute top-0 right-0 h-full w-[420px] bg-white dark:bg-[#0d1320] border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedSession && (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 transition-colors">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Telemetry Deep Dive
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">ID: {selectedSession.id}</p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* User Context Summary */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-white font-bold border border-slate-500 dark:border-slate-600 shadow-inner">
                      {selectedSession.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{selectedSession.user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedSession.user.role} • {selectedSession.user.ip}</p>
                      {(selectedSession.user.attempts && selectedSession.user.attempts > 1) ? (
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 w-max px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {selectedSession.user.attempts} Failed Login Attempts
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge verdict={selectedSession.verdict} />
                </div>

                {/* Geospatial Visualization */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5" /> Location Intelligence
                  </h3>
                  <LiveMap {...selectedSession.geo} verdict={selectedSession.verdict} isDarkMode={isDarkMode} />
                </div>

                {/* --- MODULE 1: CONTEXT & IDENTITY AI --- */}
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/30">
                    <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Device Context & Fingerprint</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Operating System</p>
                        <p className="text-sm text-slate-800 dark:text-slate-300 font-medium mt-0.5">{selectedSession.modules.context.os}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Screen Resolution</p>
                        <p className="text-sm text-slate-800 dark:text-slate-300 font-medium mt-0.5">{selectedSession.modules.context.res}</p>
                      </div>
                    </div>



                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Fingerprint Match:</span>
                      {selectedSession.modules.context.match ? (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">CONFIRMED</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/20">SPOOFED</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- MODULE 2: HCI BEHAVIOR AI --- */}
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/30">
                    <MousePointer2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Behavioral Biometrics</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Avg Typing Speed + Mouse Speed */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Avg Typing Speed</p>
                        <p className={`text-sm font-mono font-bold mt-0.5 ${selectedSession.modules.hci.typingWpm === 0
                          ? 'text-slate-400 dark:text-slate-500'
                          : selectedSession.modules.hci.typingWpm > 120
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {selectedSession.modules.hci.typingWpm > 0 ? `${selectedSession.modules.hci.typingWpm} WPM` : '— WPM'}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Mouse Speed</p>
                        <p className="text-sm text-slate-800 dark:text-slate-300 font-mono mt-0.5">{selectedSession.modules.hci.velocity}</p>
                      </div>
                    </div>

                    {/* Paste Detection */}
                    <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <ClipboardPaste className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">Input Cadence</span>
                      </div>
                      {selectedSession.modules.hci.pasteDetected ? (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">INSTANT PASTE</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">NATURAL TYPING</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Predicted Agent:</span>
                      {selectedSession.modules.hci.human ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">HUMAN USER</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1"><Terminal className="w-3 h-3" /> AUTOMATED SCRIPT</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- MODULE 3: NETWORK & IP REPUTATION --- */}
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/30">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Network & IP Intelligence</h3>
                  </div>
                  <div className="p-4 space-y-4">

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Origin Network</p>
                        <p className="text-sm text-slate-900 dark:text-slate-200 font-medium mt-0.5">{selectedSession.modules.network.ipType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Transport</p>
                        <p className="text-sm text-slate-800 dark:text-slate-300 mt-0.5">{selectedSession.modules.network.protocol}</p>
                      </div>
                    </div>

                    {/* NEW: Data Transfer Row (Rx/Tx) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Rx (Download)</p>
                          <p className="text-sm text-slate-800 dark:text-slate-300 font-mono mt-0.5">{selectedSession.modules.network.download}</p>
                        </div>
                        <ArrowDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Tx (Upload)</p>
                          <p className="text-sm text-slate-800 dark:text-slate-300 font-mono mt-0.5">{selectedSession.modules.network.upload}</p>
                        </div>
                        <ArrowUp className={`w-4 h-4 ${parseFloat(selectedSession.modules.network.upload) > 50 && selectedSession.modules.network.upload.includes('MB') ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-purple-600 dark:text-purple-400'}`} />
                      </div>
                    </div>

                    {/* Proxy/VPN Detection */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5" /> Connection Routing
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2.5 py-1 rounded border font-medium ${selectedSession.modules.network.proxy !== 'None'
                          ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                          }`}>
                          {selectedSession.modules.network.proxy.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Exfiltration / Network Risk:</span>
                      <span className={`text-xs font-bold ${selectedSession.modules.network.risk === 'High' ? 'text-rose-600 dark:text-rose-400' : selectedSession.modules.network.risk === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {selectedSession.modules.network.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

      </main>

      {/* --- ENHANCED CUSTOM DATE MODAL --- */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCustomModalOpen(false)}
          ></div>

          <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden transform transition-all">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500"></div>

            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Custom Time Range</h3>
                  <p className="text-xs text-slate-500">Select a precise date and time window</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="px-6 pt-5 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Presets</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Last Hour', hours: 1 },
                  { label: 'Last 12h', hours: 12 },
                  { label: 'Last 24h', hours: 24 },
                  { label: 'Last 7d', hours: 168 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      const end = new Date();
                      const start = new Date(end.getTime() - preset.hours * 60 * 60 * 1000);
                      setCustomStart(start.toISOString().slice(0, 16));
                      setCustomEnd(end.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm"
                  />
                </div>
                <div className="pt-6">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 relative">
                  <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {customStart && customEnd && new Date(customStart) <= new Date(customEnd) && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-bold">Duration:</span>{' '}
                    {(() => {
                      const diff = new Date(customEnd).getTime() - new Date(customStart).getTime();
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      return `${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m`;
                    })()}
                  </p>
                </div>
              )}

              {customStart && customEnd && new Date(customStart) > new Date(customEnd) && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Start date must be before end date.</p>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomDate}
                disabled={!customStart || !customEnd || new Date(customStart) > new Date(customEnd)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}