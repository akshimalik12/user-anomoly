import { NextResponse } from 'next/server';

// In-memory mock DB for Vercel prototyping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalDb: any = globalThis as any;

// Per-user trusted location check (each user has their own trusted locations stored in the DB)
const TRUST_RADIUS_KM = 200; // km

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isUserTrustedLocation(lat: number, lon: number, trusted: { lat: number; lon: number }[]): boolean {
    if (!lat && !lon) return true; // no location data — can't judge
    if (!trusted || trusted.length === 0) return true; // no list configured — allow
    return trusted.some(t => haversineKm(lat, lon, t.lat, t.lon) <= TRUST_RADIUS_KM);
}

if (!globalDb.mockDb) {
    globalDb.mockDb = {
        users: {
            "priyanshi": {
                password: "password123",
                email: "priyanshi22csu393@ncuinda.edu",
                attempts: 1,
                trustedLocations: [
                    { lat: 48.8566, lon: 2.3522, label: "Paris (Home)" },
                    { lat: 51.5074, lon: -0.1278, label: "London (Office)" },
                    { lat: 50.1109, lon: 8.6821, label: "Frankfurt (Travel)" }
                ],
                telemetry: {
                    ip_address: "192.168.1.15",
                    lat: 48.8566,
                    lon: 2.3522,
                    os: "macOS Sonoma",
                    resolution: "2880x1800",
                    avg_keystroke_delay: 0.12,
                    mouse_velocity: 840,
                    tab_switch_count: 0,
                    active_processes: "Outlook, Excel, Chrome",
                    bytes_sent: 14000000,
                    risk_status: ["SAFE"]
                }
            },
            "anamika": {
                password: "admin_password",
                email: "anamika22csu015@ncuindia.edu",
                attempts: 4,
                trustedLocations: [
                    { lat: 34.0522, lon: -118.2437, label: "Los Angeles (HQ)" },
                    { lat: 37.7749, lon: -122.4194, label: "San Francisco (DC)" }
                ],
                telemetry: {
                    ip_address: "10.0.0.84",
                    lat: 34.0522,
                    lon: -118.2437,
                    os: "Kali Linux / Headless",
                    resolution: "1920x1080",
                    avg_keystroke_delay: 0.005,
                    mouse_velocity: 5200,
                    tab_switch_count: 5,
                    active_processes: "Tor Browser, Wireshark, Cmd.exe",
                    bytes_sent: 1800000000,
                    risk_status: ["ANOMALY_BOT"]
                }
            },
            "akshi": {
                password: "secure456",
                email: "akshi22csu412@ncuindia.edu",
                attempts: 2,
                trustedLocations: [
                    { lat: 40.7128, lon: -74.006, label: "New York (Home)" },
                    { lat: 42.3601, lon: -71.0589, label: "Boston (Office)" }
                ],
                telemetry: {
                    ip_address: "192.168.1.15",
                    lat: 40.7128,
                    lon: -74.0060,
                    os: "Windows 11",
                    resolution: "1920x1080",
                    avg_keystroke_delay: 0.15,
                    mouse_velocity: 600,
                    tab_switch_count: 1,
                    active_processes: "Outlook, Teams, Chrome",
                    bytes_sent: 5000000,
                    risk_status: ["SAFE"]
                }
            },
            "archit": {
                password: "archit@456",
                email: "archit22csu025@ncuindia.edu",
                attempts: 1,
                trustedLocations: [
                    { lat: 28.6139, lon: 77.2090, label: "Delhi (Home)" },
                    { lat: 28.4595, lon: 77.0266, label: "Gurugram (Office)" }
                ],
                telemetry: {
                    ip_address: "192.168.2.10",
                    lat: 28.6139,
                    lon: 77.2090,
                    os: "Windows 11",
                    resolution: "1920x1080",
                    avg_keystroke_delay: 0.13,
                    mouse_velocity: 720,
                    tab_switch_count: 0,
                    active_processes: "VS Code, Chrome, Terminal",
                    bytes_sent: 8000000,
                    risk_status: ["SAFE"]
                }
            },
            "alice_wong": {
                password: "pass789",
                email: "nischalsharma2037@gmail.com",
                attempts: 6,
                trustedLocations: [
                    { lat: 1.3521, lon: 103.8198, label: "Singapore (Home)" },
                    { lat: 22.3193, lon: 114.1694, label: "Hong Kong (Office)" },
                    { lat: 35.6762, lon: 139.6503, label: "Tokyo (Client)" }
                ],
                telemetry: {
                    ip_address: "10.0.0.84",
                    lat: 55.7558,
                    lon: 37.6173,
                    os: "Ubuntu 22.04",
                    resolution: "2560x1440",
                    avg_keystroke_delay: 0.008,
                    mouse_velocity: 7200,
                    tab_switch_count: 8,
                    active_processes: "Tor Browser, nmap, Python3",
                    bytes_sent: 2500000000,
                    risk_status: ["ANOMALY_BOT"]
                }
            }
        },
        sessions: [
            {
                id: "anamika-" + (Date.now() - 1000 * 60 * 15),
                username: "anamika",
                attempts: 4,
                telemetry: {
                    ip_address: "10.0.0.84",
                    lat: 34.0522,
                    lon: -118.2437,
                    os: "Kali Linux / Headless",
                    resolution: "1920x1080",
                    avg_keystroke_delay: 0.005,
                    mouse_velocity: 5200,
                    tab_switch_count: 5,
                    active_processes: "Tor Browser, Wireshark, Cmd.exe",
                    bytes_sent: 1800000000,
                    risk_status: ["ANOMALY_BOT"]
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
            },
            {
                id: "priyanshi-" + (Date.now() - 1000 * 60 * 60 * 2),
                username: "priyanshi",
                attempts: 1,
                telemetry: {
                    ip_address: "192.168.1.15",
                    lat: 48.8566,
                    lon: 2.3522,
                    os: "macOS Sonoma",
                    resolution: "2880x1800",
                    avg_keystroke_delay: 0.12,
                    mouse_velocity: 840,
                    tab_switch_count: 0,
                    active_processes: "Outlook, Excel, Chrome",
                    bytes_sent: 14000000,
                    risk_status: ["SAFE"]
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
                id: "akshi-" + (Date.now() - 1000 * 60 * 45),
                username: "akshi",
                attempts: 2,
                telemetry: {
                    ip_address: "192.168.1.15",
                    lat: 40.7128,
                    lon: -74.0060,
                    os: "Windows 11",
                    resolution: "1920x1080",
                    avg_keystroke_delay: 0.15,
                    mouse_velocity: 600,
                    tab_switch_count: 1,
                    active_processes: "Outlook, Teams, Chrome",
                    bytes_sent: 5000000,
                    risk_status: ["SAFE"]
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
            },
            {
                id: "alice_wong-" + (Date.now() - 1000 * 60 * 30),
                username: "alice_wong",
                attempts: 6,
                telemetry: {
                    ip_address: "10.0.0.84",
                    lat: 55.7558,
                    lon: 37.6173,
                    os: "Ubuntu 22.04",
                    resolution: "2560x1440",
                    avg_keystroke_delay: 0.008,
                    mouse_velocity: 7200,
                    tab_switch_count: 8,
                    active_processes: "Tor Browser, nmap, Python3",
                    bytes_sent: 2500000000,
                    risk_status: ["ANOMALY_BOT"]
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            },
            {
                id: "alice_wong-brute-" + (Date.now() - 1000 * 60 * 25),
                username: "alice_wong",
                attempts: 6,
                telemetry: {
                    ip_address: "10.0.0.84",
                    lat: 34.0522,
                    lon: -118.2437,
                    os: "Ubuntu 22.04",
                    resolution: "2560x1440",
                    avg_keystroke_delay: 0.003,
                    mouse_velocity: 9000,
                    tab_switch_count: 12,
                    active_processes: "Hydra, Burp Suite, Firefox",
                    bytes_sent: 3200000000,
                    risk_status: ["ANOMALY_BOT", "BRUTE_FORCE"]
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
            }
        ]
    };
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { action, payload } = data;
        const db = globalDb.mockDb;

        if (action === "RECORD_LOGIN") {
            const { username, password, telemetry } = payload;

            if (!db.users[username]) {
                db.users[username] = { password, attempts: 1, telemetry };
            } else {
                db.users[username].telemetry = telemetry;
            }

            // Use the override if the injection slider was used (>1), otherwise use server-side count
            const overrideAttempts = telemetry?.login_attempts_override || 0;
            const attempts = overrideAttempts > 1 ? overrideAttempts : (db.users[username].attempts || 1);

            // Location trust check — use THIS user's own trusted locations
            const loginLat = telemetry?.lat || 0;
            const loginLon = telemetry?.lon || 0;
            const userTrusted = db.users[username]?.trustedLocations || [];
            if (!isUserTrustedLocation(loginLat, loginLon, userTrusted)) {
                if (Array.isArray(telemetry.risk_status)) {
                    if (!telemetry.risk_status.includes('unknown_location')) {
                        telemetry.risk_status.push('unknown_location');
                    }
                } else {
                    telemetry.risk_status = ['unknown_location'];
                }
            }

            const newSession = {
                id: `${username}-${Date.now()}`,
                username,
                attempts,
                telemetry,
                timestamp: new Date().toISOString()
            };

            const dbFingerprint = telemetry ? `${telemetry.ip_address}|${telemetry.os}|${telemetry.resolution}` : null;

            // Check if there's an existing session (e.g. brute force attempt) from the exact same device within the last 2 hours
            let merged = false;
            if (dbFingerprint) {
                const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
                for (let i = 0; i < db.sessions.length; i++) {
                    const s = db.sessions[i];
                    const sFingerprint = s.telemetry ? `${s.telemetry.ip_address}|${s.telemetry.os}|${s.telemetry.resolution}` : null;
                    if (s.username === username && sFingerprint === dbFingerprint && new Date(s.timestamp).getTime() > twoHoursAgo) {
                        // Upgrade the existing failed attempt or session to the successful login
                        db.sessions[i] = { ...db.sessions[i], telemetry, attempts, timestamp: new Date().toISOString(), status: undefined };
                        merged = true;
                        break;
                    }
                }
            }

            if (!merged) {
                db.sessions.unshift(newSession);
                if (db.sessions.length > 100) db.sessions.pop();
            }

            return NextResponse.json({ success: true, session: merged ? newSession : newSession });
        }

        if (action === "CREATE_ACCOUNT") {
            const { username, password } = payload;

            if (!username || !password) {
                return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
            }

            if (db.users[username]) {
                return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 });
            }

            db.users[username] = {
                password,
                attempts: 0,
                telemetry: null
            };

            return NextResponse.json({ success: true, message: "Account created successfully" });
        }

        if (action === "VERIFY_LOGIN") {
            const { username, password } = payload;

            if (!username || !password) {
                return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
            }

            const user = db.users[username];
            if (!user) {
                return NextResponse.json({ success: false, error: "User not found" });
            }

            // Increment attempts on every login click (success or failure)
            user.attempts = (user.attempts || 0) + 1;

            if (user.password !== password) {
                return NextResponse.json({ success: false, error: "Incorrect password", attempts: user.attempts });
            }

            return NextResponse.json({ success: true, attempts: user.attempts });
        }

        if (action === "RECORD_FAILED_ATTEMPTS") {
            const { username, attempts, telemetry } = payload;

            const newSession = {
                id: `${username}-brute-${Date.now()}`,
                username,
                attempts,
                telemetry: telemetry || {},
                timestamp: new Date().toISOString(),
                status: "Brute-Force Attempt"
            };

            const dbFingerprint = telemetry ? `${telemetry.ip_address}|${telemetry.os}|${telemetry.resolution}` : null;

            // Deduplicate failed attempts from the same device
            let merged = false;
            if (dbFingerprint) {
                const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
                for (let i = 0; i < db.sessions.length; i++) {
                    const s = db.sessions[i];
                    const sFingerprint = s.telemetry ? `${s.telemetry.ip_address}|${s.telemetry.os}|${s.telemetry.resolution}` : null;
                    if (s.username === username && sFingerprint === dbFingerprint && new Date(s.timestamp).getTime() > twoHoursAgo) {
                        // Update existing entry instead of adding a new row
                        db.sessions[i].attempts = attempts;
                        db.sessions[i].telemetry = telemetry;
                        db.sessions[i].timestamp = new Date().toISOString();
                        merged = true;
                        break;
                    }
                }
            }

            if (!merged) {
                db.sessions.unshift(newSession);
                if (db.sessions.length > 100) db.sessions.pop();
            }

            return NextResponse.json({ success: true, session: newSession });
        }

        if (action === "GET_SESSIONS") {
            return NextResponse.json({ success: true, sessions: db.sessions });
        }

        if (action === "GET_USERS") {
            const userList = Object.entries(db.users).map(([username, userData]: [string, any]) => ({
                username,
                email: userData.email || "",
                attempts: userData.attempts || 0,
                lastIp: userData.telemetry?.ip_address || "Unknown",
                lastLocation: userData.telemetry ? {
                    lat: userData.telemetry.lat,
                    lon: userData.telemetry.lon
                } : null,
                riskStatus: userData.telemetry?.risk_status || [],
                trustedLocations: userData.trustedLocations || []
            }));
            return NextResponse.json({ success: true, users: userList });
        }

        if (action === "GET_ANALYTICS") {
            // Aggregate analytics from sessions
            const sessions = db.sessions;

            // Verdict distribution
            const verdicts = { safe: 0, warning: 0, critical: 0 };
            // IP grouping
            const ipGroups: Record<string, { count: number; verdicts: string[]; users: string[] }> = {};
            // Location grouping
            const locationGroups: Record<string, { count: number; lat: number; lon: number; users: string[]; verdicts: string[] }> = {};
            // User targeting
            const userTargets: Record<string, { attempts: number; verdict: string }> = {};
            // Threat types
            const threatTypes = { bot: 0, vpn: 0, devtools: 0, paste: 0, highData: 0, bruteForce: 0 };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sessions.forEach((s: any) => {
                const isAnomaly = s.telemetry?.risk_status?.some((r: string) => r.includes("ANOMALY")) || s.attempts > 2;
                const isSafe = s.telemetry?.risk_status?.includes("SAFE") && s.attempts <= 2;
                const verdict = isSafe ? "safe" : isAnomaly ? "critical" : "warning";

                verdicts[verdict]++;

                // IP grouping
                const ip = s.telemetry?.ip_address || "Unknown";
                if (!ipGroups[ip]) ipGroups[ip] = { count: 0, verdicts: [], users: [] };
                ipGroups[ip].count++;
                ipGroups[ip].verdicts.push(verdict);
                if (!ipGroups[ip].users.includes(s.username)) ipGroups[ip].users.push(s.username);

                // Location grouping
                if (s.telemetry?.lat && s.telemetry?.lon) {
                    const locKey = `${s.telemetry.lat.toFixed(2)},${s.telemetry.lon.toFixed(2)}`;
                    if (!locationGroups[locKey]) locationGroups[locKey] = { count: 0, lat: s.telemetry.lat, lon: s.telemetry.lon, users: [], verdicts: [] };
                    locationGroups[locKey].count++;
                    locationGroups[locKey].verdicts.push(verdict);
                    if (!locationGroups[locKey].users.includes(s.username)) locationGroups[locKey].users.push(s.username);
                }

                // User targeting
                if (!userTargets[s.username]) userTargets[s.username] = { attempts: 0, verdict: "safe" };
                userTargets[s.username].attempts += (s.attempts || 1);
                if (verdict === "critical") userTargets[s.username].verdict = "critical";
                else if (verdict === "warning" && userTargets[s.username].verdict !== "critical") userTargets[s.username].verdict = "warning";

                // Threat types
                if (s.telemetry?.risk_status?.some((r: string) => r.includes("BOT"))) threatTypes.bot++;
                if (s.telemetry?.mouse_velocity > 2000) threatTypes.bot++;
                if (s.telemetry?.tab_switch_count > 2) threatTypes.devtools++;
                if (s.telemetry?.avg_keystroke_delay < 0.05) threatTypes.paste++;
                if (s.telemetry?.bytes_sent > 100000000) threatTypes.highData++;
                if (s.attempts > 2) threatTypes.bruteForce++;
            });

            return NextResponse.json({
                success: true,
                analytics: {
                    totalSessions: sessions.length,
                    verdicts,
                    ipGroups,
                    locationGroups,
                    userTargets,
                    threatTypes,
                    uniqueIps: Object.keys(ipGroups).length,
                    bruteForceAttempts: Object.values(userTargets).filter((u: any) => u.attempts > 2).length
                }
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
