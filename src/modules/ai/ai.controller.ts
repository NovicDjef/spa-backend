import { genererAssistantTherapeute, genererRecommandations } from "../../ai/services/freeAI.service";

export const analyseClientIA = async (req, res) => {
  const { clientProfile } = req.body;

  const assistant = await genererAssistantTherapeute(clientProfile);
  const recommandations = await genererRecommandations(clientProfile);

  res.json({ assistant, recommandations });
};
