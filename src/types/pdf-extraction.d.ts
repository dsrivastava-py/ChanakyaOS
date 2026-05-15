declare module "pdf-extraction" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function PDF(dataBuffer: Buffer, options?: any): Promise<PDFData>;

  export default PDF;
}
