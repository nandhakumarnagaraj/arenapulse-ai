import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnnouncementBar from "@/components/AnnouncementBar";

describe("AnnouncementBar", () => {
  const mockAnnouncement = {
    en: "Please proceed to the alternate gate. Wait times are under 2 minutes.",
    es: "Por favor, diríjase a la puerta alternativa. El tiempo de espera es menor a 2 minutos.",
    fr: "Veuillez vous diriger vers la porte alternative. Le temps d'attente est inférieur à 2 minutes.",
  };

  it("renders empty state when no announcement", () => {
    render(<AnnouncementBar latestAnnouncement={null} />);
    expect(screen.getByText("No active announcements")).toBeInTheDocument();
  });

  it("renders English announcement by default", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    expect(screen.getByText(mockAnnouncement.en)).toBeInTheDocument();
  });

  it("switches to Spanish when ES button clicked", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    fireEvent.click(screen.getByRole("tab", { name: /español/i }));
    expect(screen.getByText(mockAnnouncement.es)).toBeInTheDocument();
  });

  it("switches to French when FR button clicked", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    fireEvent.click(screen.getByRole("tab", { name: /français/i }));
    expect(screen.getByText(mockAnnouncement.fr)).toBeInTheDocument();
  });

  it("has accessible role region", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    expect(screen.getByRole("region", { name: /public announcements/i })).toBeInTheDocument();
  });

  it("has aria-live polite for screen readers", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    const region = screen.getByRole("region", { name: /public announcements/i });
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("has tab roles for language buttons", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("marks active tab with aria-selected", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    const enTab = screen.getByRole("tab", { name: /english/i });
    expect(enTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders tabpanel for current language", () => {
    render(<AnnouncementBar latestAnnouncement={mockAnnouncement} />);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
