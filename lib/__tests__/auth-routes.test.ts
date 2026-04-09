import { describe, expect, it } from "vitest";
import {
  isProtectedAppPath,
  safeInternalPath,
  safeInternalPathOrNull
} from "@/lib/auth-routes";

describe("isProtectedAppPath", () => {
  it("matches exact and nested /nearby, /shops, /dashboard", () => {
    expect(isProtectedAppPath("/nearby")).toBe(true);
    expect(isProtectedAppPath("/nearby/foo")).toBe(true);
    expect(isProtectedAppPath("/shops")).toBe(true);
    expect(isProtectedAppPath("/shops/abc")).toBe(true);
    expect(isProtectedAppPath("/dashboard")).toBe(true);
    expect(isProtectedAppPath("/dashboard/settings")).toBe(true);
  });

  it("does not match marketing or auth routes", () => {
    expect(isProtectedAppPath("/")).toBe(false);
    expect(isProtectedAppPath("/login")).toBe(false);
    expect(isProtectedAppPath("/signup")).toBe(false);
    expect(isProtectedAppPath("/docs")).toBe(false);
    expect(isProtectedAppPath("/merchant")).toBe(false);
    expect(isProtectedAppPath("/nearby-page")).toBe(false);
  });
});

describe("safeInternalPathOrNull", () => {
  it("accepts simple internal paths", () => {
    expect(safeInternalPathOrNull("/nearby")).toBe("/nearby");
    expect(safeInternalPathOrNull("/shops/place_1")).toBe("/shops/place_1");
  });

  it("strips query string", () => {
    expect(safeInternalPathOrNull("/nearby?x=1")).toBe("/nearby");
  });

  it("rejects open redirects", () => {
    expect(safeInternalPathOrNull("//evil.com")).toBeNull();
    expect(safeInternalPathOrNull("https://evil.com")).toBeNull();
    expect(safeInternalPathOrNull("")).toBeNull();
    expect(safeInternalPathOrNull(null)).toBeNull();
    expect(safeInternalPathOrNull("/../admin")).toBeNull();
  });
});

describe("safeInternalPath", () => {
  it("uses fallback when invalid", () => {
    expect(safeInternalPath("//x", "/dashboard")).toBe("/dashboard");
    expect(safeInternalPath(null, "/nearby")).toBe("/nearby");
  });
});
