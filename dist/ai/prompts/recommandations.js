"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommandationsPrompt = void 0;
const recommandationsPrompt = (client) => `
Tu proposes des recommandations de soin en massothérapie (non médical).
Sers-toi du profil client ci-dessous.

Client :
${JSON.stringify(client, null, 2)}

Répond en JSON :
{
  "typeDeSoin": "",
  "dureeRecommandee": "",
  "frequence": "",
  "techniquesSuggerees": [],
  "beneficesAttendus": [],
  "conseilsPostSeance": []
}
`;
exports.recommandationsPrompt = recommandationsPrompt;
//# sourceMappingURL=recommandations.js.map