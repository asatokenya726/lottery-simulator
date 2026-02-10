"use client";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 p-8">
        <h1 className="text-4xl font-bold text-accent-gold">
          宝くじシミュレーター
        </h1>
        <p className="text-lg text-text-secondary">
          宝くじの当選確率を体感しよう
        </p>
      </main>
    </div>
  );
}
