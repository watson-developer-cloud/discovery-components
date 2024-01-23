import { GlobalWorkerOptionsType } from 'pdfjs-dist/types/display/worker_options';
type GlobalWorkerOptionsDelta = {
    workerPort?: GlobalWorkerOptionsType['workerPort'];
    workerSrc?: GlobalWorkerOptionsType['workerSrc'];
};
declare const setPdfJsGlobalWorkerOptions: (options: GlobalWorkerOptionsDelta) => void;
export default setPdfJsGlobalWorkerOptions;
