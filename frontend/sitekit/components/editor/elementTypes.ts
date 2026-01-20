// Element Types for In-Section Elements
// These elements can be added inside any section (Hero, Content, etc.)

export interface SectionElement {
    id: string;
    type: "text" | "button" | "image";

    // Position (percentage-based for responsiveness)
    x: number;  // 0-100 (% from left)
    y: number;  // 0-100 (% from top)

    // Content
    content: string;
    href?: string;  // For buttons
    newTab?: boolean;
    fileName?: string; // For attached files
    fileType?: string; // MIME type


    // Style properties
    maxWidth?: string | number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: "normal" | "italic";
    textDecoration?: "none" | "underline" | "line-through";
    textColor?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";

    // Mobile Overrides
    mobile?: Partial<SectionElement>;

    // Button-specific
    borderRadius?: number;
    paddingX?: number;
    paddingY?: number;
    borderWidth?: number;
    borderColor?: string;

    // Text Stroke/Outline (for text elements)
    textStrokeColor?: string;
    textStrokeWidth?: number;

    // Image-specific
    src?: string;
    width?: number;  // percentage width (0-100)
    height?: number; // percentage height (0-100) or "auto"
    objectFit?: "contain" | "cover" | "fill";
}

// Extended section config with elements
export interface ExtendedSectionConfig {
    // All existing config properties are preserved
    [key: string]: unknown;

    // NEW: Custom elements added to the section
    elements?: SectionElement[];

    // Section-level background customization
    sectionBackground?: string;
    sectionBackgroundImage?: string;
    sectionBackgroundOpacity?: number;

    // Section Layout
    paddingTop?: number;
    paddingBottom?: number;
}

// Generate unique ID
export function generateElementId(): string {
    return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default text element
export function createDefaultTextElement(x = 50, y = 50): SectionElement {
    return {
        id: generateElementId(),
        type: "text",
        x,
        y,
        content: "Click to edit text",
        fontSize: 18,
        fontFamily: "Inter, sans-serif",
        fontWeight: "400",
        fontStyle: "normal",
        textDecoration: "none",
        textColor: "#FFFFFF",
        backgroundColor: "transparent",
        textAlign: "center",
        lineHeight: 1.6,
        letterSpacing: 0,
        textTransform: "none",
    };
}

// Default button element
export function createDefaultButtonElement(x = 50, y = 50): SectionElement {
    return {
        id: generateElementId(),
        type: "button",
        x,
        y,
        content: "Click Me",
        href: "#",
        newTab: true,
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
        fontStyle: "normal",
        textDecoration: "none",
        textColor: "#ffffff",
        backgroundColor: "#3b82f6",
        textAlign: "center",
        lineHeight: 1.5,
        letterSpacing: 0,
        textTransform: "none",
        borderRadius: 8,
        paddingX: 24,
        paddingY: 12,
        borderWidth: 0,
        borderColor: "transparent",
    };
}

// Default image element
export function createDefaultImageElement(x = 50, y = 50, src = ""): SectionElement {
    return {
        id: generateElementId(),
        type: "image",
        x,
        y,
        content: "", // Not used for images
        src,
        width: 30, // 30% of section width
        height: 40, // 40% of section height
        objectFit: "contain",
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        fontWeight: "400",
        fontStyle: "normal",
        textDecoration: "none",
        textColor: "#FFFFFF",
        backgroundColor: "transparent",
        textAlign: "center",
        lineHeight: 1.5,
        letterSpacing: 0,
        textTransform: "none",
    };
}

// Color presets for quick selection
export const COLOR_PRESETS = [
    "#000000", "#FFFFFF", "#374151", "#6B7280", "#9CA3AF",
    "#EF4444", "#F97316", "#EAB308", "#22C55E", "#14B8A6",
    "#3B82F6", "#6366F1", "#A855F7", "#EC4899",
];

// Font options
export const FONT_OPTIONS = [
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: '"Times New Roman", serif' },
    { label: "Courier New", value: '"Courier New", monospace' },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
];

// Font size options
export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

// Font weight options
export const FONT_WEIGHT_OPTIONS = [
    { label: "Light", value: "300" },
    { label: "Regular", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
];
