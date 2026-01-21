import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useHomeControls } from "./homeControls";

describe("Home Controls Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with default values", () => {
    const store = useHomeControls();
    expect(store.activeIndex).toBe(0);
    expect(store.items.length).toBeGreaterThan(0);
  });

  it("should navigate to next item correctly", () => {
    const store = useHomeControls();
    store.next();
    expect(store.activeIndex).toBe(1);
  });

  it("should loop back to start when next is called on last item", () => {
    const store = useHomeControls();
    store.activeIndex = store.items.length - 1;
    store.next();
    expect(store.activeIndex).toBe(0);
  });

  it("should navigate to previous item correctly", () => {
    const store = useHomeControls();
    store.activeIndex = 1;
    store.prev();
    expect(store.activeIndex).toBe(0);
  });

  it("should loop to end when prev is called on first item", () => {
    const store = useHomeControls();
    store.prev();
    expect(store.activeIndex).toBe(store.items.length - 1);
  });

  it("should set index correctly", () => {
    const store = useHomeControls();
    store.setIndex(2);
    expect(store.activeIndex).toBe(2);
  });
});
