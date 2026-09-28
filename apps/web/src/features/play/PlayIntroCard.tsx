import { Button } from "../../components/ui/Button";

type PlayIntroCardProps = {
  onStart: () => void;
  busy?: boolean;
};

export function PlayIntroCard({ onStart, busy = false }: PlayIntroCardProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-2">
      <div className="game-card max-h-full w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--ink)] sm:text-2xl">
          Hogyan működik a játék?
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-[var(--muted-strong)] sm:text-base">
          A játékban ki kell találnod, mit rajzoltak. Válaszd ki, hogy
          megfejtenél vagy rajzolnál.
        </p>

        <section className="mb-5">
          <h3 className="mb-2 text-base font-semibold text-[var(--accent)]">
            Megfejtés
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-strong)]">
            <li>A megfejtésre körülbelül 1 perced van.</li>
            <li>Három tipped van egy feladványra.</li>
            <li>Egy hintet kérhetsz segítségül.</li>
            <li>
              Pontok: hint nélkül <strong className="text-[var(--ink)]">10</strong>
              , hinttel <strong className="text-[var(--ink)]">7</strong>.
            </li>
            <li>
              15 másodperc után másodpercenként{" "}
              <strong className="text-[var(--ink)]">0,1</strong> pont levonás.
            </li>
            <li>
              15 mp után random betűk jelennek meg, majd 5 mp-enként a
              következő; ha minden betű kiderül, a feladvány lejár.
            </li>
            <li>
              Minden feladvány előtt a <strong className="text-[var(--ink)]">Mehet!</strong>{" "}
              gombbal indul a visszaszámláló.
            </li>
          </ul>
        </section>

        <section className="mb-7">
          <h3 className="mb-2 text-base font-semibold text-[var(--accent)]">
            Rajzolás
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-strong)]">
            <li>A rajzolásra 2 perced van; utána mentened kell.</li>
            <li>
              Ha megfejtik a rajzodat, pontot kapsz a tipp sorszáma szerint:
              1. tipp → <strong className="text-[var(--ink)]">4</strong>, 2. →{" "}
              <strong className="text-[var(--ink)]">2</strong>, 3. →{" "}
              <strong className="text-[var(--ink)]">1</strong> pont.
            </li>
            <li>
              A Rajzolok módban készíthetsz új feladványt a többieknek.
            </li>
          </ul>
        </section>

        <Button
          label="Játék indítása. Kérem az első képet"
          variant="primary"
          fullWidth
          disabled={busy}
          onClick={onStart}
        />
      </div>
    </div>
  );
}
