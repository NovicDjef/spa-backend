import { generateText } from "../freeAI.service";
import { assistantTherapeutePrompt } from "../prompts/assistantTherapeute";
import { recommandationsPrompt } from "../prompts/recommandations";

export async function genererAssistantTherapeute(clientData: any) {
  const prompt = assistantTherapeutePrompt(clientData);
  return await generateText(prompt);
}

export async function genererRecommandations(clientData: any) {
  const prompt = recommandationsPrompt(clientData);
  return await generateText(prompt);
}
