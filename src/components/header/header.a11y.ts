export const HEADER_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: "data-slot" as const,
    position: "data-position" as const,
  },
  SLOT_VALUES: {
    root: "header" as const,
  },
} as const;

export type HeaderA11yContract = typeof HEADER_A11Y_CONTRACT;
