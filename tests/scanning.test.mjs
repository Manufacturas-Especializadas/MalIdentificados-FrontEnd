import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import { buildBatchPayload, containerMatches, describeSaveError, isPositiveInteger, legacyCodeInput, resolveActiveLine, validateSession } from "../src/utils/scanning.ts";
import { addScan, removeScan, startScanningSession } from "../src/utils/scanningSession.ts";

const shop = { payroll: 12345, partNumber: "ABC-001", quantity: 2, validationMode: "shopOrder", shopOrder: "000012" };
const container = { payroll: 12345, partNumber: " Abc-001 ", quantity: 2, validationMode: "container", containerNumber: "Abc-001" };
const record = { id: "one", code: "ABC-001", isCorrect: true, timestamp: new Date("2026-10-09T12:00:00Z") };

test("container comparison follows the API's trimmed ordinal equality", () => {
  assert.equal(containerMatches(" Abc-001 ", "Abc-001"), true);
  for (const value of ["ABC-001", "Abc001", "Abc-01", "Abc- 001", "", "other"]) {
    assert.equal(containerMatches("Abc-001", value), false);
  }
  assert.equal(containerMatches(" ", " "), false);
});

test("Standard Pack is a positive Int32, whether typed or scanned", () => {
  assert.equal(isPositiveInteger(Number("32")), true);
  for (const quantity of [0, -1, 1.5, Infinity, NaN, 2147483648]) {
    assert.equal(isPositiveInteger(quantity), false);
    assert.ok(validateSession({ ...shop, quantity }));
  }
});

test("invalid container and missing Shop Order cannot start or produce a payload", () => {
  assert.ok(validateSession({ ...container, containerNumber: "wrong" }));
  assert.ok(validateSession({ ...shop, shopOrder: " " }));
  assert.throws(() => buildBatchPayload({ ...container, containerNumber: "wrong" }, { version: "line-container", lineId: 72 }, []));
});

test("legacy payload omits all new fields and preserves Shop Order", () => {
  assert.deepEqual(buildBatchPayload(shop, { version: "legacy" }, [record]), {
    payrollNumber: 12345, expectedPartCode: "ABC-001", requiredQuantity: 2, shopOrder: "000012",
    scans: [{ scannedPartCode: "ABC-001", isCorrect: true, scanDate: "2026-10-09T12:00:00.000Z", releasedByPayroll: null }],
  });
  assert.equal(legacyCodeInput("abc'001"), "ABC-001");
});

test("explicit Shop Order sends verified line and mode, with no container field", () => {
  const payload = buildBatchPayload(shop, { version: "line-container", lineId: 72 }, [record]);
  assert.equal(payload.lineId, 72);
  assert.equal(payload.validationMode, "shopOrder");
  assert.equal(payload.shopOrder, "000012");
  assert.equal("containerNumber" in payload, false);
});

test("container payload preserves original strings and never uses shopOrder", () => {
  const payload = buildBatchPayload(container, { version: "line-container", lineId: 91 }, [record]);
  assert.equal(payload.expectedPartCode, " Abc-001 ");
  assert.equal(payload.containerNumber, "Abc-001");
  assert.equal(payload.validationMode, "container");
  assert.equal(payload.lineId, 91);
  assert.equal("shopOrder" in payload, false);
  assert.equal(payload.scans.length, 1);
  assert.throws(() => buildBatchPayload(container, { version: "legacy" }, []));
  assert.throws(() => buildBatchPayload(container, { version: "line-container", lineId: NaN }, []));
});

test("line resolution requires the exact configured active ID", () => {
  const lines = [{ id: 91, lineName: "Empaques", isActive: true }, { id: 72, lineName: "MicroChannel", isActive: false }];
  assert.equal(resolveActiveLine(lines, 91).id, 91);
  for (const id of [4, 72, 0, NaN]) assert.throws(() => resolveActiveLine(lines, id));
  assert.throws(() => resolveActiveLine([lines[0], lines[0]], 91));
});

test("wrong piece stays in history, does not count, and blocks additional scans", () => {
  const session = addScan(startScanningSession(shop), "OTHER");
  assert.equal(session.count, 0);
  assert.equal(session.items.length, 1);
  assert.equal(session.items[0].isCorrect, false);
  assert.equal(session.blocked, true);
  assert.equal(addScan(session, "ABC-001"), session);
  const resumed = addScan({ ...session, blocked: false }, "ABC-001");
  assert.equal(resumed.count, 1);
  assert.equal(resumed.items.length, 2);
});

test("successive equal product codes count as distinct pieces up to the goal", () => {
  const first = addScan(startScanningSession(shop), "ABC-001");
  const completed = addScan(first, "ABC-001");
  assert.equal(first.count, 1);
  assert.equal(completed.count, 2);
  assert.equal(completed.status, "saving");
  assert.notEqual(completed.items[0].id, completed.items[1].id);
  assert.equal(addScan(completed, "ABC-001"), completed);
  assert.equal(removeScan(completed, completed.items[0].id), completed);
});

test("failed and saved batches cannot accept scans or deletions", () => {
  const completed = addScan(addScan(startScanningSession(shop), "ABC-001"), "ABC-001");
  for (const status of ["failed", "saved"]) {
    const session = { ...completed, status };
    assert.equal(addScan(session, "ABC-001"), session);
    assert.equal(removeScan(session, session.items[0].id), session);
  }
});

test("deleting correct/incorrect pieces preserves the original count rules", () => {
  const incorrect = addScan(startScanningSession(shop), "OTHER");
  const resumed = addScan({ ...incorrect, blocked: false }, "ABC-001");
  const withoutError = removeScan(resumed, incorrect.items[0].id);
  assert.equal(withoutError.count, 1);
  const withoutCorrect = removeScan(withoutError, withoutError.items[0].id);
  assert.equal(withoutCorrect.count, 0);
  assert.equal(removeScan(withoutCorrect, "missing"), withoutCorrect);
});

test("HTTP field validation is shown; connection failure is treated as uncertain", () => {
  const validation = new AxiosError("bad request", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400, data: { errors: { lineId: ["Línea inactiva."] } },
  });
  assert.deepEqual(describeSaveError(validation), { message: "Línea inactiva.", uncertain: false });
  assert.equal(describeSaveError(new AxiosError("Network Error")).uncertain, true);
});
