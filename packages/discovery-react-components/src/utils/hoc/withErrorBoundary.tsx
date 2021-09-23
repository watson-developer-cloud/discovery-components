import React, { ComponentClass, ComponentType, ReactNode, PureComponent } from 'react';

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
export function withErrorBoundary<P extends {}>(
  WrappedComponent: ComponentType<P & WithErrorBoundaryProps>
): ComponentClass<Omit<P, keyof WithErrorBoundaryProps>, WithErrorBoundaryState> {
  type Props = Omit<P, keyof WithErrorBoundaryProps>;

  return class WithErrorBoundary extends PureComponent<Props, WithErrorBoundaryState> {
    constructor(props: Props) {
      super(props);
      this.state = { didCatch: false };
    }

    static readonly displayName = `WithErrorBoundary(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;
    static readonly WrappedComponent = WrappedComponent;

    static getDerivedStateFromError(/* error: Error */): WithErrorBoundaryState {
      return { didCatch: true };
    }

    // componentDidCatch(error, errorInfo) {
    //   logErrorToMyService(error, errorInfo);
    // }

    componentDidUpdate(_: Props, prevState: WithErrorBoundaryState): void {
      // If properties change and we had previously caught an error, reset
      // so component can re-render normally.
      if (prevState.didCatch) {
        this.setState({ didCatch: false });
      }
    }

    render(): ReactNode {
      return <WrappedComponent {...(this.props as P)} {...this.state} />;
    }
  };
}

export default withErrorBoundary;
