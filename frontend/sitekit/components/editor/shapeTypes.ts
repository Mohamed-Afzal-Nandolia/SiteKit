// Shape type definitions
export interface DecorativeShape {
    id: string;
    type: 'circle' | 'rectangle' | 'rounded-rectangle';
    x: number; // percentage from left (0-100)
    y: number; // percentage from top (0-100)
    width: number; // in pixels
    height: number; // in pixels
    color: string; // hex color
    opacity: number; // 0-1
    blur: number; // blur amount in pixels
    borderRadius: number; // border radius in pixels (0-500)
    zIndex: number; // layer order
}
