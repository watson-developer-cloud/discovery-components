import CIDocument, {
  CIDocumentProps,
  canRenderCIDocument,
  Messages
} from './components/CIDocument/CIDocument';
import CIDocumentContent, {
  CIDocumentContentProps
} from './components/CIDocumentContent/CIDocumentContent';
import NavigationToolbar, {
  NavigationToolbarProps
} from './components/NavigationToolbar/NavigationToolbar';

// re-export types
export type CIDocumentProps = Omit<CIDocumentProps, 'overrideDocWidth' | 'overrideDocHeight'>;
export type CIDocumentContentProps = CIDocumentContentProps;
export type CINavigationToolbarProps = NavigationToolbarProps;
export type Messages = Messages;

// export components
const CIDoc: any = CIDocument;
CIDoc.CIDocumentContent = CIDocumentContent;
CIDoc.CINavigationToolbar = NavigationToolbar;

export { CIDoc as CIDocument, canRenderCIDocument };
