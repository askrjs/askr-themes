export const BLOCK_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: "data-slot" as const,
    layout: "data-ak-layout" as const,
  },
  SLOT_VALUES: {
    root: "block" as const,
  },
} as const;

export type BlockA11yContract = typeof BLOCK_A11Y_CONTRACT;
