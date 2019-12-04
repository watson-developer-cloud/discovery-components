import CIDocument, {
  CIDocumentProps,
  canRenderCIDocument,
  Messages
} from '@CIDocument/components/CIDocument/CIDocument';
import CIDocumentContent, {
  CIDocumentContentProps
} from '@CIDocument/components/CIDocumentContent/CIDocumentContent';
import NavigationToolbar, {
  NavigationToolbarProps
} from '@CIDocument/components/NavigationToolbar/NavigationToolbar';

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
