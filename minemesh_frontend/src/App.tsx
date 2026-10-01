import { useEffect, useMemo, useState } from "react";
import {
  getAlerts,
  getDeformation,
  getNodes,
  getPrediction,
  getSystemStatus,
  isMockMode,
} from "./services/api";
import type { AlertItem, DeformationPoint, RiskLevel, SensorNode, SystemStatus } from "./types";

type Page = "dashboard" | "map" | "nodes" | "ai" | "trends" | "alerts" | "network";

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Overview", icon: "⌂" },
  { id: "map", label: "Mine Map", icon: "⌖" },
  { id: "nodes", label: "Sensor Network", icon: "◉" },
  { id: "ai", label: "AI Risk Engine", icon: "✦" },
  { id: "trends", label: "Analytics", icon: "⌁" },
  { id: "alerts", label: "Alerts", icon: "!" },
  { id: "network", label: "System Health", icon: "⌘" },
];

const tone = (level: RiskLevel) =>
  level === "Critical" ? "critical" : level === "Warning" ? "warning" : "normal";

function StatusDot({ level }: { level: RiskLevel }) {
  return <span className={`status-dot ${tone(level)}`} />;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`risk-badge ${tone(level)}`}>{level}</span>;
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [deformation, setDeformation] = useState<DeformationPoint[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [system, setSystem] = useState<SystemStatus>({
    gateway: "offline",
    aiEngine: "offline",
    mesh: "offline",
    lastUpdate: "—",
  });
  const [selectedNodeId, setSelectedNodeId] = useState("N05");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  async function refresh() {
    try {
      const [n, a, d, p, s] = await Promise.all([
        getNodes(),
        getAlerts(),
        getDeformation(),
        getPrediction(),
        getSystemStatus(),
      ]);
      setNodes(n);
      setAlerts(a);
      setDeformation(d);
      setPrediction(p);
      setSystem(s);
      setLastSyncedAt(new Date());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load monitoring data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const syncInterval = 5 * 60 * 1000;
    refresh();
    const delayUntilNextSync = syncInterval - (Date.now() % syncInterval);
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      refresh();
      intervalId = window.setInterval(refresh, syncInterval);
    }, delayUntilNextSync);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const lastSyncTime = lastSyncedAt?.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) ?? "Waiting for first sync";

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0];
  const normalCount = nodes.filter((n) => n.riskLevel === "Normal").length;
  const warningCount = nodes.filter((n) => n.riskLevel === "Warning").length;
  const criticalCount = nodes.filter((n) => n.riskLevel === "Critical").length;
  const overallRisk = useMemo(
    () => Math.round(nodes.reduce((sum, n) => sum + n.risk, 0) / Math.max(nodes.length, 1)),
    [nodes],
  );
  const overallLevel: RiskLevel =
    overallRisk >= 70 ? "Critical" : overallRisk >= 30 ? "Warning" : "Normal";

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="boot-logo">MG</div>
        <div className="loader" />
        <p>Initializing MineGuard AI</p>
        <small>Loading field monitoring system…</small>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">MG</div>
          <div>
            <strong>MINEGUARD</strong>
            <span>AI FIELD INTELLIGENCE</span>
          </div>
        </div>

        <div className="side-status">
          <span className="online-dot" />
          <div>
            <strong>System operational</strong>
            <small>Syncs every 5 minutes · Last sync {lastSyncTime}</small>
          </div>
        </div>

        <p className="nav-caption">MONITORING</p>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "alerts" && alerts.filter((a) => !a.resolved && a.level !== "Normal").length > 0 && (
                <span className="nav-count">
                  {alerts.filter((a) => !a.resolved && a.level !== "Normal").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`mode-pill ${isMockMode() ? "demo" : "live"}`}>
            <span className="status-dot" />
            {isMockMode() ? "SIMULATION MODE" : "LIVE DATA"}
          </div>
          <p>Mine Subsidence Monitoring</p>
          <small>AI + ESP32 + Wireless Mesh</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MINE SUBSIDENCE INTELLIGENCE PLATFORM</p>
            <h1>{navItems.find((item) => item.id === page)?.label}</h1>
          </div>
          <div className="topbar-right">
            <div className="date-time-chip" aria-label={`Current date and time: ${formattedDate}, ${formattedTime}`}>
              <span>{formattedDate}</span>
              <strong>{formattedTime}</strong>
            </div>
            <div className="live-chip">
              <span className="online-dot" />
              LIVE MONITORING
            </div>
            <button className="icon-button" title="Refresh data" onClick={refresh}>↻</button>
          </div>
        </header>

        {error && <div className="error-banner">⚠ {error}</div>}

        {page === "dashboard" && (
          <Dashboard
            nodes={nodes}
            alerts={alerts}
            overallRisk={overallRisk}
            overallLevel={overallLevel}
            normalCount={normalCount}
            warningCount={warningCount}
            criticalCount={criticalCount}
            deformation={deformation}
            prediction={prediction}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              setPage("nodes");
            }}
            onNavigate={setPage}
          />
        )}

        {page === "map" && <MineMap nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />}
        {page === "nodes" && <NodePage nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNodeId} />}
        {page === "ai" && <AiPage prediction={prediction} />}
        {page === "trends" && <TrendsPage deformation={deformation} nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={(id) => { setSelectedNodeId(id); setPage("nodes"); }} />}
        {page === "alerts" && <AlertsPage alerts={alerts} />}
        {page === "network" && <NetworkPage nodes={nodes} system={system} />}
      </main>
    </div>
  );
}

