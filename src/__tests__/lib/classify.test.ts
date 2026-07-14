import { classifyEventType, classifySeverity } from "@/lib/classify";

describe("classifyEventType", () => {
  it("classifies gate failures correctly", () => {
    expect(classifyEventType("Gate B turnstile crashed")).toBe("gate_failure");
    expect(classifyEventType("Security scanner malfunction")).toBe("gate_failure");
    expect(classifyEventType("Power outage at gate A")).toBe("gate_failure");
    expect(classifyEventType("Ticketing system down")).toBe("gate_failure");
  });

  it("classifies transit delays correctly", () => {
    expect(classifyEventType("Line 2 transit delay 15 minutes")).toBe("transit_delay");
    expect(classifyEventType("Train service disrupted")).toBe("transit_delay");
    expect(classifyEventType("Bus shuttle dispatched")).toBe("transit_delay");
    expect(classifyEventType("Signal failure causing delay")).toBe("transit_delay");
  });

  it("classifies weather alerts correctly", () => {
    expect(classifyEventType("Lightning detected 5km away")).toBe("weather_alert");
    expect(classifyEventType("High wind advisory")).toBe("weather_alert");
    expect(classifyEventType("Heavy rain expected")).toBe("weather_alert");
    expect(classifyEventType("Storm approaching venue")).toBe("weather_alert");
  });

  it("classifies medical emergencies correctly", () => {
    expect(classifyEventType("Medical emergency in section 12")).toBe("medical");
    expect(classifyEventType("EMS team dispatched to area")).toBe("medical");
    expect(classifyEventType("Heat-related incidents spiking")).toBe("medical");
    expect(classifyEventType("Fan requires ambulance")).toBe("medical");
  });

  it("classifies crowd spikes correctly", () => {
    expect(classifyEventType("Crowd surge at concourse")).toBe("crowd_spike");
    expect(classifyEventType("Density at 95% capacity")).toBe("crowd_spike");
    expect(classifyEventType("Bottleneck forming at junction")).toBe("crowd_spike");
  });

  it("defaults to crowd_spike for unrecognized descriptions", () => {
    expect(classifyEventType("Something unknown happened")).toBe("crowd_spike");
    expect(classifyEventType("")).toBe("crowd_spike");
  });

  it("is case insensitive", () => {
    expect(classifyEventType("TURNSTILE CRASHED")).toBe("gate_failure");
    expect(classifyEventType("LIGHTNING detected")).toBe("weather_alert");
    expect(classifyEventType("Medical EMERGENCY")).toBe("medical");
  });
});

describe("classifySeverity", () => {
  it("classifies critical events", () => {
    expect(classifySeverity("Gate B turnstile crash")).toBe("CRITICAL");
    expect(classifySeverity("Medical emergency reported")).toBe("CRITICAL");
    expect(classifySeverity("Power outage across all gates")).toBe("CRITICAL");
    expect(classifySeverity("Stampede risk detected")).toBe("CRITICAL");
  });

  it("classifies non-critical events as WARNING", () => {
    expect(classifySeverity("Crowd surge at gate B")).toBe("WARNING");
    expect(classifySeverity("Transit delay on Line 2")).toBe("WARNING");
    expect(classifySeverity("High wind advisory")).toBe("WARNING");
    expect(classifySeverity("Queue time increased")).toBe("WARNING");
  });

  it("is case insensitive", () => {
    expect(classifySeverity("CRASH at gate")).toBe("CRITICAL");
    expect(classifySeverity("EMERGENCY response needed")).toBe("CRITICAL");
  });
});
