const criteria = [
  "Mais pontos",
  "Maior saldo de gols",
  "Mais gols marcados",
  "Nome do clube, de A a Z",
];

export function StandingsOrderCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-body-sm-semibold text-foreground">
          Ordem da tabela
        </h2>
        <p className="text-caption text-muted-foreground">
          Critérios de classificação, nesta ordem.
        </p>
      </div>
      <ol className="flex flex-col gap-2 px-4 py-3">
        {criteria.map((criterion, index) => (
          <li key={criterion} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-caption-medium tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <span className="text-body-sm text-foreground">{criterion}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
