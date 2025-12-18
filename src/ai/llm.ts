import { pipeline } from "@xenova/transformers";

// Charge un modèle léger
export const getModel = async () => {
  const model = await pipeline("text-generation", "mistralai/mistral-mini-instruct");
  return model;
};
