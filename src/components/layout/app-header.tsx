export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-background/80 py-4 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Web Wireless Auditor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An interactive simulation of a WiFi penetration test.
        </p>
      </div>
    </header>
  );
}
