import { ComponentClass, ComponentType } from 'react';
/**
 * Ideas for improvements:
 * - Take optional parameter which would be component to render in case of
 *   error, instead of WrappedComponent
 */
export interface WithErrorBoundaryProps {
    didCatch: boolean;
}
export interface WithErrorBoundaryState {
    didCatch: boolean;
}
/**
 * High-order component which injects a `didCatch` property, letting
 * wrapped component know that a previous render resulted in a
 * caught error.
 */
export declare function withErrorBoundary<P extends {}>(WrappedComponent: ComponentType<P & WithErrorBoundaryProps>): ComponentClass<Omit<P, keyof WithErrorBoundaryProps>, WithErrorBoundaryState>;
export default withErrorBoundary;
