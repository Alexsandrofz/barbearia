export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">
          Barbearia
        </p>

        <h1 className="text-4xl font-bold sm:text-6xl">
          Sistema de Agendamento
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
          Em breve, seus clientes poderão escolher serviços, barbeiros, datas e
          horários diretamente pelo site.
        </p>

        <button
          type="button"
          className="mt-8 rounded-md bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          Agendar horário
        </button>
      </section>
    </main>
  );
}
