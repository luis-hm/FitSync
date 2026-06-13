export function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}
