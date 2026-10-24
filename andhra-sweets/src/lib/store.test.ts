import { describe, it, expect } from "vitest";
import { billTotal, lineTotal } from "./store";

describe("bill math", () => {
  it("line total is quantity times price", () => {
    expect(lineTotal({ qty: 2.5, price: 420 })).toBe(1050);
  });
  it("bill total sums all lines", () => {
    expect(billTotal([{ qty: 2, price: 900 }, { qty: 3, price: 150 }])).toBe(2250);
  });
});
