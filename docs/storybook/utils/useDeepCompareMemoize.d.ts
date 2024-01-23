import { EffectCallback } from 'react';
export declare function useDeepCompareMemo<T>(factory: () => T, dependencies: readonly any[] | undefined): T;
export declare function useDeepCompareCallback<T extends (...args: any[]) => any>(callback: T, dependencies: readonly any[]): T;
export declare function useDeepCompareEffect(callback: EffectCallback, dependencies: readonly any[]): void;
