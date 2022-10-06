import * as PdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptionsType } from 'pdfjs-dist/types/display/worker_options';

// Make fields from GlobalWorkerOptionsType optional
type GlobalWorkerOptionsDelta = {
  workerPort?: GlobalWorkerOptionsType['workerPort'];
  workerSrc?: GlobalWorkerOptionsType['workerSrc'];
};

const setPdfJsGlobalWorkerOptions = (options: GlobalWorkerOptionsDelta): void => {
  for (const [option, value] of Object.entries(options)) {
    PdfjsLib.GlobalWorkerOptions[option] = value;
  }
};

export default setPdfJsGlobalWorkerOptions;
