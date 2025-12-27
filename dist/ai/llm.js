"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = void 0;
const transformers_1 = require("@xenova/transformers");
// Charge un modèle léger
const getModel = async () => {
    const model = await (0, transformers_1.pipeline)("text-generation", "mistralai/mistral-mini-instruct");
    return model;
};
exports.getModel = getModel;
//# sourceMappingURL=llm.js.map