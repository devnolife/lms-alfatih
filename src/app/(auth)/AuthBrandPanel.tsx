import MascotSvg from "@/components/MascotSvg";

const features = [
  { icon: "💻", text: "Ketik kode Python langsung di browser" },
  { icon: "🏆", text: "Tantangan berhadiah XP & lencana" },
  { icon: "🎮", text: "Belajar seseru main game petualangan" },
];

export default function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
      style={{
        background:
          "linear-gradient(160deg, #61e002 0%, #58cc02 45%, #3f8f01 100%)",
      }}
    >
      {/* Decorative floating shapes */}
      <div
        className="auth-float absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-30"
        style={{ background: "#ffc700" }}
      />
      <div
        className="auth-float-slow absolute top-24 right-[-30px] w-32 h-32 rounded-[40%] opacity-25"
        style={{ background: "#a570ff" }}
      />
      <div
        className="auth-float absolute bottom-16 left-[-20px] w-24 h-24 rounded-2xl opacity-20 rotate-12"
        style={{ background: "#1cb0f6" }}
      />
      <div
        className="auth-float-slow absolute bottom-[-30px] right-16 w-40 h-40 rounded-full opacity-20"
        style={{ background: "#cc348d" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 2px, transparent 2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2" style={{ fontFamily: "var(--font-feather)" }}>
        <span className="text-2xl font-bold">🐍 FunPython</span>
      </div>

      {/* Center hero */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl rounded-full bg-white/20" />
          <MascotSvg mood="happy" className="relative w-56 h-56 drop-shadow-[0_10px_0_rgba(0,0,0,0.12)]" />
        </div>
        <h2
          className="mt-6 leading-tight"
          style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 34, letterSpacing: "-0.5px" }}
        >
          Coding jadi
          <br />
          petualangan seru! 🚀
        </h2>
        <p
          className="mt-3 max-w-xs text-white/85"
          style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 15, letterSpacing: "0.03em" }}
        >
          Gabung ribuan siswa SMP yang belajar Python sambil bermain.
        </p>
      </div>

      {/* Feature list */}
      <ul className="relative z-10 flex flex-col gap-3">
        {features.map((f) => (
          <li
            key={f.text}
            className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3"
            style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 14, letterSpacing: "0.02em" }}
          >
            <span className="text-xl">{f.icon}</span>
            {f.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
