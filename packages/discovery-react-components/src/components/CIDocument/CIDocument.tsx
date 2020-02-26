import CIDocument, {
  CIDocumentProps as _CIDocumentProps,
  canRenderCIDocument,
  Messages as _Messages
} from './components/CIDocument/CIDocument';
import CIDocumentContent, {
  CIDocumentContentProps as _CIDocumentContentProps
} from './components/CIDocumentContent/CIDocumentContent';
import NavigationToolbar, {
  NavigationToolbarProps
} from './components/NavigationToolbar/NavigationToolbar';

// re-export types
export type CIDocumentProps = Omit<_CIDocumentProps, 'overrideDocWidth' | 'overrideDocHeight'>;
export type CIDocumentContentProps = _CIDocumentContentProps;
export type CINavigationToolbarProps = NavigationToolbarProps;
export type Messages = _Messages;

// export components
const CIDoc: any = CIDocument;
CIDoc.CIDocumentContent = CIDocumentContent;
CIDoc.CINavigationToolbar = NavigationToolbar;

export { CIDoc as CIDocument, canRenderCIDocument };
