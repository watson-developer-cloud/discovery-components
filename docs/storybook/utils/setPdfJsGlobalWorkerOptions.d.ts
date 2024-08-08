type GlobalWorkerOptionsDelta = {
    workerPort?: Worker;
    workerSrc?: string;
};
declare const setPdfJsGlobalWorkerOptions: (options: GlobalWorkerOptionsDelta) => void;
export default setPdfJsGlobalWorkerOptions;
