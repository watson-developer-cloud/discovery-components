import { CIDocumentProps as _CIDocumentProps, canRenderCIDocument, Messages as _Messages } from './components/CIDocument/CIDocument';
import { CIDocumentContentProps as _CIDocumentContentProps } from './components/CIDocumentContent/CIDocumentContent';
import { NavigationToolbarProps } from './components/NavigationToolbar/NavigationToolbar';
export type CIDocumentProps = Omit<_CIDocumentProps, 'overrideDocWidth' | 'overrideDocHeight'>;
export type CIDocumentContentProps = _CIDocumentContentProps;
export type CINavigationToolbarProps = NavigationToolbarProps;
export type Messages = _Messages;
declare const CIDoc: any;
export { CIDoc as CIDocument, canRenderCIDocument };
