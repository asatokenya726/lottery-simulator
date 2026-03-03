"use client";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
      <main className="flex flex-col items-center gap-6 w-full max-w-md">
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
