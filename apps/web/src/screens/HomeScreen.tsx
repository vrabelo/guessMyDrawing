import { Button } from "../components/ui/Button";
import "../components/play/play-screen.css";

type HomeScreenProps = {
  onChoosePlay: () => void;
  onChooseDraw: () => void;
};

export function HomeScreen({ onChoosePlay, onChooseDraw }: HomeScreenProps) {
  return (
    <div className="home-screen">
      <div className="game-card max-h-full w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--ink)] sm:text-2xl">
          Hogyan működik a játék?
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-[var(--muted-strong)] sm:text-base">
          Válassz: rajzolsz vagy kitalálod, mit rajzoltak mások. Mindkét
          esetben időkorlát van, ami alapján pontokat kap a tippelő és a
          rajzoló is.
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
              A kép betöltése után a{" "}
              <strong className="text-[var(--ink)]">Mehet!</strong> gombbal
              indul a visszaszámláló.
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

        <div className="home-screen__cta">
          <span className="home-screen__cta-label">Játék indítása:</span>
          <div className="home-screen__cta-buttons">
            <Button
              label="Rajzolok"
              variant="secondary"
              onClick={onChooseDraw}
            />
            <Button
              label="Kitalálom"
              variant="primary"
              onClick={onChoosePlay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
