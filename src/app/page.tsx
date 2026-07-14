import ErrorBoundary from "@/components/ErrorBoundary";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
