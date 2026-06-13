import { AxiosError } from "axios";

function firstMessage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstMessage(value[0]);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;

    for (const item of Object.values(record)) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback = "Nao foi possivel concluir a acao.") {
  if (error instanceof AxiosError) {
    return firstMessage(error.response?.data) ?? fallback;
  }

  return fallback;
}
