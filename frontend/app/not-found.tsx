import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl font-semibold tabular-nums">404</p>
      <h1 className="text-heading-page">Página não encontrada</h1>
      <p className="text-body text-muted-foreground">
        O endereço acessado não existe.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Voltar para o início
      </Button>
    </main>
  );
}
