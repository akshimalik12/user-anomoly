"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Upload, Download, MousePointer2, Network, ShieldAlert, ShieldCheck, CheckCircle, Activity,
  PowerOff, Users, MapPin, Globe, Crosshair, Gauge, Zap, ChevronDown, ChevronRight, AlertTriangle,
  Mail, Star, Inbox, Send, Trash2, FileText, Paperclip, Clock, File, Sun, Moon
} from "lucide-react";

type UserEntry = {
  username: string;
  email: string;
  attempts: number;
  lastIp: string;
  lastLocation: { lat: number; lon: number } | null;
  riskStatus: string[];
  trustedLocations?: { lat: number; lon: number; label?: string }[];
};

const PRESET_LOCATIONS = [
  { label: "Moscow, Russia", lat: 55.7558, lon: 37.6173 },
  { label: "Beijing, China", lat: 39.9042, lon: 116.4074 },
  { label: "Pyongyang, North Korea", lat: 39.0392, lon: 125.7625 },
  { label: "Tehran, Iran", lat: 35.6892, lon: 51.3890 },
  { label: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
  { label: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
  { label: "New York, USA", lat: 40.7128, lon: -74.0060 },
  { label: "London, UK", lat: 51.5074, lon: -0.1278 },
  { label: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  { label: "Custom Location", lat: 0, lon: 0 },
];

const DOWNLOADABLE_FILES = [
  { name: "Q4_Financial_Report.pdf", size: 4200000, type: "application/pdf", category: "Reports" },
  { name: "Employee_Directory.csv", size: 850000, type: "text/csv", category: "HR Data" },
  { name: "Server_Access_Logs.json", size: 12500000, type: "application/json", category: "IT Logs" },
  { name: "Client_Database_Backup.sql", size: 28000000, type: "application/sql", category: "Database" },
  { name: "Network_Topology_Map.png", size: 2100000, type: "image/png", category: "Infrastructure" },
  { name: "API_Keys_Production.env", size: 3200, type: "text/plain", category: "Credentials" },
];

const MOCK_EMAILS = [
  { id: 1, from: "sarah.chen@company.com", subject: "Q4 Budget Review — Action Required", preview: "Hi team, please review the attached Q4 budget. We need final approvals by EOD Friday...", time: "10:32 AM", starred: true, unread: true },
  { id: 2, from: "devops-alerts@company.com", subject: "⚠️ Server CPU Usage Above 90%", preview: "Alert: Production server us-east-1 has exceeded CPU threshold. Current usage: 94.2%...", time: "9:15 AM", starred: false, unread: true },
  { id: 3, from: "hr@company.com", subject: "Updated Remote Work Policy", preview: "Dear all, please find the updated remote work policy effective next month. Key changes include...", time: "Yesterday", starred: false, unread: false },
  { id: 4, from: "mike.johnson@company.com", subject: "Re: Project Deadline Extension", preview: "Thanks for the update. I've spoken with the client and they're okay with pushing to next week...", time: "Yesterday", starred: true, unread: false },
  { id: 5, from: "security@company.com", subject: "Monthly Security Audit Report", preview: "Attached is the security audit for November. 3 critical vulnerabilities were found and patched...", time: "Mon", starred: false, unread: false },
  { id: 6, from: "jennifer.lee@company.com", subject: "Team Lunch Friday?", preview: "Hey! Want to do a team lunch this Friday? I was thinking that new Thai place on 5th street...", time: "Mon", starred: false, unread: false },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PrototypePage() {
  const [authStep, setAuthStep] = useState<"login" | "otp">("login");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [bruteForceReported, setBruteForceReported] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Simulator
  const [activeProcesses, setActiveProcesses] = useState("Outlook, Excel, Chrome (Google)");
  const [status, setStatus] = useState("Awaiting Login Initialization...");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Email UI
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");

  // Upload/Download state
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Injection Controls
  const [userList, setUserList] = useState<UserEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [spoofIp, setSpoofIp] = useState("");
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(-1);
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [mouseVelocityOverride, setMouseVelocityOverride] = useState(800);
  const [keystrokeDelayOverride, setKeystrokeDelayOverride] = useState(0.12);
  const [loginAttemptOverride, setLoginAttemptOverride] = useState(1);
  const [isBotMode, setIsBotMode] = useState(false);
  const [isInjectionEnabled, setIsInjectionEnabled] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["identity"]));

  // Threshold configuration (editable by user)
  const [threshBotMouseVel, setThreshBotMouseVel] = useState(3000);   // px/s above this = bot
  const [threshBotKeyDelay, setThreshBotKeyDelay] = useState(0.05);   // s below this = bot
  const [threshSuspAttempts, setThreshSuspAttempts] = useState(3);    // attempts >= this = suspicious
  const [threshBruteAttempts, setThreshBruteAttempts] = useState(6);  // attempts >= this = brute force
  const [threshHighDataMb, setThreshHighDataMb] = useState(50);       // MB upload >= this = high data

  // Custom data simulation (MB to override bytes_sent / bytes_received in stream)
  const [simUploadMb, setSimUploadMb] = useState(0);    // 0 = use real bytes
  const [simDownloadMb, setSimDownloadMb] = useState(0); // 0 = use real bytes

  // Injection send state
  const [sendingInjection, setSendingInjection] = useState(false);
  const [lastInjectionResult, setLastInjectionResult] = useState<{ verdict: string; color: string } | null>(null);

  // Refs
  const trackData = useRef({
    ip: "Fetching...", lat: 0.0, lon: 0.0, os: "Unknown",
    tabSwitches: 0, mouseVelocity: 0, mouseVelocitySamples: [] as number[], totalBytes: 0, downloadedBytes: 0,
    keystrokeDelays: [] as number[], keystrokeCount: 0
  });
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  const lastKeyTime = useRef<number | null>(null);
  const typingStartTime = useRef<number | null>(null); // When the user started typing this session
  const wsRef = useRef<WebSocket | null>(null);
  const isSubmittedRef = useRef(false);

  // Init hardware & network
  useEffect(() => {
    trackData.current.os = navigator.platform || navigator.userAgent;
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(data => { trackData.current.ip = data.ip; })
      .catch(() => { trackData.current.ip = "Unavailable"; });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { trackData.current.lat = pos.coords.latitude; trackData.current.lon = pos.coords.longitude; setLocationError(false); },
        () => { setLocationError(true); }
      );
    } else { setLocationError(true); }
  }, []);

  // Fetch users for injection
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "GET_USERS" }) });
      const data = await res.json();
      if (data.success && data.users) setUserList(data.users);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Compute live verdict based on current injection settings vs user-configured thresholds
  const computeVerdictPreview = () => {
    const vel = isBotMode ? 8500 : mouseVelocityOverride;
    const delay = isBotMode ? 0.005 : keystrokeDelayOverride;
    const attempts = loginAttemptOverride;
    const isBot = vel > threshBotMouseVel || delay < threshBotKeyDelay;
    const isBruteForce = attempts >= threshBruteAttempts;
    const isSuspicious = attempts >= threshSuspAttempts && attempts < threshBruteAttempts;
    const bytesMB = (trackData.current.totalBytes) / (1024 * 1024);
    const isHighData = bytesMB >= threshHighDataMb;

    if (isBruteForce || isSuspicious || isHighData) return { verdict: "⚠ WARNING — MFA Required", color: "#f59e0b", cls: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" };
    if (isBot) return { verdict: "🔴 CRITICAL — Bot Detected", color: "#dc2626", cls: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400" };
    return { verdict: "✅ SAFE — Human Authenticated", color: "#16a34a", cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" };
  };

  // Manual one-shot injection — fires directly to evaluate endpoint with current values + thresholds
  const handleSendInjection = async () => {
    setSendingInjection(true);
    setLastInjectionResult(null);
    const loc = selectedLocationIdx >= 0 ? PRESET_LOCATIONS[selectedLocationIdx] : null;
    const isCustomLoc = loc?.label === "Custom Location";
    const injPayload = {
      username: selectedUser || username || "injected_user",
      ip_address: spoofIp || trackData.current.ip,
      lat: loc ? (isCustomLoc ? parseFloat(customLat) || 0 : loc.lat) : trackData.current.lat,
      lon: loc ? (isCustomLoc ? parseFloat(customLon) || 0 : loc.lon) : trackData.current.lon,
      os: trackData.current.os || "Unknown",
      resolution: `${window.innerWidth}x${window.innerHeight}`,
      avg_keystroke_delay: isBotMode ? 0.005 : keystrokeDelayOverride,
      mouse_velocity: isBotMode ? 8500 : mouseVelocityOverride,
      tab_switch_count: loginAttemptOverride > threshSuspAttempts ? 5 : 0,
      bytes_sent: trackData.current.totalBytes,
      bytes_received: trackData.current.downloadedBytes,
      active_processes: activeProcesses,
      attempts: loginAttemptOverride,
      login_attempts_override: loginAttemptOverride,
      // Pass thresholds so backend can use them dynamically
      custom_thresholds: {
        bot_mouse_velocity: threshBotMouseVel,
        bot_keystroke_delay: threshBotKeyDelay,
        suspicious_attempts: threshSuspAttempts,
        brute_force_attempts: threshBruteAttempts,
        high_data_mb: threshHighDataMb
      }
    };
    try {
      const res = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(injPayload)
      });
      const data = await res.json();
      const verdictMap: Record<string, { verdict: string; color: string }> = {
        success: { verdict: "✅ SAFE — Human Authenticated", color: "#16a34a" },
        blocked: { verdict: "🔴 CRITICAL — Bot Detected", color: "#dc2626" },
        mfa_required: { verdict: "⚠ WARNING — MFA Required", color: "#f59e0b" }
      };
      setLastInjectionResult(verdictMap[data.status] || { verdict: data.status, color: "#64748b" });
    } catch {
      setLastInjectionResult({ verdict: "❌ Connection error — backend offline?", color: "#f87171" });
    }
    setSendingInjection(false);
  };


  // Live tracking
  useEffect(() => {
    if (username.length > 0 && !isMonitoring && !isSubmittedRef.current && isLoggedIn) {
      setIsMonitoring(true);
      setStatus("🟢 Active Session: Monitoring Telemetry...");
      try {
        const ws = new WebSocket("ws://localhost:8000/ws/tracking");
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => setWsConnected(false);
        ws.onerror = () => setWsConnected(false);
        wsRef.current = ws;
      } catch { setWsConnected(false); }
    }
    if (!isMonitoring) return;

    const handleVis = () => { if (document.hidden) trackData.current.tabSwitches++; };
    document.addEventListener("visibilitychange", handleVis);
    const handleKey = () => {
      const now = Date.now();
      if (lastKeyTime.current) trackData.current.keystrokeDelays.push((now - lastKeyTime.current) / 1000);
      lastKeyTime.current = now;
      // Record when typing started (only if not already set for this session)
      if (!typingStartTime.current) typingStartTime.current = now;
      trackData.current.keystrokeCount++;
    };
    document.addEventListener("keydown", handleKey);
    const handleMouse = (e: MouseEvent) => {
      const now = Date.now(); const timeDiff = now - lastMousePos.current.time;
      if (timeDiff > 50) {
        const dist = Math.sqrt(Math.pow(e.clientX - lastMousePos.current.x, 2) + Math.pow(e.clientY - lastMousePos.current.y, 2));
        const instantVel = Math.round((dist / timeDiff) * 1000);
        // Keep a rolling buffer of last 30 samples for a smooth avg
        trackData.current.mouseVelocitySamples.push(instantVel);
        if (trackData.current.mouseVelocitySamples.length > 30) trackData.current.mouseVelocitySamples.shift();
        const samples = trackData.current.mouseVelocitySamples;
        trackData.current.mouseVelocity = Math.round(samples.reduce((a: number, b: number) => a + b, 0) / samples.length);
        lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };
    document.addEventListener("mousemove", handleMouse);

    const getInjectedValues = () => {
      if (!isInjectionEnabled) {
        return { ip: trackData.current.ip, lat: trackData.current.lat, lon: trackData.current.lon, mouseVel: trackData.current.mouseVelocity, keyDelay: 0 };
      }
      if (selectedLocationIdx < 0) {
        return { ip: spoofIp || trackData.current.ip, lat: trackData.current.lat, lon: trackData.current.lon, mouseVel: isBotMode ? 8500 : mouseVelocityOverride, keyDelay: isBotMode ? 0.005 : keystrokeDelayOverride };
      }
      const loc = PRESET_LOCATIONS[selectedLocationIdx];
      const isCustomLoc = loc.label === "Custom Location";
      return { ip: spoofIp || trackData.current.ip, lat: isCustomLoc ? parseFloat(customLat) || 0 : loc.lat, lon: isCustomLoc ? parseFloat(customLon) || 0 : loc.lon, mouseVel: isBotMode ? 8500 : mouseVelocityOverride, keyDelay: isBotMode ? 0.005 : keystrokeDelayOverride };
    };

    const streamInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN && !isSubmittedRef.current) {
        const delays = trackData.current.keystrokeDelays;
        let avgKey = delays.length ? delays.reduce((a, b) => a + b) / delays.length : 0;
        // Avg mouse velocity — use rolling average, NOT the last-moment value
        let currentMouseVel = trackData.current.mouseVelocity;
        // Don't reset after reading — we want the sustained average, not a pulse
        const injected = getInjectedValues();
        // Only apply injection overrides when injection controls are explicitly set AND enabled
        if (isInjectionEnabled) {
          if (isBotMode) { avgKey = 0.005; currentMouseVel = 8500; }
          else if (spoofIp || selectedLocationIdx >= 0) { avgKey = keystrokeDelayOverride; currentMouseVel = mouseVelocityOverride; }
          else if (mouseVelocityOverride !== 800) { currentMouseVel = mouseVelocityOverride; }
        }
        // Compute WPM from actual typing duration: (total keystrokes / 5) / elapsed minutes
        // This is more accurate than averaging inter-key delays, especially at low keystroke counts
        let typingWpm = 0;
        if (typingStartTime.current && trackData.current.keystrokeCount > 2) {
          const elapsedMinutes = (Date.now() - typingStartTime.current) / 60000;
          typingWpm = elapsedMinutes > 0 ? Math.round((trackData.current.keystrokeCount / 5) / elapsedMinutes) : 0;
        }
        const livePayload = {
          // Always use the LOGGED-IN user's username, not selectedUser (injection target is separate)
          username, ip_address: injected.ip, lat: injected.lat, lon: injected.lon,
          os: trackData.current.os, resolution: `${window.innerWidth}x${window.innerHeight}`,
          avg_keystroke_delay: avgKey, mouse_velocity: currentMouseVel,
          tab_switch_count: trackData.current.tabSwitches, active_processes: isInjectionEnabled ? activeProcesses : "Outlook, Excel, Chrome",
          login_attempts_override: isInjectionEnabled && loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts,
          attempts: isInjectionEnabled && loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts,
          typing_wpm: typingWpm,
          user_trusted_locations: userList.find(u => u.username === username)?.trustedLocations || []
        };
        const payloadString = JSON.stringify(livePayload);
        trackData.current.totalBytes += new Blob([payloadString]).size;
        wsRef.current.send(JSON.stringify({
          ...livePayload,
          bytes_sent: isInjectionEnabled && simUploadMb > 0 ? simUploadMb * 1024 * 1024 : trackData.current.totalBytes,
          bytes_received: isInjectionEnabled && simDownloadMb > 0 ? simDownloadMb * 1024 * 1024 : trackData.current.downloadedBytes
        }));
      }
    }, 1000);

    return () => { document.removeEventListener("visibilitychange", handleVis); document.removeEventListener("keydown", handleKey); document.removeEventListener("mousemove", handleMouse); clearInterval(streamInterval); };
  }, [username, isMonitoring, isLoggedIn, activeProcesses, isBotMode, spoofIp, selectedLocationIdx, customLat, customLon, mouseVelocityOverride, keystrokeDelayOverride, selectedUser, simUploadMb, simDownloadMb, loginAttemptOverride, isInjectionEnabled]);

  // Login with password validation
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || locationError) return;
    setIsLoggingIn(true);
    setAuthMessage(null);

    const newAttemptCount = loginAttempts + 1;
    setLoginAttempts(newAttemptCount);

    try {
      const res = await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "VERIFY_LOGIN", payload: { username, password } }) });
      const data = await res.json();

      if (data.success) {
        // Collect telemetry and eval after processing success
        const delays = trackData.current.keystrokeDelays;
        let avgKey = delays.length ? delays.reduce((a, b) => a + b) / delays.length : 0;
        let currentMouseVel = trackData.current.mouseVelocity;
        const loc = selectedLocationIdx >= 0 ? PRESET_LOCATIONS[selectedLocationIdx] : null;
        const isCustomLoc = loc?.label === "Custom Location";
        if (isBotMode) { avgKey = 0.005; currentMouseVel = 8500; }
        else if (spoofIp || selectedLocationIdx >= 0) { avgKey = keystrokeDelayOverride; currentMouseVel = mouseVelocityOverride; }

        const evaluationPayload = {
          // Always evaluate and record the LOGGED-IN user, not the injection target
          username,
          ip_address: spoofIp || trackData.current.ip,
          lat: selectedLocationIdx < 0 ? trackData.current.lat : (isCustomLoc ? parseFloat(customLat) || 0 : loc!.lat),
          lon: selectedLocationIdx < 0 ? trackData.current.lon : (isCustomLoc ? parseFloat(customLon) || 0 : loc!.lon),
          os: trackData.current.os,
          resolution: `${window.innerWidth}x${window.innerHeight}`,
          avg_keystroke_delay: avgKey,
          mouse_velocity: currentMouseVel,
          tab_switch_count: trackData.current.tabSwitches,
          active_processes: activeProcesses,
          bytes_sent: trackData.current.totalBytes,
          login_attempts_override: loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts,
          attempts: loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts,
          email: userList.find(u => u.username === username)?.email || "nischalsharma2037@gmail.com"
        };

        try {
          const evalRes = await fetch("http://localhost:8000/api/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evaluationPayload)
          });
          const evalData = await evalRes.json();

          if (evalData.status === "mfa_required") {
            setAuthStep("otp");
            setIsLoggingIn(false);
            return;
          }
        } catch { /* proceed if network fails */ }

        setIsLoggedIn(true);
        setStatus("🟢 Secure Session Active. Monitor Workspace...");
        setAuthMessage(null);
      } else {
        setAuthMessage({ type: "error", text: data.error || "Login failed." });

        // Brute force security alert email: triggered at 3+ wrong attempts
        if (newAttemptCount >= 3) {
          try {
            const targetEmail = userList.find(u => u.username === username)?.email || "nischalsharma2037@gmail.com";
            await fetch("http://localhost:8000/api/alert-brute-force", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: targetEmail, username: username, attempts: newAttemptCount })
            });
          } catch { /* ok */ }
        }

        // Brute force DB record: triggered at 3 wrong attempts
        if (newAttemptCount >= 3 && !bruteForceReported) {
          setBruteForceReported(true);
          const telemetry = {
            ip_address: spoofIp || trackData.current.ip,
            lat: trackData.current.lat,
            lon: trackData.current.lon,
            os: trackData.current.os,
            resolution: `${window.innerWidth}x${window.innerHeight}`,
            avg_keystroke_delay: 0,
            mouse_velocity: 0,
            tab_switch_count: trackData.current.tabSwitches,
            active_processes: "Login Screen",
            bytes_sent: 0,
            risk_status: ["ANOMALY_BRUTE_FORCE"]
          };
          try {
            await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "RECORD_FAILED_ATTEMPTS", payload: { username, attempts: newAttemptCount, telemetry } }) });
          } catch { /* ok */ }
        } else if (newAttemptCount >= 3 && bruteForceReported) {
          const telemetry = {
            ip_address: spoofIp || trackData.current.ip,
            lat: trackData.current.lat,
            lon: trackData.current.lon,
            os: trackData.current.os,
            resolution: `${window.innerWidth}x${window.innerHeight}`,
            avg_keystroke_delay: 0,
            mouse_velocity: 0,
            tab_switch_count: trackData.current.tabSwitches,
            active_processes: "Login Screen",
            bytes_sent: 0,
            risk_status: ["ANOMALY_BRUTE_FORCE"]
          };
          try {
            await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "RECORD_FAILED_ATTEMPTS", payload: { username, attempts: newAttemptCount, telemetry } }) });
          } catch { /* ok */ }
        }
      }
    } catch {
      setAuthMessage({ type: "error", text: "Server error. Could not verify credentials." });
    }
    setIsLoggingIn(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue) return;
    setIsLoggingIn(true);
    setOtpError("");
    try {
      const delays = trackData.current.keystrokeDelays;
      let avgKey = delays.length ? delays.reduce((a, b) => a + b) / delays.length : 0;
      let currentMouseVel = trackData.current.mouseVelocity;
      const loc = selectedLocationIdx >= 0 ? PRESET_LOCATIONS[selectedLocationIdx] : null;
      const isCustomLoc = loc?.label === "Custom Location";
      if (isBotMode) { avgKey = 0.005; currentMouseVel = 8500; }
      else if (spoofIp || selectedLocationIdx >= 0) { avgKey = keystrokeDelayOverride; currentMouseVel = mouseVelocityOverride; }

      const tel = {
        ip_address: spoofIp || trackData.current.ip,
        lat: selectedLocationIdx < 0 ? trackData.current.lat : (isCustomLoc ? parseFloat(customLat) || 0 : loc!.lat),
        lon: selectedLocationIdx < 0 ? trackData.current.lon : (isCustomLoc ? parseFloat(customLon) || 0 : loc!.lon),
        os: trackData.current.os,
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        avg_keystroke_delay: avgKey,
        mouse_velocity: currentMouseVel,
        tab_switch_count: trackData.current.tabSwitches,
        active_processes: activeProcesses,
        bytes_sent: trackData.current.totalBytes,
        protocol: "HTTPS",
        attempts: loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts
      };

      const res = await fetch("http://localhost:8000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp: otpValue, ...tel })
      });
      const data = await res.json();
      if (data.status === "success") {
        setAuthStep("login");
        setIsLoggedIn(true);
        setStatus("🟢 Secure Session Active. Monitor Workspace...");
        setAuthMessage(null);
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Server error verifying OTP");
    }
    setIsLoggingIn(false);
  };

  // Real file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      trackData.current.totalBytes += file.size;
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size }]);
    }
    setStatus(`⬆️ Uploaded ${files.length} file(s) — Total data: ${formatFileSize(trackData.current.totalBytes)}`);
    setTimeout(() => setStatus("🟢 Active Session: Monitoring Telemetry..."), 3000);
    e.target.value = "";
  };

  // Real file download — pads content to match the stated file size for realistic byte tracking
  const handleDownload = (file: typeof DOWNLOADABLE_FILES[0]) => {
    let baseContent = "";
    if (file.type === "application/json") {
      baseContent = JSON.stringify({ logs: Array.from({ length: 200 }, (_, i) => ({ id: i + 1, timestamp: new Date(Date.now() - i * 60000).toISOString(), level: ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)], message: `Server event ${i + 1}: ${["Request processed", "Memory spike detected", "Connection timeout", "Auth failure"][Math.floor(Math.random() * 4)]}`, ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", session_id: Math.random().toString(36).slice(2) })) }, null, 2);
    } else if (file.type === "text/csv") {
      const rows = Array.from({ length: 500 }, (_, i) => `User_${i},user${i}@company.com,Department_${i % 10},Role_${i % 5},City_${i % 20},${Math.random().toString(36).slice(2)},${new Date(Date.now() - i * 86400000).toISOString()}`);
      baseContent = "Name,Email,Department,Role,Location,ID,LastLogin\n" + rows.join("\n");
    } else if (file.type === "text/plain") {
      baseContent = "# PRODUCTION ENVIRONMENT VARIABLES\nDB_HOST=prod-db-cluster.internal\nDB_PORT=5432\nDB_NAME=prod_main\nDB_USER=svc_account\nDB_PASS=p@ssw0rd_secure_2024!\nAPI_KEY=sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxx\nSECRET_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0\nAWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nSTRIPE_SECRET=sk_dummy_xxxxxxxxxxxxxxxxxxxxxxxxxxxx\nSENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0\nREDIS_URL=redis://prod-cache.internal:6379\nSMTP_HOST=smtp.sendgrid.net\nSMTP_USER=apikey";
    } else if (file.type === "image/png") {
      baseContent = Array.from({ length: 1000 }, (_, i) => `NODE_${i}->SUBNET_${i % 50}->GATEWAY_${i % 10}->CORE`).join("\n");
    } else if (file.type === "application/sql") {
      baseContent = Array.from({ length: 2000 }, (_, i) => `INSERT INTO clients (id, name, email, created_at, balance, status) VALUES (${i}, 'Client ${i}', 'client${i}@corp.com', '${new Date(Date.now() - i * 86400000).toISOString()}', ${(Math.random() * 100000).toFixed(2)}, 'active');`).join("\n");
    } else {
      baseContent = `[${file.name}] UEBA Simulation Export\nTimestamp: ${new Date().toISOString()}\nGenerated by NeurometricShield Prototype Engine\n`;
    }

    // Pad content to match the stated file size with a comment block
    const encoder = new TextEncoder();
    const baseBytes = encoder.encode(baseContent).length;
    const targetBytes = file.size;
    let paddedContent = baseContent;
    if (baseBytes < targetBytes) {
      const paddingNeeded = targetBytes - baseBytes;
      // Add a padding block that makes the file the correct size
      const paddingLine = "# " + "X".repeat(78) + "\n";
      const linesNeeded = Math.ceil(paddingNeeded / paddingLine.length);
      paddedContent += "\n\n# === PADDING DATA (SIMULATION FILLER) ===\n" + paddingLine.repeat(linesNeeded);
    }

    const blob = new Blob([paddedContent], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackData.current.downloadedBytes += blob.size;
    setShowDownloadMenu(false);
    setStatus(`⬇️ Downloaded ${file.name} (${formatFileSize(blob.size)})`);
    setTimeout(() => setStatus("🟢 Active Session: Monitoring Telemetry..."), 3000);
  };

  // Logout (replaces both Finalize & Reset)
  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Send final evaluation before logging out
    if (isMonitoring && !isSubmittedRef.current) {
      isSubmittedRef.current = true;
      setIsMonitoring(false);

      const delays = trackData.current.keystrokeDelays;
      let avgKey = delays.length ? delays.reduce((a, b) => a + b) / delays.length : 0;
      let currentMouseVel = trackData.current.mouseVelocity;
      const loc = selectedLocationIdx >= 0 ? PRESET_LOCATIONS[selectedLocationIdx] : null;
      const isCustomLoc = loc?.label === "Custom Location";
      if (isBotMode) { avgKey = 0.005; currentMouseVel = 8500; }
      else if (spoofIp || selectedLocationIdx >= 0) { avgKey = keystrokeDelayOverride; currentMouseVel = mouseVelocityOverride; }

      // Send SESSION_ENDED signal to SOC so dashboard can flip Live → Locked immediately
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const logoutSignal = {
          type: "LOGOUT_SIGNAL",
          username: selectedUser || username,
          ip_address: spoofIp || trackData.current.ip,
          os: trackData.current.os,
          resolution: `${window.innerWidth}x${window.innerHeight}`
        };
        wsRef.current.send(JSON.stringify(logoutSignal));
        // Small delay so the signal is sent before we close
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (wsRef.current) wsRef.current.close();

      const typingWpm = (() => {
        if (typingStartTime.current && trackData.current.keystrokeCount > 2) {
          const elapsedMinutes = (Date.now() - typingStartTime.current) / 60000;
          return elapsedMinutes > 0 ? Math.round((trackData.current.keystrokeCount / 5) / elapsedMinutes) : 0;
        }
        return 0;
      })();
      const finalPayload = {
        username: selectedUser || username, ip_address: spoofIp || trackData.current.ip,
        lat: selectedLocationIdx < 0 ? trackData.current.lat : (isCustomLoc ? parseFloat(customLat) || 0 : loc!.lat),
        lon: selectedLocationIdx < 0 ? trackData.current.lon : (isCustomLoc ? parseFloat(customLon) || 0 : loc!.lon),
        os: trackData.current.os, resolution: `${window.innerWidth}x${window.innerHeight}`,
        avg_keystroke_delay: avgKey, mouse_velocity: currentMouseVel,
        tab_switch_count: trackData.current.tabSwitches, active_processes: activeProcesses,
        bytes_sent: trackData.current.totalBytes,
        bytes_received: trackData.current.downloadedBytes,
        typing_wpm: typingWpm,
        login_attempts_override: loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts,
        attempts: loginAttemptOverride > 1 ? loginAttemptOverride : loginAttempts
      };

      try {
        await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "RECORD_LOGIN", payload: { username, password, telemetry: finalPayload } }) });
      } catch { /* ok */ }
    }

    // Brief delay so the user sees the loading animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Reset everything
    isSubmittedRef.current = false;
    setIsMonitoring(false);
    setWsConnected(false);
    setUsername(""); setPassword(""); setComposeText("");
    setIsBotMode(false); setIsLoggedIn(false); setAuthMessage(null);
    setSelectedUser(""); setSpoofIp(""); setSelectedLocationIdx(-1);
    setMouseVelocityOverride(800); setKeystrokeDelayOverride(0.12); setLoginAttemptOverride(1);
    setLoginAttempts(0); setBruteForceReported(false);
    setSelectedEmail(null); setComposeOpen(false); setUploadedFiles([]);
    setAuthStep("login"); setOtpValue(""); setOtpError("");
    trackData.current.keystrokeDelays = []; trackData.current.tabSwitches = 0;
    trackData.current.totalBytes = 0; trackData.current.downloadedBytes = 0;
    trackData.current.keystrokeCount = 0; trackData.current.mouseVelocity = 0;
    lastKeyTime.current = null; typingStartTime.current = null; // Reset typing timers
    if (wsRef.current) wsRef.current.close();
    setStatus("Awaiting Login Initialization...");
    setIsLoggingOut(false);
  };

  const selectedLoc = selectedLocationIdx >= 0 ? PRESET_LOCATIONS[selectedLocationIdx] : null;
  const isCustomLocation = selectedLoc?.label === "Custom Location";

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-300 font-sans transition-colors duration-300" suppressHydrationWarning>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER — matches dashboard */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-10 shrink-0 hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span>Neurometric<span className="text-blue-500">Shield</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full font-semibold text-xs border backdrop-blur-sm ${isMonitoring ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 border-slate-200 dark:border-slate-800'}`}>
            {status}
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Toggle Theme"
          >
            {mounted ? (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="relative z-10 p-6 max-w-[1600px] mx-auto">

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUMN 1: AUTH / WORKSPACE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl">

              {authStep === "otp" ? (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <ShieldAlert className="text-amber-500 w-5 h-5" /> MFA Verification Required
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Unusual behavior detected. Please enter the verification code sent to your email.
                  </p>

                  {otpError && (
                    <div className="mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 bg-rose-900/30 text-rose-400 border border-rose-800/50">
                      <AlertTriangle className="w-4 h-4" />
                      {otpError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase text-slate-600 dark:text-slate-500 font-bold mb-1.5 tracking-wider">Authentication Code</label>
                    <input suppressHydrationWarning type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-center tracking-widest text-lg" placeholder="123456" required maxLength={6} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button suppressHydrationWarning type="button" onClick={() => setAuthStep("login")} disabled={isLoggingIn} className="w-1/3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40">Cancel</button>
                    <button suppressHydrationWarning type="submit" disabled={!otpValue || isLoggingIn} className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
                      {isLoggingIn ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>
                </form>
              ) : !isLoggedIn ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <ShieldAlert className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Secure Authentication
                  </h2>

                  {authMessage && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${authMessage.type === "success" ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-rose-900/30 text-rose-400 border border-rose-800/50'}`}>
                      {authMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {authMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-slate-600 dark:text-slate-500 font-bold mb-1.5 tracking-wider">Username</label>
                      <input suppressHydrationWarning type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="e.g. priyanshi" required />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-slate-600 dark:text-slate-500 font-bold mb-1.5 tracking-wider">Password</label>
                      <input suppressHydrationWarning type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="••••••••" required />
                    </div>

                    {locationError && (
                      <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" /> Location permission required.
                      </div>
                    )}
                    <button suppressHydrationWarning type="submit" disabled={!username || !password || locationError || isLoggingIn} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                      {isLoggingIn ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Verifying...
                        </>
                      ) : "Secure Login"}
                    </button>
                  </form>
                </>
              ) : (
                /* ═══ POST-LOGIN: EMAIL CLIENT UI ═══ */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inbox</h2>
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">{MOCK_EMAILS.filter(e => e.unread).length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{username}</span>
                    </div>
                  </div>

                  {/* Email navigation */}
                  <div className="flex items-center gap-1 mb-3 text-xs">
                    {[{ icon: Inbox, label: "Inbox", count: 6 }, { icon: Star, label: "Starred", count: 2 }, { icon: Send, label: "Sent" }, { icon: Trash2, label: "Trash" }].map((nav, i) => (
                      <button suppressHydrationWarning key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${i === 0 ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                        <nav.icon className="w-3.5 h-3.5" /> {nav.label}
                        {nav.count && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{nav.count}</span>}
                      </button>
                    ))}
                  </div>

                  {/* Compose button */}
                  <button suppressHydrationWarning onClick={() => setComposeOpen(!composeOpen)} className="w-full mb-3 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Compose Email
                  </button>

                  {composeOpen && (
                    <div className="mb-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 space-y-2">
                      <input suppressHydrationWarning type="text" placeholder="To: recipient@company.com" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-800 text-sm xl text-slate-900 dark:text-white p-2 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                      <input suppressHydrationWarning type="text" placeholder="Subject:" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white p-2 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                      <textarea rows={3} value={composeText} onChange={(e) => setComposeText(e.target.value)} placeholder="Write your message here... (generates keystroke telemetry)" className="w-full bg-transparent text-sm text-slate-900 dark:text-white p-2 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                      <div className="flex justify-end gap-2">
                        <button suppressHydrationWarning onClick={() => setComposeOpen(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5">Discard</button>
                        <button suppressHydrationWarning className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold">Send</button>
                      </div>
                    </div>
                  )}

                  {/* Email list */}
                  <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                    {MOCK_EMAILS.map(email => (
                      <div key={email.id} onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedEmail === email.id ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : email.unread ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-800/60' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/30'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {email.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            <span className={`text-xs truncate max-w-[180px] ${email.unread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>{email.from}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{email.time}</span>
                        </div>
                        <p className={`text-sm truncate ${email.unread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{email.subject}</p>
                        {selectedEmail === email.id && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/50">
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{email.preview}</p>
                            <div className="flex gap-2 mt-2">
                              <button suppressHydrationWarning className="text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1"><Paperclip className="w-3 h-3" /> Attachments</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Upload / Download buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                    {/* Download with menu */}
                    <div className="relative">
                      <button suppressHydrationWarning onClick={() => setShowDownloadMenu(!showDownloadMenu)} disabled={!isMonitoring || isSubmittedRef.current}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-all disabled:opacity-40 text-sm">
                        <Download className="w-4 h-4" /> Download <ChevronDown className="w-3 h-3" />
                      </button>
                      {showDownloadMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)}></div>
                          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-2 max-h-[300px] overflow-y-auto">
                            <p className="text-[10px] uppercase text-slate-500 font-bold px-2 py-1 tracking-wider">Available Files</p>
                            {DOWNLOADABLE_FILES.map((file, i) => (
                              <button suppressHydrationWarning key={i} onClick={() => handleDownload(file)} className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 group">
                                <File className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">{file.name}</p>
                                  <p className="text-[10px] text-slate-500">{file.category} • {formatFileSize(file.size)}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Upload */}
                    <div>
                      <input suppressHydrationWarning ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                      <button suppressHydrationWarning onClick={() => fileInputRef.current?.click()} disabled={!isMonitoring || isSubmittedRef.current}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-all disabled:opacity-40 text-sm">
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                    </div>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Uploaded</p>
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800/40 rounded-lg px-3 py-2">
                          <span className="text-slate-800 dark:text-slate-300 truncate">{f.name}</span>
                          <span className="text-slate-500">{formatFileSize(f.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Logout button */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/50">
                    <button suppressHydrationWarning type="button" onClick={handleLogout} disabled={isLoggingOut} className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoggingOut ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Submitting Evaluation...
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-4 h-4" /> Logout & Submit Evaluation
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* COLUMN 2: THREAT INJECTION ENGINE */}
          <div className="lg:col-span-8">
            <div className="bg-white/80 dark:bg-[#0d1018]/80 backdrop-blur-md border border-rose-200 dark:border-rose-900/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(225,29,72,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-rose-200 dark:border-rose-900/30 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-rose-600 to-orange-600 rounded-xl"><ShieldAlert className="text-white w-5 h-5" /></div>
                    Threat Injection Engine
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/50 hidden xl:inline-block">Manipulate telemetry before it reaches AI models</span>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/50 p-1.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                  <button suppressHydrationWarning
                    onClick={() => setIsInjectionEnabled(!isInjectionEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isInjectionEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isInjectionEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                  <span className={`text-sm font-bold ${isInjectionEnabled ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                    {isInjectionEnabled ? "ENABLED" : "DISABLED"}
                  </span>
                </div>
              </div>

              <div className={`space-y-3 transition-opacity duration-300 ${isInjectionEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                {/* ═══ GROUP 1: Identity & Network ═══ */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
                  <button suppressHydrationWarning type="button" onClick={() => toggleSection("identity")} className="w-full flex items-center justify-between px-5 py-4 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg"><Globe className="w-4 h-4 text-white" /></div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Identity & Network</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">3 controls</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections.has("identity") ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openSections.has("identity") ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                      {/* User Impersonation */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-amber-600 dark:text-amber-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><Users className="w-4 h-4" /> Target User</label>
                        <div className="relative">
                          <select suppressHydrationWarning value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-amber-500 outline-none appearance-none cursor-pointer transition-colors text-sm" disabled={isSubmittedRef.current || isLoggedIn}>
                            <option value="">Use logged-in user ({username || "none"})</option>
                            {userList.map(u => (<option key={u.username} value={u.username}>{u.username} — {u.attempts} attempts — {u.lastIp}</option>))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                        {selectedUser && <div className="mt-2 bg-amber-100 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-2 text-xs text-amber-700 dark:text-amber-400">Injecting as: <span className="font-bold text-amber-600 dark:text-amber-300">{selectedUser}</span></div>}
                      </div>

                      {/* IP Spoofing */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-cyan-600 dark:text-cyan-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><Globe className="w-4 h-4" /> IP Spoofing</label>
                        <input suppressHydrationWarning type="text" value={spoofIp} onChange={(e) => setSpoofIp(e.target.value)} placeholder={`Real: ${trackData.current.ip}`} className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-cyan-500 outline-none font-mono transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm" disabled={isSubmittedRef.current || isLoggedIn} />
                        <p className="text-xs text-slate-500 mt-1.5">Leave empty to use real IP</p>
                      </div>

                      {/* Location Override — spans full width */}
                      <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-violet-600 dark:text-violet-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><MapPin className="w-4 h-4" /> Location Spoofing</label>
                        <div className="relative">
                          <select suppressHydrationWarning value={selectedLocationIdx} onChange={(e) => setSelectedLocationIdx(parseInt(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-violet-500 outline-none appearance-none cursor-pointer transition-colors text-sm" disabled={isSubmittedRef.current || isLoggedIn}>
                            <option value={-1}>Use real location</option>
                            {PRESET_LOCATIONS.map((loc, i) => (<option key={i} value={i}>{loc.label} ({loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°)</option>))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                        {isCustomLocation && selectedLocationIdx >= 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <input suppressHydrationWarning type="text" value={customLat} onChange={(e) => setCustomLat(e.target.value)} placeholder="Latitude" className="bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm font-mono focus:border-violet-500 outline-none" />
                            <input suppressHydrationWarning type="text" value={customLon} onChange={(e) => setCustomLon(e.target.value)} placeholder="Longitude" className="bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm font-mono focus:border-violet-500 outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ GROUP 2: Behavioral Biometrics ═══ */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
                  <button suppressHydrationWarning type="button" onClick={() => toggleSection("biometrics")} className="w-full flex items-center justify-between px-5 py-4 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg"><MousePointer2 className="w-4 h-4 text-white" /></div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Behavioral Biometrics</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">3 controls</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections.has("biometrics") ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openSections.has("biometrics") ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5">
                      {/* Mouse Velocity */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-pink-600 dark:text-pink-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><MousePointer2 className="w-4 h-4" /> Mouse Velocity</label>
                        <div className="flex items-center gap-3">
                          <input suppressHydrationWarning type="range" min="100" max="10000" step="100" value={isBotMode ? 8500 : mouseVelocityOverride} onChange={(e) => setMouseVelocityOverride(parseInt(e.target.value))} className="flex-1 accent-pink-500" disabled={isSubmittedRef.current || isBotMode} />
                          <span className={`text-lg font-bold font-mono min-w-[5ch] text-right ${(isBotMode ? 8500 : mouseVelocityOverride) > 3000 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isBotMode ? 8500 : mouseVelocityOverride}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">px/s • Human: 200-1500 • Bot: 3000+</p>
                      </div>

                      {/* Keystroke Delay */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-teal-600 dark:text-teal-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><Gauge className="w-4 h-4" /> Keystroke Delay</label>
                        <div className="flex items-center gap-3">
                          <input suppressHydrationWarning type="range" min="0.001" max="0.5" step="0.001" value={isBotMode ? 0.005 : keystrokeDelayOverride} onChange={(e) => setKeystrokeDelayOverride(parseFloat(e.target.value))} className="flex-1 accent-teal-500" disabled={isSubmittedRef.current || isBotMode} />
                          <span className={`text-lg font-bold font-mono min-w-[5ch] text-right ${(isBotMode ? 0.005 : keystrokeDelayOverride) < 0.05 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{(isBotMode ? 0.005 : keystrokeDelayOverride).toFixed(3)}s</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">Human: 0.08-0.3s • Bot: &lt;0.05s</p>
                      </div>

                      {/* Login Attempts */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-orange-600 dark:text-orange-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><Crosshair className="w-4 h-4" /> Login Attempts</label>
                        <div className="flex items-center gap-3">
                          <input suppressHydrationWarning type="range" min="1" max="20" value={loginAttemptOverride} onChange={(e) => setLoginAttemptOverride(parseInt(e.target.value))} className="flex-1 accent-orange-500" disabled={isSubmittedRef.current || isLoggedIn} />
                          <span className={`text-2xl font-bold font-mono min-w-[3ch] text-right ${loginAttemptOverride > 5 ? 'text-rose-600 dark:text-rose-400' : loginAttemptOverride > 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{loginAttemptOverride}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">{loginAttemptOverride > 5 ? '⚠ Brute-force pattern' : loginAttemptOverride > 2 ? '⚠ Suspicious' : '✓ Normal range'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ GROUP 3: System & Automation ═══ */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
                  <button suppressHydrationWarning type="button" onClick={() => toggleSection("system")} className="w-full flex items-center justify-between px-5 py-4 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-rose-500 to-amber-500 rounded-lg"><Zap className="w-4 h-4 text-white" /></div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">System & Automation</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">2 controls</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections.has("system") ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openSections.has("system") ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                      {/* Endpoint Spoofing */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <label className="block text-xs uppercase text-amber-600 dark:text-amber-500 font-bold mb-3 flex items-center gap-2 tracking-wider"><Network className="w-4 h-4" /> Endpoint Processes</label>
                        <div className="relative">
                          <select suppressHydrationWarning value={activeProcesses} onChange={(e) => setActiveProcesses(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-slate-900 dark:text-white focus:border-amber-500 outline-none appearance-none cursor-pointer transition-colors text-sm" disabled={isSubmittedRef.current}>
                            <option value="Outlook, Excel, Chrome (Google)">[Normal] Outlook, Excel, Chrome</option>
                            <option value="Chrome (YouTube, Spotify), Slack">[Warning] Distracted / High Bandwidth</option>
                            <option value="Tor Browser, Wireshark, Cmd.exe">[Critical] Tor Browser, Wireshark, Cmd</option>
                            <option value="Hydra, Burp Suite, Metasploit">[Critical] Penetration Testing Tools</option>
                            <option value="nmap, Python3, Netcat">[Critical] Network Scanning Suite</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Bot Mode */}
                      <div className={`p-4 rounded-xl border transition-all ${isBotMode ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 shadow-[0_0_20px_rgba(225,29,72,0.05)]' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs uppercase font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400 tracking-wider"><Zap className="w-4 h-4" /> Full Bot Override</label>
                          <button suppressHydrationWarning type="button" onClick={() => setIsBotMode(!isBotMode)} disabled={isSubmittedRef.current} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isBotMode ? 'bg-rose-600 shadow-lg shadow-rose-600/30' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${isBotMode ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Mouse → <span className="text-slate-900 dark:text-white font-mono">8,500 px/s</span> • Keys → <span className="text-slate-900 dark:text-white font-mono">0.005s</span></p>
                        {isBotMode && (
                          <div className="mt-3 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 p-3 rounded-lg text-xs font-mono border border-rose-200 dark:border-rose-900/40 animate-pulse">
                            &gt; INJECTING SYNTHETIC INPUT...<br />&gt; OVERRIDING HCI BIOMETRICS...<br />&gt; BOT_SIGNATURE: ACTIVE
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ GROUP 3.5: Data Transfer Simulation ═══ */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
                  <button suppressHydrationWarning type="button" onClick={() => toggleSection("data")} className="w-full flex items-center justify-between px-5 py-4 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg"><Network className="w-4 h-4 text-white" /></div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Data Transfer Simulation</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">2 controls</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections.has("data") ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openSections.has("data") ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                      {/* Simulated Upload MB */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 tracking-wider"><Upload className="w-3.5 h-3.5" /> Sim Upload</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{simUploadMb === 0 ? 'Real' : `${simUploadMb} MB`}</span>
                        </div>
                        <input type="range" min="0" max="2000" step="10" value={simUploadMb} onChange={e => setSimUploadMb(parseInt(e.target.value))} className="w-full accent-blue-500" />
                        <p className="text-[10px] text-slate-500 mt-1">{simUploadMb === 0 ? 'Using real accumulated bytes' : `Override upload → ${simUploadMb} MB streamed live`}</p>
                      </div>
                      {/* Simulated Download MB */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5 tracking-wider"><Download className="w-3.5 h-3.5" /> Sim Download</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{simDownloadMb === 0 ? 'Real' : `${simDownloadMb} MB`}</span>
                        </div>
                        <input type="range" min="0" max="5000" step="50" value={simDownloadMb} onChange={e => setSimDownloadMb(parseInt(e.target.value))} className="w-full accent-teal-500" />
                        <p className="text-[10px] text-slate-500 mt-1">{simDownloadMb === 0 ? 'Using real downloaded bytes' : `Override download → ${simDownloadMb} MB streamed live`}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ═══ GROUP 4: Detection Thresholds ═══ */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
                <button suppressHydrationWarning type="button" onClick={() => toggleSection("thresholds")} className="w-full flex items-center justify-between px-5 py-4 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg"><Gauge className="w-4 h-4 text-white" /></div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Detection Thresholds</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">5 controls</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections.has("thresholds") ? "rotate-90" : ""}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openSections.has("thresholds") ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
                      These thresholds define the boundaries the AI uses to classify logins. Values beyond these limits trigger the corresponding verdict on the dashboard.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 tracking-wider"><MousePointer2 className="w-3.5 h-3.5" /> Bot: Mouse Speed ›</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{threshBotMouseVel} px/s</span>
                        </div>
                        <input type="range" min="500" max="10000" step="100" value={threshBotMouseVel} onChange={e => setThreshBotMouseVel(parseInt(e.target.value))} className="w-full accent-rose-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Mouse speed above this → Bot verdict</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5 tracking-wider"><Zap className="w-3.5 h-3.5" /> Bot: Key Delay ‹</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{threshBotKeyDelay.toFixed(3)}s</span>
                        </div>
                        <input type="range" min="0.005" max="0.2" step="0.005" value={threshBotKeyDelay} onChange={e => setThreshBotKeyDelay(parseFloat(e.target.value))} className="w-full accent-orange-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Key delay below this → Bot verdict</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 tracking-wider"><AlertTriangle className="w-3.5 h-3.5" /> Warning: Attempts ≥</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{threshSuspAttempts}</span>
                        </div>
                        <input type="range" min="2" max={Math.max(threshBruteAttempts - 1, 3)} step="1" value={threshSuspAttempts} onChange={e => setThreshSuspAttempts(parseInt(e.target.value))} className="w-full accent-amber-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Attempts ≥ this → Warning / MFA</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 tracking-wider"><Crosshair className="w-3.5 h-3.5" /> Brute Force: Attempts ≥</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{threshBruteAttempts}</span>
                        </div>
                        <input type="range" min={Math.min(threshSuspAttempts + 1, 20)} max="20" step="1" value={threshBruteAttempts} onChange={e => setThreshBruteAttempts(parseInt(e.target.value))} className="w-full accent-rose-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Attempts ≥ this → Brute-force critical</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 lg:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs uppercase text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 tracking-wider"><Network className="w-3.5 h-3.5" /> High Upload: ≥ MB</label>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{threshHighDataMb} MB</span>
                        </div>
                        <input type="range" min="1" max="500" step="1" value={threshHighDataMb} onChange={e => setThreshHighDataMb(parseInt(e.target.value))} className="w-full accent-blue-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Upload above this → High data transfer flag</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ INJECTION STATUS ═══ */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Injection Streaming
                  </h3>
                  {isMonitoring ? (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">STANDBY</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {isMonitoring
                    ? "Injection values are streaming live to the SOC dashboard. Adjust any slider — the same session updates every second."
                    : isLoggedIn
                      ? "You are logged in. Injection values from the sliders above are included in the live telemetry stream."
                      : "Configure injection settings above. Values will be applied to the SOC stream once you log in on the left."}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}