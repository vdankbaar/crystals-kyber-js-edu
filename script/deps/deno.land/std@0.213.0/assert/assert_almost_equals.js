(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./assertion_error.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertAlmostEquals = void 0;
    // Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
    const assertion_error_js_1 = require("./assertion_error.js");
    /**
     * Make an assertion that `actual` and `expected` are almost equal numbers
     * through a given tolerance. It can be used to take into account IEEE-754
     * double-precision floating-point representation limitations. If the values
     * are not almost equal then throw.
     *
     * @example
     * ```ts
     * import { assertAlmostEquals } from "https://deno.land/std@$STD_VERSION/assert/mod.ts";
     *
     * assertAlmostEquals(0.01, 0.02, 0.1); // Doesn't throw
     * assertAlmostEquals(0.01, 0.02); // Throws
     * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-16); // Doesn't throw
     * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-17); // Throws
     * ```
     */
    function assertAlmostEquals(actual, expected, tolerance = 1e-7, msg) {
        if (Object.is(actual, expected)) {
            return;
        }
        const delta = Math.abs(expected - actual);
        if (delta <= tolerance) {
            return;
        }
        const msgSuffix = msg ? `: ${msg}` : ".";
        const f = (n) => Number.isInteger(n) ? n : n.toExponential();
        throw new assertion_error_js_1.AssertionError(`Expected actual: "${f(actual)}" to be close to "${f(expected)}": \
delta "${f(delta)}" is greater than "${f(tolerance)}"${msgSuffix}`);
    }
    exports.assertAlmostEquals = assertAlmostEquals;
});
