import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-2">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
