
export type Tool = 'move' | 'select' | 'crop';
export type Theme = 'light' | 'dark';

export interface Layer {
  id: number;
  name: string;
  type: 'image' | 'text';
  src?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  isExtracted: boolean;
  originalWidth: number;
  originalHeight: number;
  // Text properties
  fontSize?: number;
  color?: string;
}
