import * as PdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptionsType } from 'pdfjs-dist/types/src/display/worker_options';

// Make fields from GlobalWorkerOptionsType optional
type GlobalWorkerOptionsDelta = {
  workerPort?: GlobalWorkerOptionsType['workerPort'];
  workerSrc?: GlobalWorkerOptionsType['workerSrc'];
};

const setPdfJsGlobalWorkerOptions = (options: GlobalWorkerOptionsDelta): void => {
  for (const [option, value] of Object.entries(options)) {
    // @ts-expect-error
    PdfjsLib.GlobalWorkerOptions[option] = value;
  }
};

export default setPdfJsGlobalWorkerOptions;
