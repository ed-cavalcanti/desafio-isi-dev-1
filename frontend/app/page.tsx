"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("loading...");

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Desafio ISI Dev</h1>
      <p>Backend status: <strong>{status}</strong></p>
    </main>
  );
}