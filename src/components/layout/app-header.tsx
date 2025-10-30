export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-background/80 py-4 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6" dir="rtl">
        <h1 className="font-headline text-3xl font-bold text-primary">
          محاكي اختراق الشبكات اللاسلكية
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          محاكاة تفاعلية لخطوات اختبار اختراق شبكات الواي فاي.
        </p>
      </div>
    </header>
  );
}
