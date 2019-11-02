import SemanticDocumentView, {
  SemanticDocProps,
  canRenderSemanticDocument,
  Messages
} from './components/SemanticDocumentView/SemanticDocumentView';

export type SemanticDocumentProps = Omit<
  SemanticDocProps,
  'overrideDocWidth' | 'overrideDocHeight'
>;
export type Messages = Messages;

export default {
  canRenderSemanticDocument,
  SemanticDocument: SemanticDocumentView
};
