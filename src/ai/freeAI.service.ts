import { getModel } from "./llm";

export async function generateText(prompt: string) {
  const model = await getModel();

  const output = await model(prompt, {
    max_length: 300,
    temperature: 0.6,
  });

  // format de retour
  return output.generated_text;
}
