import SemanticDocumentView, {
  SemanticDocProps,
  canRenderSemanticDocument
} from './components/SemanticDocumentView/SemanticDocumentView';

export type SemanticDocumentProps = Omit<
  SemanticDocProps,
  'overrideDocWidth' | 'overrideDocHeight'
>;

export default {
  canRenderSemanticDocument,
  SemanticDocument: SemanticDocumentView
};
