export {};

declare global {
  interface Window {
    getBase64Image: (imageName: string) => Promise<string>;
  }
}
