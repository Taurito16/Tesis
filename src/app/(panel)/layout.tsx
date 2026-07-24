export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 shrink-0">
          Encabezado
        </header>
        <div className="flex-1 flex p-4 gap-4">
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}