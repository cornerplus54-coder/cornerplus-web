import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Sayfa bulunamadı</h1>
      <p className="opacity-80">Aradığın sayfa yok ya da taşınmış olabilir.</p>

      <Link href="/" className="px-4 py-2 rounded-2xl border">
        Ana sayfaya dön
      </Link>
    </main>
  );
}
