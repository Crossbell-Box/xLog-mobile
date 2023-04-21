import { describe, it, expect } from "vitest";

import { getUrlParams } from "./get-url-params";

describe("getUrlParams", () => {
  it("should return an object with the query params", () => {
    const url = "https://example.com/?foo=bar&baz=qux";
    const params = getUrlParams(url);
    expect(params).toMatchInlineSnapshot(`
      {
        "baz": "qux",
        "foo": "bar",
      }
    `);
  });
});

