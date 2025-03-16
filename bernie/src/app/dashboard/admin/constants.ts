// src/app/dashboard/admin/constants.ts
import { Metric } from "./types";

// On utilise let au lieu de const pour pouvoir la modifier
export let CASINOS: string[] = [
  "AZUR",
  "BANZAI",
  "CASINO CHAMPAGNE",
  "CASINO NIGHT",
];

// Fonction pour ajouter un nouveau casino
export function addCasino(name: string): void {
  if (!CASINOS.includes(name)) {
    CASINOS.push(name);
  }
}

// Fonction pour supprimer un casino
export function removeCasino(name: string): void {
  CASINOS = CASINOS.filter((casino) => casino !== name);
}

// Fonction pour renommer un casino
export function renameCasino(oldName: string, newName: string): void {
  const index = CASINOS.indexOf(oldName);
  if (index !== -1 && !CASINOS.includes(newName)) {
    CASINOS[index] = newName;
  }
}

export const METRICS: Metric[] = [
  { id: "TOTAL_DEPOSIT", label: "TOTAL DEPOSIT", type: "currency" },
  { id: "SIGNUP", label: "SIGNUP", type: "number" },
  { id: "FTD", label: "FTD", type: "number" },
  { id: "NGR", label: "NGR", type: "currency" },
  { id: "PROFITS", label: "PROFITS", type: "currency" },
];

export const MONTHS: string[] = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
