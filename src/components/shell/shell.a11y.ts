export const SHELL_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: "data-slot" as const,
    layout: "data-ak-layout" as const,
    variant: "data-variant" as const,
    gap: "data-gap" as const,
  },
  SLOT_VALUES: {
    root: "shell" as const,
    nav: "shell-nav" as const,
    main: "shell-main" as const,
  },
} as const;

export type ShellA11yContract = typeof SHELL_A11Y_CONTRACT;
