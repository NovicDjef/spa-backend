export const recommandationsPrompt = (client: any) => `
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
