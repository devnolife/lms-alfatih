import GameArcade from "@/components/lesson/games/GameArcade";
import MascotSvg from "@/components/MascotSvg";
import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Arena Game — FunPython",
};

export default function GamesPage() {
  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-10">
      <div className="mb-5">
        <BackButton href="/app" label="Home" />
      </div>
      <header className="dotted-bg relative mb-10 overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-grape)] px-6 py-7 shadow-[0_8px_0_var(--color-almost-black)]">
        <div className="flex items-center gap-5">
          <MascotSvg className="hidden sm:block w-24 h-24 shrink-0 drop-shadow" />
          <div className="min-w-0">
            <h1
              className="text-3xl sm:text-4xl text-white"
              style={{ fontFamily: "var(--font-feather)" }}
            >
              🎮 Arena Game
            </h1>
            <p className="mt-1 text-sm text-white/90">
              Main langsung tanpa harus ikut pelajaran. Pilih game favoritmu dan
              mulai bermain sambil belajar koding!
            </p>
          </div>
        </div>
      </header>

      <GameArcade />
    </div>
  );
}
