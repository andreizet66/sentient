import "./App.css";
import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaPencilAlt } from "react-icons/fa";
import { FaEye} from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";



const API = `${window.location.origin.replace(/:[0-9]+$/, ':8000')}/history`;
const SETTINGS_API = `${window.location.origin.replace(/:[0-9]+$/, ':8000')}/settings`;


// ========== SETTINGS HELPERS ==========
async function loadSettings() {
  try {
    const r = await fetch(SETTINGS_API, { cache: "no-store" });
    if (!r.ok) throw 0;
    return await r.json();
  } catch {
    const ls = JSON.parse(localStorage.getItem("sentinelSettings") || "{}");
    return { aliases: ls.aliases || {}, hidden: ls.hidden || [] };
  }
}

async function saveSettings(patch) {
  try {
    const r = await fetch(SETTINGS_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw 0;
    return await r.json();
  } catch {
    // Local fallback mirror
    const cur = JSON.parse(localStorage.getItem("sentinelSettings") || "{}");
    const next = {
      aliases: { ...(cur.aliases || {}) },
      hidden: [...(cur.hidden || [])],
    };
    if (patch.aliases)
      next.aliases = { ...next.aliases, ...patch.aliases };
    if (patch.hiddenSet !== undefined)  // if we send full list explicitly
      next.hidden = patch.hiddenSet;
    localStorage.setItem("sentinelSettings", JSON.stringify(next));
    return next;
  }
}

// ========== UTILITIES ==========
function niceBytes(bytes) {
  if (bytes == null) return "N/A";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(2)} ${units[i]}`;
}

// ========== PROGRESS BAR (rounded, glowing) ==========
function Bar({ pct }) {
  const safePct = Math.min(Math.max(pct ?? 0, 0), 100);
  const visualPct = Math.max(safePct, 2); // keep a visible rounded tip even at 1 %

  const usedColor =
    safePct >= 90
      ? "rgba(255,0,0,0.8)"     // red alert
      : safePct >= 70
      ? "rgba(255,200,0,0.8)"   // yellow warning
      : "rgba(0,255,128,0.8)";  // green normal

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "12px",
        background: "rgba(0,255,128,0.1)",
        borderRadius: "9999px",
        overflow: "hidden",               // keeps left edge rounded
        boxShadow: "inset 0 0 6px #00ff80",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 0,
          height: "100%",
          width: `${visualPct}%`,
          background: usedColor,
          borderRadius: "9999px",
          boxShadow: "0 0 8px #00ff80",
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ========== SMART TABLE ==========
function SmartTable({ rows }) {
  if (!rows || rows.length === 0)
    return <div className="text-xs opacity-70">No SMART data.</div>;
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set())
  ).filter((k) => k !== "name");

  return (
    <div className="overflow-auto border border-white/10 rounded-md mt-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5">
            <th className="text-left p-2 whitespace-nowrap">Name</th>
            {keys.map((k) => (
              <th key={k} className="text-left p-2 whitespace-nowrap">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white/0 even:bg-white/5">
              <td className="p-2 font-mono">{r.name}</td>
              {keys.map((k) => (
                <td key={k} className="p-2 font-mono whitespace-nowrap">
                  {r[k] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== HISTORY CHART ==========//
function HistoryChart({ data }) {
  if (!data || data.length === 0) return null;

  // Format last 24h data points
  const recent = data.slice(-24);

  // --- Compute averages from actual fields: temperature, health ---
  const avgTemp =
    recent.reduce((sum, x) => sum + (Number(x.temperature) || 0), 0) /
    recent.length;
  const avgHealth =
    recent.reduce((sum, x) => sum + (Number(x.health) || 0), 0) /
    recent.length;

  // --- Threshold-based color logic ---
  const tempColor =
    avgTemp > 55
      ? "#ff4040" // red
      : avgTemp > 40
      ? "#ffff66" // yellow
      : "#00ff80"; // green

  const healthColor =
    avgHealth < 80
      ? "#ff4040" // red
      : avgHealth < 100
      ? "#ffff66" // yellow
      : "#00ff80"; // green

  return (
    <div className="mt-3" style={{ width: "100%", height: 150 }}>
      <ResponsiveContainer>
        <LineChart
          data={recent}
          margin={{ top: 10, right: 20, left: 40, bottom: 25 }}
        >
          {/* Y-axis (0–100) */}
          <YAxis
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "#00ff80", fontSize: 10, fontFamily: "Courier New" }}
            axisLine={{ stroke: "#00ff80", strokeWidth: 1 }}
            tickLine={{ stroke: "#00ff80" }}
            domain={[0, 100]}
            mirror={true}
          />

          <XAxis
            dataKey="time"
            interval={1}
            ticks={[
              "0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00",
              "14:00", "16:00", "18:00", "20:00", "22:00"
            ]}
            tick={{
              fill: "#00ff80",
              fontSize: 10,
              fontFamily: "Courier New",
              angle: -45,
              dy: 10,
              dx: -5,
            }}
            axisLine={{ stroke: "#00ff80", strokeWidth: 1 }}
            tickLine={{ stroke: "#00ff80" }}
            height={35}
          />
            {/* Tooltip */}
            <Tooltip
              cursor={{ stroke: "#00ff80", strokeWidth: 1, opacity: 0.2 }}
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                border: "1px solid #00ff80",
                borderRadius: "12px", // matches card corners
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                color: "#00ff80",
                textShadow: "0 0 4px #00ff80",
                boxShadow: "0 0 10px rgba(0,255,128,0.2)",
                padding: "8px 10px",
              }}
              labelStyle={{
                color: "#00ff80",
                fontWeight: "bold",
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "4px",
              }}
              formatter={(value, name) => {
                // --- dynamic color rules ---
                let valueColor = "#00ff80"; // green default
                if (name === "health") {
                  if (value < 80) valueColor = "#ff4040"; // red
                  else if (value < 100) valueColor = "#ffff66"; // yellow
                }
                if (name === "temperature") {
                  if (value > 55) valueColor = "#ff4040"; // red
                  else if (value > 40) valueColor = "#ffff66"; // yellow
                }

                // --- formatted value strings ---
                const formattedValue =
                  name === "health"
                    ? `${value}%`
                    : name === "temperature"
                    ? `${Math.round(value)} °C`
                    : value;

                // --- label display (H: / T:) ---
                const labelText = name === "health" ? "H:" : name === "temperature" ? "T:" : name;

                return [
                  <span
                    style={{
                      color: valueColor,
                      fontWeight: "bold",
                      textShadow: `0 0 4px ${valueColor}`,
                    }}
                  >
                    {formattedValue}
                  </span>,
                  labelText,
                ];
              }}
              labelFormatter={(label) => `${label}`}
              itemStyle={{
                fontWeight: "bold",
                color: "#00ff80",
                textShadow: "0 0 3px #00ff80",
              }}
            />

          {/* Lines */}
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={tempColor}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="health"
            stroke={healthColor}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        className="text-[10px] mt-1 opacity-70"
        style={{ textAlign: "center", fontFamily: "'Courier New', monospace" }}
      >
        <span style={{ color: healthColor }}>⭘ health</span>{" "}
        <span style={{ color: tempColor, marginLeft: "10px" }}>⭘ temperature</span>
      </div>
    </div>
  );
}


// ========== DRIVE CARD ==========
function DriveCard({ d, settings, onSettingsChange, isHiddenMode }) {
const [showSmart, setShowSmart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editing, setEditing] = useState(false);
  const id = d.id || "";
  const currentAlias = settings?.aliases?.[id] || "";
  const [tempAlias, setTempAlias] = useState(currentAlias);

 if (typeof window !== "undefined" && !window._allDrives) window._allDrives = []; 

  useEffect(() => setTempAlias(currentAlias), [currentAlias]);

  async function commitAlias() {
    const alias = (tempAlias || "").trim();
    const next = await saveSettings({ aliases: { [id]: alias } });
    onSettingsChange(next);
    setEditing(false);
  }

  function onAliasKey(e) {
    if (e.key === "Enter") commitAlias();
    if (e.key === "Escape") {
      setTempAlias(currentAlias);
      setEditing(false);
    }
  }

 const smartRef = useRef(null);
const [smartHeight, setSmartHeight] = useState(0);

useEffect(() => {
  if (showSmart && smartRef.current) {
    setSmartHeight(smartRef.current.scrollHeight);
  } else {
    setSmartHeight(0);
  }
}, [showSmart, d.description, d.tip]);
 
const [fadeState, setFadeState] = useState("hidden"); // "visible" | "hiding" | "hidden"

useEffect(() => {
  // States: "hidden" | "showing" | "visible" | "hiding"
  if (showHistory) {
    if (fadeState === "hidden" || fadeState === "hiding") {
      // allow one frame so browser paints the closed state, then open
      requestAnimationFrame(() => setFadeState("showing"));
      const t = setTimeout(() => setFadeState("visible"), 20);
      return () => clearTimeout(t);
    }
  } else {
    if (fadeState === "visible" || fadeState === "showing") {
      setFadeState("hiding");
      const t = setTimeout(() => setFadeState("hidden"), 800); // match CSS transition
      return () => clearTimeout(t);
    }
  }
}, [showHistory, fadeState]);



  return (
    <div
      className="drive-card w-[360px] relative transition-all duration-500 ease-in-out"
      id={`drive-${id}`}
      style={{
        overflow: "hidden",
        height: showSmart ? "auto" : "fit-content",
      }}
    >
      {/* ---------- Alias + Buttons ---------- */}
      <div className="mb-2 text-center relative">
        {editing && (
          <input
            autoFocus
            value={tempAlias}
            onChange={(e) => setTempAlias(e.target.value)}
            onKeyDown={onAliasKey}
            onBlur={commitAlias}
            placeholder="Type a name…"
            className="rename-input"
          />
        )}

        {/* Rename button */}
        <button
          title={editing ? "Save name" : "Rename drive"}
          onClick={() => (editing ? commitAlias() : setEditing(true))}
          style={{
            position: "absolute",
            top: "-4px",
            left: "6px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(0,255,128,0.25) 0%, rgba(0,0,0,0.8) 70%)",
            border: "1px solid rgba(0,255,128,0.6)",
            boxShadow:
              "0 0 8px rgba(0,255,128,0.8), inset 0 0 4px rgba(0,255,128,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 99999,
            transition: "all 0.2s ease",
            color: "#00ff80",
          }}
        >
          <FaPencilAlt
            style={{
              transform: "scale(5.5)",
              filter: "drop-shadow(0 0 6px #00ff80)",
              transformOrigin: "center center",
            }}
          />

        </button>

        {/* Hide / Unhide button – toggles based on mode */}
        {!isHiddenMode ? (
          // Normal view → show Hide button
          <button
            title="Hide this drive"
            onClick={async () => {
              const currentlyHidden = new Set(settings.hidden || []);
              if (currentlyHidden.has(id)) currentlyHidden.delete(id);
              else currentlyHidden.add(id);
              const next = await saveSettings({
                hiddenSet: Array.from(currentlyHidden),
              });
              onSettingsChange(next);
            }}
            style={{
              position: "absolute",
              top: "-4px",
              left: "299px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at center, rgba(0,255,128,0.25) 0%, rgba(0,0,0,0.8) 70%)",
              border: "1px solid rgba(0,255,128,0.6)",
              boxShadow:
                "0 0 8px rgba(0,255,128,0.8), inset 0 0 4px rgba(0,255,128,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#00ff80",
            }}
          >
            <div style={{ overflow: "visible" }}>
              <FaEye
                style={{
                  fontSize: "16px",
                  transform: "scale(1) translateY(2px)",
                  color: "#00ff80",
                  fill: "#00ff80",
                  stroke: "#00ff80",
                  strokeWidth: "10px",
                  filter: "drop-shadow(0 0 6px #00ff80)",
                  transformOrigin: "center center",
                }}
              />
            </div>
          </button>
        ) : (
          // Hidden-drives view → show Unhide button
          <button
            title="Unhide this drive"
            onClick={async () => {
              const nextHidden = (settings.hidden || []).filter((x) => x !== id);
              const next = await saveSettings({ hiddenSet: nextHidden });
              onSettingsChange(next);
            }}
            style={{
              position: "absolute",
              top: "-4px",
              left: "299px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at center, rgba(0,255,128,0.25) 0%, rgba(0,0,0,0.8) 70%)",
              border: "1px solid rgba(0,255,128,0.6)",
              boxShadow:
                "0 0 8px rgba(0,255,128,0.8), inset 0 0 4px rgba(0,255,128,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#00ff80",
            }}
          >
            <FaEyeSlash
              style={{
                transform: "scale(2.5) translateY(1px)",
                color: "#00ff80",
                filter: "drop-shadow(0 0 6px #00ff80)",
                transformOrigin: "center center",
              }}
            />
          </button>
        )}
      </div>

      {/* ---------- Drive Info ---------- */}
      <div className="text-center mb-4">
        <div className="font-bold text-[1.15rem] text-emerald-300 mb-1">
          {currentAlias || "Unnamed Drive"}
        </div>

        {/* System Drive badge */}
        {d.logical_drive?.toUpperCase() === "C:" && (
          <div className="system-label">SYSTEM DRIVE</div>
        )}

        <div className="text-sm text-emerald-200 opacity-80 mb-[2px]">
          {d.model || "—"}
        </div>
        <div className="text-sm text-emerald-200 opacity-80">
          {d.interface || "—"} | SN {d.serial || "—"}
        </div>
      </div>


      {/* ---------- Stats (unified Storage Pool + P: logic) ---------- */}
      
      {(() => {
        const model = (d.model || "").toLowerCase();
        const id = (d.id || "").toLowerCase();
        const iface = (d.interface || "").toLowerCase();
        const letter = (d.logical_drive || "").trim().toUpperCase();

        // ✅ Unified detection
        const isStoragePool =
          letter === "P:" ||
          model.includes("msft storage space") ||
          model.includes("windows storage space") ||
          id.includes("msftstorage") ||
          id.includes("storagespace");

        const isPooled =
          !isStoragePool &&
          letter === "" &&
          (iface.includes("usb") || iface.includes("sata") || iface.includes("ata"));

        // 🟢 Virtual Storage Pool (drive letter P)
          if (isStoragePool) {
            return (
              <div className="stats text-center font-mono leading-relaxed mb-4 relative">

               {/* Non-breaking visual badge overlay */}
                <div className="pool-badge">WINDOWS STORAGE SPACES POOL</div>

                <div className="mt-1">
                  <span className="font-bold text-emerald-300">Drive letter:</span>{" "}
                  <span>{letter || "—"}</span>
                </div>
              </div>
            );
          }

          // 🟡 Physical pooled disk
          if (isPooled) {
            return (
              <div className="stats text-center font-mono leading-relaxed mb-4">
                <div className="mt-2">
                  <span className="font-bold text-emerald-300">Temp:</span>
                  <span className="opacity-70"> ............ </span>
                  <span
                    className={
                      d.temperature_c > 55
                        ? "temp-hot"
                        : d.temperature_c > 40
                        ? "temp-warm"
                        : ""
                    }
                  >
                    {d.temperature_c != null ? `${d.temperature_c} °C` : "N/A"}
                  </span>
                </div>

                <div className="mt-1">
                  <span className="font-bold text-emerald-300">Health:</span>
                  <span className="opacity-70"> ............. </span>
                  <span
                    className={
                      d.health_pct < 85
                        ? "health-bad"
                        : d.health_pct < 100
                        ? "health-warn"
                        : ""
                    }
                  >
                    {d.health_pct != null ? `${d.health_pct}%` : "N/A"}
                  </span>

                </div>

                <div className="mt-1">
                  <span className="font-bold text-emerald-300">Power-on:</span>{" "}
                  <span>{d.power_on_time || "N/A"}</span>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0 10px",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    color: "#00ff80",
                    fontWeight: "normal",
                    textShadow: "0 0 2px #00ff80, 0 0 5px #00ff80",
                  }}
                >
                  Drive is part of a Windows Storage Pool
                </div>

              </div>
            );
          }


        // ⚪ Normal standalone drive
        return (
          <div className="stats text-center font-mono leading-relaxed mb-4">
            <div className="mt-2">
              <span className="font-bold text-emerald-300">Temp:</span>
              <span className="opacity-70"> ............ </span>
              <span
                className={
                  d.temperature_c > 55
                    ? "temp-hot"
                    : d.temperature_c > 40
                    ? "temp-warm"
                    : ""
                }
              >
                {d.temperature_c != null ? `${d.temperature_c} °C` : "N/A"}
              </span>
            </div>

            <div className="mt-1">
              <span className="font-bold text-emerald-300">Health:</span>
              <span className="opacity-70"> ............. </span>
              <span
                className={
                  d.health_pct < 85
                    ? "health-bad"
                    : d.health_pct < 100
                    ? "health-warn"
                    : ""
                }
              >
                {d.health_pct != null ? `${d.health_pct}%` : "N/A"}
              </span>

            </div>

            <div className="h-3" />
            <div className="mt-1">
              <span className="font-bold text-emerald-300">Power-on:</span>{" "}
              <span>{d.power_on_time || "N/A"}</span>
            </div>
            <div className="h-3" />
            <div className="mt-1">
              <span className="font-bold text-emerald-300">Drive letter:</span>{" "}
              <span>{letter || "—"}</span>
            </div>
          </div>
        );

        })()}


      {/* ---------- Usage (hidden for pooled drives) ---------- */}
      {(() => {
        const model = (d.model || "").toLowerCase();
        const iface = (d.interface || "").toLowerCase();
        const letter = (d.logical_drive || "").trim();

        const isVirtualPool =
          model.includes("msft storage space") || model.includes("windows storage space");
        const isPooled =
          !isVirtualPool &&
          letter === "" &&
          (iface.includes("usb") || iface.includes("sata") || iface.includes("ata"));

        // ❌ skip usage bar + sizes for pooled physical drives
        if (isPooled) return null;

        return (
          <>
            <div className="mb-1 flex justify-center text-xs">
              <div className="font-bold text-emerald-300">
                {niceBytes(d.bytes_used)} / {niceBytes(d.bytes_total)}
              </div>
            </div>
            <Bar pct={d.used_pct ?? 0} />
            <div className="text-center text-[11px] opacity-70 mt-1">
              {d.used_pct != null ? `${d.used_pct}% used` : "N/A"}
            </div>
          </>
        );
      })()}

      {/* ---------- SMART summary toggle (auto-resizing card) ---------- */}
      <div
        style={{
          height: smartHeight,
          overflow: "hidden",
          transition: "height 0.4s ease-in-out, opacity 0.3s ease-in-out",
          opacity: showSmart ? 1 : 0,
        }}
      >
        <div ref={smartRef}>
          {(d.description || d.tip) && (
            <div className="mt-3 text-xs opacity-80 space-y-1">
              {d.description && <div>• {d.description}</div>}
              {d.tip && <div>• {d.tip}</div>}
            </div>
          )}
        </div>
      </div>

      {/* ---------- SMART + HISTORY or SHOW DRIVES ---------- */}
      {(
        (typeof d.model === "string" &&
          d.model.toLowerCase().includes("storage space")) ||
        (typeof d.description === "string" &&
          d.description.includes("Windows Storage Pool"))
      ) ? (
        <>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setShowSmart((v) => !v)}
              className="flex-1 text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 text-center"
              style={{ maxWidth: "130px" }}
            >
              {showSmart ? "Hide Drives" : "Show Drives"}
            </button>
          </div>

          {/* Animated drive list for Storage Pool */}
          <div
            ref={(el) => (window._poolListRef = el)}
            style={{
              height: showSmart
                ? `${window._poolListRef?.scrollHeight || 0}px`
                : "0px",
              opacity: showSmart ? 1 : 0,
              overflow: "hidden",
              transition:
                "height 0.4s ease-in-out, opacity 0.4s ease-in-out",
              marginTop: "8px",
            }}
          >
            <div className="pool-drive-list">
              {Array.isArray(window._allDrives) ? (
                window._allDrives
                  .filter(
                    (x) =>
                      // exclude the pool card itself
                      !(x.model?.toLowerCase().includes("storage space")) &&
                      // include drives with no logical drive letter
                      (!x.logical_drive || x.logical_drive.trim() === "")
                  )
                  .map((drv) => {
                    const alias = settings.aliases?.[drv.id];
                    const safeAlias =
                      typeof alias === "string"
                        ? alias
                        : typeof drv.model === "string"
                        ? drv.model
                        : String(drv.id || "Unknown Drive");

                    return (
                      <div key={drv.id} className="pool-drive-item">
                        <div className="pool-drive-name">
                          {">"} {safeAlias}
                        </div>
                        <div className="pool-drive-attrs">
                          {drv.model || "—"}
                        </div>
                        <div className="pool-drive-attrs">
                          SN {drv.serial || "—"}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div
                  className="text-xs opacity-70"
                  style={{ textAlign: "center" }}
                >
                  No drives detected yet.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
          <div
            className="mt-3 flex justify-center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0",                // neutralize any Tailwind gap interference
            }}
          >
            <button
              onClick={() => setShowSmart((v) => !v)}
              className="flex-1 text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 text-center"
              style={{
                maxWidth: "130px",
                marginRight: "14px",   // 👈 actual space between the two buttons
              }}
            >
              {showSmart ? "Hide SMART" : "Show SMART"}
            </button>

            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex-1 text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 text-center"
              style={{
                maxWidth: "130px",
              }}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>
      )}

      {/* ---------- History Graph (last 24h, smooth fade in/out) ---------- */}
      {(() => {
        const opening = fadeState === "showing" || fadeState === "visible";
        const mounted = fadeState !== "hidden";

        return (
          <div
            style={{
              overflow: "hidden",
              transition:
                "max-height 0.8s ease-in-out, opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
              maxHeight: opening ? "250px" : "0px",
              opacity: opening ? 1 : 0,
              transform: opening ? "translateY(0)" : "translateY(15px)",
              marginTop: "8px",
            }}
          >
            {mounted && (
              <HistoryChart
                data={
                  d.history && d.history.length > 0
                    ? d.history.map((h) => ({
                        time: h.time,
                        temperature: h.temperature_c,
                        health: h.health_pct,
                      }))
                    : Array.from({ length: 24 }, (_, i) => ({
                        time: `${i}:00`,
                        temperature:
                          (d.temperature_c ?? 35) + Math.sin(i / 3) * 2,
                        health: d.health_pct ?? 100,
                      }))
                }
              />
            )}
          </div>
        );
      })()}


    </div>
  );
}


// ========== TIME HELPERS (Europe/Bucharest + "ago") ==========
const TZ = "Europe/Bucharest";

function formatTs(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(d);
}

function fromNow(ts) {
  if (!ts) return "";
  const now = new Date();
  const then = new Date(ts);
  let diff = Math.round((then.getTime() - now.getTime()) / 1000); // seconds
  const abs = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (abs < 60) return rtf.format(Math.round(diff), "second");
  diff = Math.round(diff / 60);
  if (Math.abs(diff) < 60) return rtf.format(diff, "minute");
  diff = Math.round(diff / 60);
  if (Math.abs(diff) < 24) return rtf.format(diff, "hour");
  diff = Math.round(diff / 24);
  return rtf.format(diff, "day");
}

// ========== MAIN APP ==========
export default function App() {
  const [data, setData] = useState({ drives: [] });
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState({ aliases: {}, hidden: [] });
  const [showHidden, setShowHidden] = useState(false);

  async function fetchNow() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // 🟢 Preserve generated_at and source_mtime fields
      setData({
        drives: Array.isArray(json) ? json : json.drives || [],
        generated_at: json.generated_at ?? null,
        source_mtime: json.source_mtime ?? null,
      });

      setErr("");
    } catch (e) {
      setErr(String(e));
    }
  }


  useEffect(() => {
    fetchNow();
    loadSettings().then(setSettings).catch(() => {});
    const t = setInterval(fetchNow, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
  // always scroll to top on initial load
  window.scrollTo({ top: 0, behavior: "instant" });
}, []);


 useEffect(() => {
  if (typeof window !== "undefined") {
    window._allDrives = Array.isArray(data.drives) ? data.drives : [];
  }
}, [data.drives]);
  
  return (
      <div
        className="min-h-screen px-4 text-white"
        style={{
          paddingTop: "80px",
          paddingBottom: "100px",
          background:
            "radial-gradient(circle at center, rgba(0,40,0,0) 0%, rgba(0,0,0,0) 100%)",
          backgroundAttachment: "fixed",          // 👈 keeps it fixed to viewport
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",                // 👈 stretches to fill
        }}
      >
      <div className="header-band">
          <h1>Sentient</h1>
          <h2>Disk array monitoring contraption</h2>
      </div>
      {err && <div className="text-sm text-red-400 mb-3">Error: {err}</div>}

      {/* === Drive Cards === */}
        <div
          className="cards-wrapper"
          style={{
            marginTop: "0px",
            paddingTop: "10px",
          }}
        >
          {data.drives
            .filter((d) =>
              showHidden
                ? settings.hidden.includes(d.id)
                : !settings.hidden.includes(d.id)
            )
            .map((d) => (
              <DriveCard
                key={`${d.id}-${showHidden}`}
                d={d}
                settings={settings}
                onSettingsChange={setSettings}
                isHiddenMode={showHidden}   // ✅ this line is critical
              />
            ))}
        </div>


      {/* === Footer Bar === */}
      <div className="footer-bar">
        <button
          id="toggleHiddenBtn"
          onClick={() => setShowHidden((v) => !v)}
        >
          {showHidden ? "Back to Dashboard" : "Show Hidden Drives"}
        </button>


        <div className="footer-info">
          <div className="footer-line line1">
            <strong>Last Updated:</strong>{" "}
            {formatTs(data.generated_at)} ({fromNow(data.generated_at)})
          </div>
          <div className="footer-line line2">
            <strong>Last Sentinel Export:</strong>{" "}
            {formatTs(data.source_mtime)} ({fromNow(data.source_mtime)})
          </div>
        </div>
      </div>
    </div>
  );
}

