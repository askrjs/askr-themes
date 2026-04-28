import { createLogo } from "./create-logo";

const MICROSOFT_LOGO_NODE = [
	["rect", { x: "2", y: "2", width: "9", height: "9", fill: "#F25022" }],
	["rect", { x: "13", y: "2", width: "9", height: "9", fill: "#7FBA00" }],
	["rect", { x: "2", y: "13", width: "9", height: "9", fill: "#00A4EF" }],
	["rect", { x: "13", y: "13", width: "9", height: "9", fill: "#FFB900" }],
] as const;

export const MicrosoftLogo = createLogo(
	"MicrosoftLogo",
	"0 0 24 24",
	MICROSOFT_LOGO_NODE,
);

