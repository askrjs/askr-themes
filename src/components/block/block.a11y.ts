export const BLOCK_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: "data-slot" as const,
    layout: "data-ak-layout" as const,
    gap: "data-gap" as const,
    align: "data-align" as const,
    justify: "data-justify" as const,
    size: "data-size" as const,
  },
  SLOT_VALUES: {
    root: "block" as const,
  },
} as const;

export type BlockA11yContract = typeof BLOCK_A11Y_CONTRACT;
