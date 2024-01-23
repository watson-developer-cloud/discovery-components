import React from 'react';
import { SearchContextIFC, SearchApiIFC } from 'components/DiscoverySearch/DiscoverySearch';
export declare function wrapWithContext(children: React.ReactElement, apiOverride: Partial<SearchApiIFC>, contextOverride: Partial<SearchContextIFC>): React.ReactElement;
export declare function createDummyResponse(result: any): {
    result: any;
    status: number;
    statusText: string;
    headers: {};
};
export declare function createDummyResponsePromise<T>(result: T): Promise<{
    result: any;
    status: number;
    statusText: string;
    headers: {};
}>;
export declare const browserWindow: any;
