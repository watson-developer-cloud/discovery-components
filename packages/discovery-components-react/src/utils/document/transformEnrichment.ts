import invoiceOntology from './ontology/invoices';
import purchaseOrderOntology from './ontology/purchase_orders';
import flattenDeep from 'lodash/flattenDeep';
import { getId } from './idUtils';
import { Metadata } from '../../components/SemanticDocument/components/MetadataPane/types';
import {
  ENRICHMENTS,
  getEnrichmentName
} from '../../components/SemanticDocument/utils/enrichmentUtils';
import {
  EnrichedHtml,
  Contract,
  Attributes,
  Relations
} from '../../components/SemanticDocument/types';
import { Ontology } from './ontology/types';

const modelMapping = {
  contract: setMetadata,
  invoice: setAttributesAndRelations,
  purchase_order: setAttributesAndRelations
};

function setMetadata(enrichedHtml: Contract): void {
  const meta = {
    contract_amounts: enrichedHtml.contract_amounts,
    effective_dates: enrichedHtml.effective_dates,
    termination_dates: enrichedHtml.termination_dates,
    contract_types: enrichedHtml.contract_types,
    contract_terms: enrichedHtml.contract_terms,
    payment_terms: enrichedHtml.payment_terms
  };

  const updatedMetadata: Metadata[] = [];
  Object.keys(meta).forEach(key => {
    const metadataObj = meta[key];
    if (typeof metadataObj === 'object' && !!metadataObj.length) {
      updatedMetadata.push({
        metadataType: key,
        data: metadataObj
      });
    }
  });
  enrichedHtml.metadata = updatedMetadata;
}

function getOntology(enrichmentName: string): Ontology | undefined {
  let ontology;
  if (enrichmentName === ENRICHMENTS.INVOICE) {
    ontology = invoiceOntology;
  } else if (enrichmentName === ENRICHMENTS.PURCHASE_ORDER) {
    ontology = purchaseOrderOntology;
  }
  return ontology;
}

function setAttributesAndRelations(doc: any, enrichmentName: string): void {
  const ontology = getOntology(enrichmentName);
  if (ontology) {
    doc.attributes = createAttributeObjects(ontology.attributes, doc);
    doc.relations = createRelationObjects(ontology, doc);
  }
}

// find any instances of attribute types that are defined in the ontology and create attribute objects
function createAttributeObjects(
  ontologyAttributesDefArray: string[],
  parsedObject: any
): Attributes[] {
  const filteredAttributes = ontologyAttributesDefArray.filter(
    attributeDef => parsedObject[attributeDef]
  );

  const attributes = filteredAttributes.map(attr => {
    if (Array.isArray(parsedObject[attr])) {
      return parsedObject[attr].map(
        (att: Attributes): Attributes => createAttributeObject(att, attr)
      );
    } else {
      return (
        isValidAttribute(parsedObject[attr]) && createAttributeObject(parsedObject[attr], attr)
      );
    }
  });

  return flattenDeep(attributes);
}

function createAttributeObject({ text, location }: Attributes, type: string): Attributes {
  return {
    type,
    text,
    location
  };
}

// find any instances of relation types that are defined in the ontology and create relation objects
function createRelationObjects(ontology: Ontology, parsedObject: any): Relations[] {
  const filteredRelations = ontology.relations.filter(relation => parsedObject[relation]);

  const relations = filteredRelations.map(relation =>
    createRelationObject(parsedObject[relation], relation, ontology)
  );

  return flattenDeep(relations);
}

function createRelationObject(
  relation: Relations | Relations[],
  type: string,
  ontology: Ontology
): Relations[] {
  // relation is either a array of relations of the same type, or a single relation object
  const relationArray = Array.isArray(relation) ? relation : [relation];

  const result = relationArray.map(
    (rel: Relations): Relations => {
      const attributes = createAttributeObjects(ontology.attributes, rel);
      const relations = createRelationObjects(ontology, rel);
      return {
        type,
        attributes: attributes.length > 0 ? attributes : [],
        relations: relations.length > 0 ? relations : []
      };
    }
  );

  result.map(rel => {
    rel.attributes.push(...getAllAttributesInRelation(rel));
    rel.allAttributeIds = rel.attributes.map((attribute: Attributes): string => getId(attribute));
    return rel;
  });

  return result;
}

function getAllAttributesInRelation({ relations }: Relations): Attributes[] {
  const allAttributes = (relations || []).map(rel => {
    if (rel.relations && rel.relations.length > 0) {
      return getAllAttributesInRelation(rel);
    } else {
      return rel.attributes;
    }
  });

  return flattenDeep(allAttributes);
}

// Function checks if attribute is valid and has location data in it.
// Since have observed noisy data before so this function is required.
function isValidAttribute(attr: Attributes): boolean {
  if (attr && attr.location && attr.location.begin && attr.location.end) {
    return true;
  }
  return false;
}

export default function transformEnrichment(enrichedHtml: EnrichedHtml[]): EnrichedHtml[] {
  const newEnrichedHtml = { ...enrichedHtml };

  if (newEnrichedHtml && newEnrichedHtml[0]) {
    const enrichmentName = getEnrichmentName(newEnrichedHtml[0]);
    const enrichment = newEnrichedHtml[0][enrichmentName];
    modelMapping[enrichmentName](enrichment, enrichmentName);
  }

  return newEnrichedHtml;
}
