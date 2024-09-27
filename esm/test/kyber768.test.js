import * as dntShim from "../_dnt.test_shims.js";
import { assertEquals } from "../deps/deno.land/std@0.213.0/testing/asserts.js";
import { afterAll, beforeAll, describe, it } from "../deps/deno.land/std@0.213.0/testing/bdd.js";
import { Kyber768 } from "../mod.js";
import { loadCrypto } from "../src/utils.js";
import { hexToDec, testVectorPath } from "./utils.js";
describe("Kyber768", () => {
    let count;
    let sk;
    let ct;
    let ss;
    beforeAll(async () => {
        count = 0;
        sk = new Array(100);
        ct = new Array(100);
        ss = new Array(100);
        const data = await dntShim.Deno.readTextFile(testVectorPath() + "/PQCkemKAT_2400.rsp");
        const textByLine = data.split("\n");
        let skCount = 0;
        let ctCount = 0;
        let ssCount = 0;
        for (let i = 0; i < textByLine.length; i++) {
            if (textByLine[i][0] == "c" && textByLine[i][1] == "t") {
                const tmp = new Uint8Array(1088);
                for (let j = 0; j < 1088; j++) {
                    tmp[j] = hexToDec(textByLine[i][2 * j + 5] + textByLine[i][2 * j + 1 + 5]);
                }
                ct[ctCount++] = tmp;
            }
            else if (textByLine[i][0] == "s" && textByLine[i][1] == "s") {
                const tmp = new Uint8Array(32);
                for (let j = 0; j < 32; j++) {
                    tmp[j] = hexToDec(textByLine[i][2 * j + 5] + textByLine[i][2 * j + 1 + 5]);
                }
                ss[ssCount++] = tmp;
            }
            else if (textByLine[i][0] == "s" && textByLine[i][1] == "k") {
                const tmp = new Uint8Array(2400);
                for (let j = 0; j < 2400; j++) {
                    tmp[j] = hexToDec(textByLine[i][2 * j + 5] + textByLine[i][2 * j + 1 + 5]);
                }
                sk[skCount++] = tmp;
            }
        }
    });
    afterAll(() => {
        console.log(`passed/total: ${count}/${sk.length}`);
    });
    describe("PQCkemKAT_2400.rsp", () => {
        it("should match values in test vectors", async () => {
            const kyber = new Kyber768();
            for (let i = 0; i < 100; i++) {
                const res = await kyber.decap(ct[i], sk[i]);
                assertEquals(res, ss[i]);
                count++;
            }
        });
    });
    describe("A sample code in README.", () => {
        it("should work normally", async () => {
            const recipient = new Kyber768();
            const [pkR, skR] = await recipient.generateKeyPair();
            const sender = new Kyber768();
            const [ct, ssS] = await sender.encap(pkR);
            const ssR = await recipient.decap(ct, skR);
            assertEquals(ssS, ssR);
        });
        it("should work normally with deriveKeyPair", async () => {
            const recipient = new Kyber768();
            const api = await loadCrypto();
            const seed = new Uint8Array(64);
            api.getRandomValues(seed);
            const [pkR, skR] = await recipient.deriveKeyPair(seed);
            const [pkR2, skR2] = await recipient.deriveKeyPair(seed);
            assertEquals(pkR, pkR2);
            assertEquals(skR, skR2);
            const sender = new Kyber768();
            const [ct, ssS] = await sender.encap(pkR);
            const ssR = await recipient.decap(ct, skR);
            assertEquals(ssS, ssR);
        });
    });
});
