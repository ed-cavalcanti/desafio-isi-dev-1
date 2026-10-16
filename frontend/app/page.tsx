"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function Home() {
  const [status, setStatus] = useState<string>("loading...");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold text-foreground">Desafio ISI Dev</h1>
      <p className="text-muted-foreground">
        Backend status: <strong className="text-foreground">{status}</strong>
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Recarregar
      </Button>
    </main>
  );
}