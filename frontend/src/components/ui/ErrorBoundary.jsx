import { Component } from "react";
import { RefreshCcw } from "lucide-react";
import GlassCard from "./GlassCard.jsx";
import Button from "./Button.jsx";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("PrintBridge crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen grid place-items-center bg-paper px-6">
        <GlassCard className="p-8 max-w-sm text-center">
          <h1 className="font-display text-xl text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-faint">
            This page hit an unexpected error. Reloading usually fixes it.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6 mx-auto"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={16} /> Reload
          </Button>
        </GlassCard>
      </div>
    );
  }
}
