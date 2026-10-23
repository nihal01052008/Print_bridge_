import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper">
      <div className="glass px-10 py-8 text-center">
        <h1 className="font-display text-2xl text-ink">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
