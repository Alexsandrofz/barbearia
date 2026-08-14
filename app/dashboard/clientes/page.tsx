export default function ClientesPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">Gerenciamento</p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Clientes
        </h1>

        <p className="mt-2 text-muted-foreground">
          A gestão de clientes será construída nesta área.
        </p>

        <section className="card-premium mt-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl">
            Nenhum cliente exibido ainda
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            Os clientes que fizerem agendamentos aparecerão aqui.
          </p>
        </section>
      </div>
    </main>
  );
}