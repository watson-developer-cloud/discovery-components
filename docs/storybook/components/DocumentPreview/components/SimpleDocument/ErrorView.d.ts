import { FC, ReactNode } from 'react';
type ErrorViewProps = {
    header: ReactNode;
    message: ReactNode;
};
declare const ErrorView: FC<ErrorViewProps>;
export default ErrorView;