function Dashboard({
  nodes, alerts, overallRisk, overallLevel, normalCount, warningCount, criticalCount,
  deformation, prediction, onSelectNode, onNavigate,
}: {
  nodes: SensorNode[]; alerts: AlertItem[]; overallRisk: number; overallLevel: RiskLevel;
  normalCount: number; warningCount: number; criticalCount: number;
  deformation: DeformationPoint[]; prediction: any;
  onSelectNode: (id: string) => void; onNavigate: (page: Page) => void;
}) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | null>(null);
  const selectedRiskNodes = nodes.filter((node) => node.riskLevel === selectedRiskLevel);

  return (
    <div className="page-grid dashboard-grid">
      <section className="overview-strip span-2">
        <div className="overview-title">
          <div className="pulse-ring"><span /></div>
          <div>
            <p className="card-label">CURRENT MINE CONDITION</p>
            <h2>Field safety overview</h2>
          </div>
        </div>
        <div className="overview-actions">
          <button onClick={() => onNavigate("map")}>Open live map <span>→</span></button>
          <button onClick={() => onNavigate("alerts")}>View alerts <span>→</span></button>
        </div>
      </section>

      <section className={`risk-hero ${tone(overallLevel)}`}>
        <div className="hero-top">
          <div>
            <p className="card-label">OVERALL RISK SCORE</p>
            <div className="big-risk">{overallRisk}<span>%</span></div>
            <RiskBadge level={overallLevel} />
          </div>
          <RiskRing score={overallRisk} />
        </div>
        <div className="risk-scale-mini">
          <span><i className="normal" /> Normal 0–30</span>
          <span><i className="warning" /> Warning 30–70</span>
          <span><i className="critical" /> Critical 70–100</span>
        </div>
      </section>

      <section className="status-card">
        <div className="section-heading">
          <div><p className="card-label">FIELD UNITS</p><h2>Sensor health</h2></div>
          <span className="live-text">● LIVE</span>
        </div>
        <div className="status-counts">
          {(["Normal", "Warning", "Critical"] as RiskLevel[]).map((level) => {
            const count = level === "Normal" ? normalCount : level === "Warning" ? warningCount : criticalCount;
            return (
              <button
                key={level}
                className={`status-box ${tone(level)} ${selectedRiskLevel === level ? "selected" : ""}`}
                onClick={() => setSelectedRiskLevel((current) => current === level ? null : level)}
                aria-pressed={selectedRiskLevel === level}
              >
                <StatusDot level={level} /><strong>{count}</strong><span>{level}</span>
              </button>
            );
          })}
        </div>
        <div className="sensor-summary"><span>{nodes.filter(n => n.status === "online").length}/{nodes.length} nodes online</span><span>Mesh {nodes.filter(n => n.status === "online").length > 0 ? "healthy" : "offline"}</span></div>
        {selectedRiskLevel && (
          <div className="risk-sensor-list">
            <span>{selectedRiskLevel} sensors</span>
            <div>
              {selectedRiskNodes.map((node) => (
                <button key={node.id} onClick={() => onSelectNode(node.id)}>
                  <StatusDot level={node.riskLevel} /> {node.id} · {node.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="card map-card span-2">
        <div className="section-heading">
          <div><p className="card-label">GEOSPATIAL MONITORING</p><h2>Live mine map</h2><span className="muted">Sensor deployment & risk zones</span></div>
          <button className="ghost-button" onClick={() => onNavigate("map")}>EXPAND MAP ↗</button>
        </div>
        <MiniMap nodes={nodes} onSelectNode={onSelectNode} />
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="card-label">GROUND MOVEMENT</p><h2>Deformation trend</h2></div>
          <span className="metric-chip">{deformation.at(-1)?.value.toFixed(1) ?? "—"} mm</span>
        </div>
        <LineChart data={deformation} />
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="card-label">XGBOOST ENGINE</p><h2>AI risk factors</h2></div>
          <span className="confidence">{prediction?.confidence ?? 0}% confidence</span>
        </div>
        <FactorBars factors={prediction?.factors ?? {}} />
        <button className="full-button" onClick={() => onNavigate("ai")}>OPEN AI ANALYSIS <span>→</span></button>
      </section>

      <section className="card span-2">
        <div className="section-heading">
          <div><p className="card-label">SAFETY MONITOR</p><h2>Recent alerts</h2></div>
          <button className="text-button" onClick={() => onNavigate("alerts")}>VIEW ALL →</button>
        </div>
        <AlertList alerts={alerts.slice(0, 4)} />
      </section>
    </div>
  );
}

function RiskRing({ score }: { score: number }) {
  return (
    <div className="risk-ring" style={{ "--progress": `${score * 3.6}deg` } as React.CSSProperties}>
      <div><strong>{score}%</strong><small>RISK</small></div>
    </div>
  );
}

function MiniMap({ nodes, onSelectNode }: { nodes: SensorNode[]; onSelectNode: (id: string) => void }) {
  const positions = [[13,27],[35,18],[54,43],[24,66],[72,70],[47,77],[82,29],[67,16]];
  return (
    <div className="mine-map mini">
      <div className="map-grid" />
      <div className="topographic t1" /><div className="topographic t2" /><div className="topographic t3" />
      <div className="map-label label-a">NORTH PIT</div>
      <div className="map-label label-b">CENTRAL ZONE</div>
      <div className="map-label label-c">SOUTH PIT</div>
      <div className="map-road road-a" /><div className="map-road road-b" />
      {nodes.map((node, index) => {
        const [left, top] = positions[index % positions.length];
        return (
          <button key={node.id} className={`map-node ${tone(node.riskLevel)} ${node.status === "offline" ? "offline" : ""}`}
            style={{ left: `${left}%`, top: `${top}%` }} onClick={() => onSelectNode(node.id)}>
            <span>{node.id.replace("N", "")}</span>
            <em>{node.risk}%</em>
          </button>
        );
      })}
      <div className="mesh-link link-1" /><div className="mesh-link link-2" /><div className="mesh-link link-3" />
      <div className="gateway-marker">⌁ <span>GATEWAY</span></div>
      <div className="map-overlay"><span><i className="normal" /> Normal</span><span><i className="warning" /> Warning</span><span><i className="critical" /> Critical</span></div>
    </div>
  );
}

function MineMap({ nodes, selectedNodeId, onSelectNode }: { nodes: SensorNode[]; selectedNodeId: string; onSelectNode: (id: string) => void }) {
  const positions = [[13,22],[38,17],[55,43],[79,25],[67,72],[43,78],[20,67],[84,61]];
  return (
    <div className="page-grid">
      <section className="card span-2">
        <div className="section-heading">
          <div><p className="card-label">FIELD DEPLOYMENT</p><h2>Mine intelligence map</h2><span className="muted">Select any sensor to inspect its live readings.</span></div>
          <div className="legend"><span><StatusDot level="Normal" /> Normal</span><span><StatusDot level="Warning" /> Warning</span><span><StatusDot level="Critical" /> Critical</span></div>
        </div>
        <div className="mine-map large">
          <div className="map-grid" />
          <div className="topographic t1" /><div className="topographic t2" /><div className="topographic t3" />
          <div className="map-zone zone-1">NORTH PIT</div><div className="map-zone zone-2">CENTRAL ZONE</div><div className="map-zone zone-3">EAST PIT</div><div className="map-zone zone-4">SOUTH PIT</div><div className="map-zone zone-5">WEST ZONE</div>
          <div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" />
          {nodes.map((node, index) => {
            const [left, top] = positions[index % positions.length];
            return (
              <button key={node.id} className={`map-node large ${tone(node.riskLevel)} ${node.id === selectedNodeId ? "selected" : ""} ${node.status === "offline" ? "offline" : ""}`}
                style={{ left: `${left}%`, top: `${top}%` }} onClick={() => onSelectNode(node.id)}>
                <span>{node.id}</span><em>{node.risk}%</em>
              </button>
            );
          })}
          <div className="gateway-marker large">⌁ <span>GATEWAY</span></div>
        </div>
      </section>
    </div>
  );
}

function NodePage({ nodes, selectedNode, onSelectNode }: { nodes: SensorNode[]; selectedNode?: SensorNode; onSelectNode: (id: string) => void }) {
  if (!selectedNode) return <div className="empty-state">No sensor nodes available.</div>;
  return (
    <div className="node-layout">
      <section className="card node-list">
        <div className="section-heading"><div><p className="card-label">ESP32 FIELD UNITS</p><h2>Sensor network</h2></div></div>
        {nodes.map((node) => (
          <button key={node.id} className={`node-row ${selectedNode.id === node.id ? "selected" : ""}`} onClick={() => onSelectNode(node.id)}>
            <span className={`node-status ${tone(node.riskLevel)}`}><StatusDot level={node.riskLevel} /></span>
            <div><strong>{node.name}</strong><small>{node.zone} · {node.status}</small></div>
            <RiskBadge level={node.riskLevel} />
          </button>
        ))}
      </section>
      <section className="node-detail">
        <div className={`card detail-header ${tone(selectedNode.riskLevel)}`}>
          <div className="node-title"><span className="node-id">{selectedNode.id}</span><div><p className="card-label">{selectedNode.zone}</p><h2>{selectedNode.name}</h2><span className="muted">Last packet {selectedNode.lastSeen}</span></div></div>
          <div className="detail-risk"><span>RISK</span><strong>{selectedNode.risk}%</strong><RiskBadge level={selectedNode.riskLevel} /></div>
        </div>
        <div className="metric-grid">
          <MetricCard label="Tilt X" value={`${selectedNode.tiltX.toFixed(1)}°`} icon="↗" />
          <MetricCard label="Tilt Y" value={`${selectedNode.tiltY.toFixed(1)}°`} icon="↘" />
          <MetricCard label="Vibration" value={`${selectedNode.vibration.toFixed(1)} mm/s`} icon="≋" />
          <MetricCard label="Displacement" value={`${selectedNode.displacement.toFixed(1)} mm`} icon="↓" />
          <MetricCard label="Movement rate" value={`${selectedNode.displacementRate.toFixed(1)} mm/hr`} icon="⌁" />
          <MetricCard label="Battery" value={`${selectedNode.battery}%`} icon="▰" />
          <MetricCard label="Signal" value={`${selectedNode.signal} dBm`} icon="⌁" />
          <MetricCard label="Connection" value={selectedNode.status === "online" ? "ONLINE" : "OFFLINE"} icon="●" />
        </div>
        <div className="card">
          <div className="section-heading"><div><p className="card-label">LOCAL INTERPRETATION</p><h2>Sensor condition</h2></div></div>
          <div className="interpretation">
            <div><span>Ground movement</span><strong>{selectedNode.risk > 60 ? "Increasing" : "Stable"}</strong><small>Based on current risk signal</small></div>
            <div><span>Vibration</span><strong>{selectedNode.vibration > 6 ? "High" : selectedNode.vibration > 3 ? "Elevated" : "Normal"}</strong><small>Current local reading</small></div>
            <div><span>Connectivity</span><strong>{selectedNode.status === "online" ? "Healthy" : "Lost"}</strong><small>Mesh packet status</small></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SensorRiskChart({ nodes, selectedNodeId, onSelectNode }: { nodes: SensorNode[]; selectedNodeId: string; onSelectNode: (id: string) => void }) {
  return (
    <div className="sensor-risk-chart" aria-label="Current risk score for every sensor">
      {nodes.map((node) => (
        <button
          key={node.id}
          className={`sensor-risk-bar ${tone(node.riskLevel)} ${node.id === selectedNodeId ? "selected" : ""}`}
          onClick={() => onSelectNode(node.id)}
          title={`${node.name}: ${node.risk}% risk`}
        >
          <span className="sensor-risk-value">{node.risk}%</span>
          <i style={{ height: `${Math.max(node.risk, 4)}%` }} />
          <strong>{node.id}</strong>
        </button>
      ))}
    </div>
  );
}

function AiPage({ prediction }: { prediction: any }) {
  return (
    <div className="page-grid">
      <section className={`risk-hero ai-hero ${tone(prediction.level)}`}>
        <div><p className="card-label">DEPLOYED XGBOOST OUTPUT</p><div className="big-risk">{prediction.score}<span>%</span></div><RiskBadge level={prediction.level} /><p className="hero-copy">{prediction.explanation}</p></div>
        <RiskRing score={prediction.score} />
      </section>
      <section className="card span-2">
        <div className="section-heading"><div><p className="card-label">MODEL INPUT INTERPRETATION</p><h2>Why is the risk changing?</h2><span className="muted">Feature contribution view for the deployed risk engine.</span></div><span className="confidence">{prediction.confidence}% confidence</span></div>
        <FactorBars factors={prediction.factors} />
      </section>
      <section className="card"><p className="card-label">RISK SCALE</p><div className="risk-scale"><div><strong>0–30%</strong><RiskBadge level="Normal" /><span>Stable condition</span></div><div><strong>30–70%</strong><RiskBadge level="Warning" /><span>Abnormal trend</span></div><div><strong>70–100%</strong><RiskBadge level="Critical" /><span>Strong warning signal</span></div></div></section>
      <section className="card"><p className="card-label">INTEGRATION STATUS</p><div className="integration-status"><span className="status-line"><i className="online-dot" /> XGBoost API boundary ready</span><span className="status-line"><i className="online-dot" /> Frontend prediction contract ready</span><span className="status-line"><i className="online-dot" /> Real model can be connected later</span></div></section>
    </div>
  );
}

function TrendsPage({ deformation, nodes, selectedNodeId, onSelectNode }: { deformation: DeformationPoint[]; nodes: SensorNode[]; selectedNodeId: string; onSelectNode: (id: string) => void }) {
  return (
    <div className="page-grid">
      <section className="card span-2">
        <div className="section-heading"><div><p className="card-label">HISTORICAL + LIVE DATA</p><h2>Ground deformation</h2><span className="muted">Time-series view of recent movement.</span></div><div className="filter-pills"><button className="active">24H</button><button>7D</button><button>30D</button><button>6M</button></div></div>
        <div className="large-chart"><LineChart data={deformation} large /></div>
      </section>
      <section className="card stat-highlight"><p className="card-label">CURRENT MOVEMENT</p><div className="big-metric">{deformation.at(-1)?.value.toFixed(1) ?? "—"} <span>mm</span></div><p className="muted">Latest deformation reading</p></section>
      <section className="card stat-highlight"><p className="card-label">RECENT TREND</p><div className="big-metric negative">↘ Increasing</div><p className="muted">Trend features are prepared for the risk engine.</p></section>
      <section className="card span-2 sensor-chart-card">
        <div className="section-heading">
          <div><p className="card-label">SENSOR NETWORK ANALYTICS</p><h2>Live risk by sensor</h2><span className="muted">Every sensor is shown. Select a bar to inspect that unit.</span></div>
          <span className="metric-chip">{nodes.length} sensors</span>
        </div>
        <SensorRiskChart nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
      </section>
    </div>
  );
}

function AlertsPage({ alerts }: { alerts: AlertItem[] }) {
  const active = alerts.filter((a) => !a.resolved && a.level !== "Normal").length;
  return <div className="page-grid"><section className="card span-2"><div className="section-heading"><div><p className="card-label">SAFETY EVENTS</p><h2>Alert center</h2><span className="muted">Review abnormal sensor and system events.</span></div><span className={`alert-count ${active ? "hot" : ""}`}>{active} ACTIVE</span></div><AlertList alerts={alerts} detailed /></section></div>;
}

function NetworkPage({ nodes, system }: { nodes: SensorNode[]; system: SystemStatus }) {
  return (
    <div className="page-grid">
      <section className="card span-2">
        <div className="section-heading"><div><p className="card-label">WIRELESS MESH</p><h2>Network topology</h2><span className="muted">Distributed field nodes relaying data toward the gateway.</span></div><span className="network-health">● {system.mesh}</span></div>
        <div className="network-diagram">
          <div className="network-line l1" /><div className="network-line l2" /><div className="network-line l3" /><div className="network-line l4" />
          <NetworkNode label="N01" x="12%" y="24%" online={nodes[0]?.status === "online"} />
          <NetworkNode label="N02" x="34%" y="48%" online={nodes[1]?.status === "online"} />
          <NetworkNode label="N03" x="56%" y="24%" online={nodes[2]?.status === "online"} />
          <NetworkNode label="N04" x="78%" y="49%" online={nodes[3]?.status === "online"} />
          <NetworkNode label="N05" x="34%" y="78%" online={nodes[4]?.status === "online"} />
          <NetworkNode label="N06" x="57%" y="77%" online={nodes[5]?.status === "online"} />
          <div className="gateway-center">⌁<span>GATEWAY</span></div>
        </div>
      </section>
      <section className="card health-card"><p className="card-label">GATEWAY</p><div className="system-status"><span className="online-dot" />{system.gateway}</div><p className="muted">Collect + preprocess node data</p></section>
      <section className="card health-card"><p className="card-label">AI ENGINE</p><div className="system-status"><span className="online-dot" />{system.aiEngine}</div><p className="muted">Risk prediction service</p></section>
    </div>
  );
}

function NetworkNode({ label, x, y, online }: { label: string; x: string; y: string; online: boolean }) {
  return <div className={`network-node ${online ? "online" : "offline"}`} style={{ left: x, top: y }}><strong>{label}</strong><small>{online ? "ONLINE" : "OFFLINE"}</small></div>;
}

function FactorBars({ factors }: { factors: Record<string, number> }) {
  const labels: Record<string, string> = { deformation: "Deformation", rate: "Deformation rate", tilt: "Tilt", vibration: "Vibration", variability: "Recent variability" };
  return <div className="factor-list">{Object.entries(factors).map(([key, value]) => <div className="factor" key={key}><div><span>{labels[key] ?? key}</span><strong>{value}%</strong></div><div className="bar"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>)}</div>;
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return <div className="metric-card"><span className="metric-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function AlertList({ alerts, detailed = false }: { alerts: AlertItem[]; detailed?: boolean }) {
  return <div className="alert-list">{alerts.map((alert) => <div className={`alert-row ${alert.resolved ? "resolved" : ""}`} key={alert.id}><div className={`alert-severity ${tone(alert.level)}`}><StatusDot level={alert.level} /></div><div className="alert-main"><strong>{alert.nodeId} <span>·</span> {alert.message}</strong>{detailed && <small>{alert.id} · {alert.resolved ? "Resolved" : "Requires attention"}</small>}</div><RiskBadge level={alert.level} /><time>{alert.time}</time></div>)}</div>;
}

function LineChart({ data, large = false }: { data: DeformationPoint[]; large?: boolean }) {
  const width = 900, height = large ? 320 : 210, pad = 32;
  const min = Math.min(...data.map((p) => p.value), 0), max = Math.max(...data.map((p) => p.value), 0);
  const range = Math.max(1, max - min);
  const pts = data.map((p, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (width - pad * 2);
    const y = pad + ((max - p.value) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const area = `${pad},${height - pad} ${pts.join(" ")} ${width - pad},${height - pad}`;
  return <div className={`line-chart ${large ? "large" : ""}`}><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#54b7ff" stopOpacity=".24" /><stop offset="100%" stopColor="#54b7ff" stopOpacity="0" /></linearGradient></defs><polygon points={area} fill="url(#chartFill)" /><line x1={pad} x2={width-pad} y1={height/2} y2={height/2} className="chart-grid" /><polyline points={pts.join(" ")} className="chart-line" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{data.map((p, i) => { const [x,y] = pts[i].split(","); return <circle key={p.label} cx={x} cy={y} r="4" className="chart-point" />; })}</svg><div className="chart-labels">{data.map((p) => <span key={p.label}>{p.label}</span>)}</div></div>;
}

export default App;
