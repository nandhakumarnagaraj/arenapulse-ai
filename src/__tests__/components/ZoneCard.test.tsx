import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ZoneCard from "@/components/ZoneCard";
import { StadiumZone } from "@/lib/types";

const mockZone: StadiumZone = {
  id: "gate-a",
  name: "Gate A — North",
  capacity: 12000,
  currentOccupancy: 8400,
  status: "normal",
  waitTimeMinutes: 3,
  gates: ["A1", "A2", "A3", "A4"],
  transitLines: ["Line 1", "Line 4"],
};

describe("ZoneCard", () => {
  it("renders zone name", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Gate A — North")).toBeInTheDocument();
  });

  it("renders capacity info", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Capacity: 12,000")).toBeInTheDocument();
  });

  it("renders occupancy percentage", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("renders wait time", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("3 min")).toBeInTheDocument();
  });

  it("renders gate badges", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("A3")).toBeInTheDocument();
    expect(screen.getByText("A4")).toBeInTheDocument();
  });

  it("renders transit line badges", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Line 1")).toBeInTheDocument();
    expect(screen.getByText("Line 4")).toBeInTheDocument();
  });

  it("shows Normal status for normal zones", () => {
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("shows Elevated status for elevated zones", () => {
    const elevatedZone = { ...mockZone, status: "elevated" as const };
    render(<ZoneCard zone={elevatedZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Elevated")).toBeInTheDocument();
  });

  it("shows Critical status for critical zones", () => {
    const criticalZone = { ...mockZone, status: "critical" as const };
    render(<ZoneCard zone={criticalZone} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<ZoneCard zone={mockZone} isSelected={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies selected styles when isSelected is true", () => {
    render(<ZoneCard zone={mockZone} isSelected={true} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("ring-2");
  });

  it("colors wait time red when over 15 minutes", () => {
    const longWaitZone = { ...mockZone, waitTimeMinutes: 20 };
    render(<ZoneCard zone={longWaitZone} isSelected={false} onClick={() => {}} />);
    const waitEl = screen.getByText("20 min");
    expect(waitEl.className).toContain("text-red-400");
  });

  it("colors wait time amber when between 8 and 15 minutes", () => {
    const medWaitZone = { ...mockZone, waitTimeMinutes: 12 };
    render(<ZoneCard zone={medWaitZone} isSelected={false} onClick={() => {}} />);
    const waitEl = screen.getByText("12 min");
    expect(waitEl.className).toContain("text-amber-400");
  });
});
