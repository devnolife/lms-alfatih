import type { ComponentType } from "react";
import VariableSvg from "@/components/lesson/svg/VariableSvg";
import DataTypeSvg from "@/components/lesson/svg/DataTypeSvg";

/** Props every concept SVG accepts: a numeric phase plus free-form strings. */
export interface ConceptSvgProps {
  phase: number;
  [key: string]: string | number | undefined;
}

export interface ConceptSvgEntry {
  Component: ComponentType<ConceptSvgProps>;
  /** Highest phase index (animation runs 0..maxPhase inclusive). */
  maxPhase: number;
  /** Short caption shown for each phase (length === maxPhase + 1). */
  captions: string[];
}

/**
 * Registry of hand-made concept animations available to the `:::reveal`
 * directive. Add new concepts here (loop, condition, print, ...) to make them
 * usable via `:::reveal{visual="<key>"}`.
 */
export const CONCEPT_SVGS: Record<string, ConceptSvgEntry> = {
  variable: {
    Component: VariableSvg as ComponentType<ConceptSvgProps>,
    maxPhase: 3,
    captions: [
      "Variabel itu seperti sebuah kotak kosong berlabel.",
      "Kotak diberi nama supaya bisa dipanggil lagi nanti.",
      "Sebuah nilai dimasukkan ke dalam kotak…",
      "Nilai tersimpan! Sekarang kotak menyimpan datanya.",
    ],
  },
  datatypes: {
    Component: DataTypeSvg as ComponentType<ConceptSvgProps>,
    maxPhase: 3,
    captions: [
      "Isi sebuah kotak bisa bermacam-macam jenisnya.",
      "Ada yang berupa ANGKA — untuk umur, skor, atau jumlah.",
      "Ada yang berupa KATA atau kalimat — untuk nama dan pesan.",
      "Ada yang hanya BENAR atau SALAH — untuk pilihan ya/tidak.",
    ],
  },
};
