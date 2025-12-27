"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyseClientIA = void 0;
const freeAI_service_1 = require("../../ai/services/freeAI.service");
const analyseClientIA = async (req, res) => {
    const { clientProfile } = req.body;
    const assistant = await (0, freeAI_service_1.genererAssistantTherapeute)(clientProfile);
    const recommandations = await (0, freeAI_service_1.genererRecommandations)(clientProfile);
    res.json({ assistant, recommandations });
};
exports.analyseClientIA = analyseClientIA;
//# sourceMappingURL=ai.controller.js.map