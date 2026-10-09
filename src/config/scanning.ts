// Opt-in only after the updated API AND SQL migration have been verified.
// Never fall back to legacy automatically after a failed POST.
export const scanningContractVersion = import.meta.env.VITE_SCANNING_CONTRACT ?? "legacy";

export const scanningLineIds = {
  microchannel: Number(import.meta.env.VITE_MICROCHANNEL_LINE_ID),
  line4Empaques: Number(import.meta.env.VITE_LINE4_EMPAQUES_LINE_ID),
};
