export const CONTAINER_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: "data-slot" as const,
    layout: "data-ak-layout" as const,
  },
  SLOT_VALUES: {
    root: "container" as const,
  },
} as const;

export type ContainerA11yContract = typeof CONTAINER_A11Y_CONTRACT;
