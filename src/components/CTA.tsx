"use client";

export default function CTA() {
  const scrollTo = () => {
    document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-28">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="bg-duo-green-light border-4 border-almost-black rounded-[32px] shadow-[0_12px_0_var(--color-almost-black)] py-16 md:py-20 px-12 text-center max-w-[850px] mx-auto">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-almost-black mb-5">
            Siap Taklukkan Baris Kodemu? 🦖
          </h2>
          <p className="text-xl text-charcoal font-bold mb-10">
            Ayo tantang kreativitasmu, kumpulkan ratusan XP pertamamu hari ini
            juga. 100% Gratis!
          </p>
          <button
            className="btn-3d btn-green !text-lg"
            onClick={scrollTo}
          >
            Mulai Petualangan GRATIS! 🚀
          </button>
        </div>
      </div>
    </section>
  );
}
