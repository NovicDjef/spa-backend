export const assistantTherapeutePrompt = (client: any) => `
Tu es un assistant professionnel en massothérapie (non médical).
Analyse le profil client ainsi les notes marque a son dossier et produis une réponse structurée en français.

Client :
${JSON.stringify(client, null, 2)}

Répond en JSON :
{
  "resumeClient": "",
  "objectifsSeance": [],
  "pointsVigilance": [],
  "contreIndications": [],
  "zonesPrioritaires": [],
  "zonesAEviter": [],
  "conseilsSeance": []
}
`;
