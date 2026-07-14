import React from "react";
import { render, screen } from "@testing-library/react";
import AlertPanel from "@/components/AlertPanel";
import { TelemetryEvent } from "@/lib/types";

const mockEvents: TelemetryEvent[] = [
  {
    id: "EVT-1",
    timestamp: new Date().toISOString(),
    zoneId: "gate-a",
    eventType: "gate_failure",
    description: "Gate A turnstiles crashed. Queue time spiked to 25 minutes.",
    severity: "CRITICAL",
    metrics: { density: 92, waitTime: 25, flowRate: 30 },
  },
  {
    id: "EVT-2",
    timestamp: new Date().toISOString(),
    zoneId: "gate-b",
    eventType: "crowd_spike",
    description: "Crowd surge at Gate B. Density at 85% capacity.",
    severity: "WARNING",
    metrics: { density: 85, waitTime: 12, flowRate: 45 },
  },
  {
    id: "EVT-3",
    timestamp: new Date().toISOString(),
    zoneId: "concourse",
    eventType: "normal",
    description: "Routine gate rotation completed.",
    severity: "INFO",
    metrics: { density: 50, waitTime: 3, flowRate: 80 },
  },
];

describe("AlertPanel", () => {
  it("renders empty state when no events", () => {
    render(<AlertPanel events={[]} />);
    expect(screen.getByText("Monitoring stadium...")).toBeInTheDocument();
  });

  it("renders event count", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("3 events")).toBeInTheDocument();
  });

  it("renders critical count badge", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("1 critical")).toBeInTheDocument();
  });

  it("renders warning count badge", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("1 warnings")).toBeInTheDocument();
  });

  it("renders event descriptions", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText(/Gate A turnstiles crashed/)).toBeInTheDocument();
    expect(screen.getByText(/Crowd surge at Gate B/)).toBeInTheDocument();
  });

  it("renders severity badges", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("INFO")).toBeInTheDocument();
  });

  it("renders event type labels", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText(/Gate Failure/)).toBeInTheDocument();
    expect(screen.getByText(/Crowd Surge/)).toBeInTheDocument();
    expect(screen.getAllByText(/Routine/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders density metrics", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders wait time metrics", () => {
    render(<AlertPanel events={mockEvents} />);
    expect(screen.getByText("25m")).toBeInTheDocument();
    expect(screen.getByText("12m")).toBeInTheDocument();
  });
});
