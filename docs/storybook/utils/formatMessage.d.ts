import { ReactNode } from 'react';
interface SubstitutionValues {
    [name: string]: ReactNode;
}
export declare const formatMessage: (message: string, values: SubstitutionValues, outputJsx?: boolean) => ReactNode[];
export {};
