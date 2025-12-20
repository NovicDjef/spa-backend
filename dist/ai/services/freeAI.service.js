"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genererAssistantTherapeute = genererAssistantTherapeute;
exports.genererRecommandations = genererRecommandations;
const freeAI_service_1 = require("../freeAI.service");
const assistantTherapeute_1 = require("../prompts/assistantTherapeute");
const recommandations_1 = require("../prompts/recommandations");
async function genererAssistantTherapeute(clientData) {
    const prompt = (0, assistantTherapeute_1.assistantTherapeutePrompt)(clientData);
    return await (0, freeAI_service_1.generateText)(prompt);
}
async function genererRecommandations(clientData) {
    const prompt = (0, recommandations_1.recommandationsPrompt)(clientData);
    return await (0, freeAI_service_1.generateText)(prompt);
}
//# sourceMappingURL=freeAI.service.js.map