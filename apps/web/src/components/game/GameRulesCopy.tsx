import {
  DRAW_TIME_LIMIT_MS,
  LETTER_GRACE_MS,
  LETTER_REVEAL_INTERVAL_MS,
  MAX_GUESS_ATTEMPTS,
  TIPPER_PENALTY_PER_SEC,
  TIPPER_POINTS_NO_HINT,
  TIPPER_POINTS_WITH_HINT,
  drawerPointsForAttempt,
} from "@tipp-my-draw/shared";
import { PRESTART_SECONDS } from "../play/constants";

function formatHuDecimal(n: number): string {
  return String(n).replace(".", ",");
}

function formatSeconds(ms: number): number {
  return Math.round(ms / 1000);
}

const graceSec = formatSeconds(LETTER_GRACE_MS);
const revealEverySec = formatSeconds(LETTER_REVEAL_INTERVAL_MS);
const drawLimitSec = formatSeconds(DRAW_TIME_LIMIT_MS);
const drawLimitMin = drawLimitSec / 60;
const penaltyLabel = formatHuDecimal(TIPPER_PENALTY_PER_SEC);
const drawerPts = [
  drawerPointsForAttempt(1),
  drawerPointsForAttempt(2),
  drawerPointsForAttempt(3),
] as const;

/** Shared rules copy for home + play intro — numbers from scoring constants. */
export function GameRulesCopy() {
  return (
    <>
      <p className="mb-5 text-sm leading-relaxed text-[var(--muted-strong)] sm:text-base">
        Válassz: rajzolsz vagy kitalálod, mit rajzoltak mások. A tippelő pontját
        a hint és az eltelt idő, a rajzolóét az dönti el, hányadik tipped találta
        el a megfejtést.
      </p>

      <section className="mb-5">
        <h3 className="mb-2 text-base font-semibold text-[var(--accent)]">
          Megfejtés
        </h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-strong)]">
          <li>
            Nincs fix időkorlát: {graceSec} másodperc után random betűk
            jelennek meg, majd {revealEverySec} mp-enként a következő; ha minden
            betű kiderül, a feladvány lejár.
          </li>
          <li>
            {MAX_GUESS_ATTEMPTS} tipped van egy feladványra.
          </li>
          <li>Egy hintet kérhetsz segítségül.</li>
          <li>
            Pontok: hint nélkül{" "}
            <strong className="text-[var(--ink)]">{TIPPER_POINTS_NO_HINT}</strong>
            , hinttel{" "}
            <strong className="text-[var(--ink)]">{TIPPER_POINTS_WITH_HINT}</strong>
            .
          </li>
          <li>
            {graceSec} másodperc után másodpercenként{" "}
            <strong className="text-[var(--ink)]">{penaltyLabel}</strong> pont
            levonás.
          </li>
          <li>
            Ha korábban nem sikerült a kép, újabb sikeres tippnél csak fél pont
            jár.
          </li>
          <li>
            A{" "}
            <strong className="text-[var(--ink)]">Kérem a képet!</strong>{" "}
            gombbal indul a{" "}
            <strong className="text-[var(--ink)]">{PRESTART_SECONDS}</strong>{" "}
            másodperces visszaszámláló.
          </li>
        </ul>
      </section>

      <section className="mb-7">
        <h3 className="mb-2 text-base font-semibold text-[var(--accent)]">
          Rajzolás
        </h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-strong)]">
          <li>
            A rajzolásra {drawLimitMin} perced van; utána mentened kell.
          </li>
          <li>
            Ha megfejtik a rajzodat, pontot kapsz a tipp sorszáma szerint: 1.
            tipp →{" "}
            <strong className="text-[var(--ink)]">{drawerPts[0]}</strong>, 2. →{" "}
            <strong className="text-[var(--ink)]">{drawerPts[1]}</strong>, 3. →{" "}
            <strong className="text-[var(--ink)]">{drawerPts[2]}</strong> pont.
          </li>
          <li>
            A Rajzolok módban készíthetsz új feladványt a többieknek.
          </li>
        </ul>
      </section>
    </>
  );
}
