export type PlayerAttributeField =
  | "pace"
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending"
  | "physical";

export const PLAYER_ATTRIBUTE_FIELDS: {
  field: PlayerAttributeField;
  label: string;
}[] = [
  { field: "pace", label: "Velocidade" },
  { field: "shooting", label: "Finalização" },
  { field: "passing", label: "Passe" },
  { field: "dribbling", label: "Drible" },
  { field: "defending", label: "Defesa" },
  { field: "physical", label: "Físico" },
];
