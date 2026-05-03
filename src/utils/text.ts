export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function pct(value: number) {
  return `${Math.round(value * 100)} %`;
}
