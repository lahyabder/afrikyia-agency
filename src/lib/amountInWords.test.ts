import { describe, expect, it } from "vitest";
import { englishWords, frenchWords } from "./amountInWords";

describe("frenchWords", () => {
  it.each([
    [0, "zéro"],
    [21, "vingt et un"],
    [71, "soixante et onze"],
    [80, "quatre-vingts"],
    [91, "quatre-vingt-onze"],
    [200, "deux cents"],
    [1000, "mille"],
    [2_000_000, "deux millions"],
  ])("writes %i as %s", (n, words) => {
    expect(frenchWords(n)).toBe(words);
  });
});

describe("englishWords", () => {
  it("writes thousands and hundreds", () => {
    expect(englishWords(1250)).toBe("one thousand two hundred fifty");
  });
});
