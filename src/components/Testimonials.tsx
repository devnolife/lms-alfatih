"use client";

const testimonials = [
  {
    avatar: "👦",
    bg: "bg-duo-green-light",
    quote:
      "Dulu aku kira coding itu garing dan isinya cuma rumus matematika ngebosenin. Pas main di web ini ternyata seru gila! Persis kayak lagi main game level-levelan RPG!",
    author: "Farel (14 thn), SMPN 1 Jakarta",
  },
  {
    avatar: "👧",
    bg: "bg-error-light",
    quote:
      "Suka banget sama sound effect retro-nya pas jawaban kuis kita betul, trus ada hujan konfetinya jugaa! Motivasi banget buat dapetin XP tumpah-tumpah!",
    author: "Keyla (13 thn), SMP Swasta Bandung",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-[#fafbfc]">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-grape-dark mb-5 tracking-tight">
            Kata Rekan Pembelajar SMP 💬
          </h2>
          <p className="text-xl text-graphite font-bold leading-relaxed">
            Mereka yang sudah duluan merasakan asyiknya petualangan Python di
            sini!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="duo-card p-8 flex gap-6 items-start"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-20 h-20 rounded-full border-3 border-almost-black flex items-center justify-center text-4xl shadow-[0_4px_0_var(--color-almost-black)] ${t.bg}`}
                >
                  {t.avatar}
                </div>
              </div>
              <div>
                <p className="italic text-almost-black mb-4 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <h4 className="font-[family-name:var(--font-feather)] text-duo-green-dark">
                  {t.author}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
