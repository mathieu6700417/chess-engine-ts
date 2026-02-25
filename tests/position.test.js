"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = require("node:assert");
const position_1 = require("../src/position");
(0, node_test_1.describe)('FEN Parser', () => {
    (0, node_test_1.it)('parse and generates the initial position', () => {
        const pos = new position_1.Position();
        pos.setFen(position_1.START_FEN);
        node_assert_1.strict.equal(pos.fen(), position_1.START_FEN);
    });
});
//# sourceMappingURL=position.test.js.map