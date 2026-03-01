export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          Loretto School of Childhood
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
