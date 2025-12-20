"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateText = generateText;
const llm_1 = require("./llm");
async function generateText(prompt) {
    const model = await (0, llm_1.getModel)();
    const output = await model(prompt, {
        max_length: 300,
        temperature: 0.6,
    });
    // format de retour
    return output.generated_text;
}
//# sourceMappingURL=freeAI.service.js.map