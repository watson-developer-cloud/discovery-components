import invoiceOntology from './ontology/invoices';
import purchaseOrderOntology from './ontology/purchase_orders';
import flattenDeep from 'lodash/flattenDeep';
import { getId } from './idUtils';
import { ENRICHMENTS, getEnrichmentName } from 'components/CIDocument/utils/enrichmentUtils';
import {
  EnrichedHtml,
  Contract,
  Invoice,
  PurchaseOrder,
  Attributes,
  Relations,
  Metadata
} from 'components/CIDocument/types';
import { Ontology } from './ontology/types';

const ontologyModelMapping = {
  invoice: invoiceOntology,
  purchase_order: purchaseOrderOntology
};

function getupdatedEnrichment(enrichmentName: string, enrichment: any): EnrichedHtml {
  if (enrichmentName === ENRICHMENTS.CONTRACT) {
    enrichment.metadata = setMetadata(enrichment);
  } else if (
    enrichmentName === ENRICHMENTS.INVOICE ||
    enrichmentName === ENRICHMENTS.PURCHASE_ORDER
  ) {
    const { attributes, relations } = setAttributesAndRelations(enrichmentName, enrichment);
    enrichment.attributes = attributes;
    enrichment.relations = relations;
  }
  return enrichment;
}

function setMetadata(enrichedHtml: Contract): Metadata[] {
  const meta = {
    contract_amounts: enrichedHtml.contract_amounts,
    effective_dates: enrichedHtml.effective_dates,
    termination_dates: enrichedHtml.termination_dates,
    contract_types: enrichedHtml.contract_types,
    contract_terms: enrichedHtml.contract_terms,
    payment_terms: enrichedHtml.payment_terms
  };

  const metadata: Metadata[] = [];
  Object.keys(meta).forEach(key => {
    const metadataObj = meta[key];
    if (typeof metadataObj === 'object' && !!metadataObj.length) {
      metadata.push({
        metadataType: key,
        data: metadataObj
      });
    }
  });
  return metadata;
}

function setAttributesAndRelations(
  enrichmentName: string,
  enrichment: any
): Invoice | PurchaseOrder {
  const ontology = ontologyModelMapping[enrichmentName];
  const attributes = setAttributes(ontology.attributes, enrichment);
  const relations = setRelations(ontology, enrichment);
  return { attributes, relations };
}

// find any instances of attribute types that are defined in the ontology and create attribute objects
function setAttributes(ontologyAttributesDefArray: string[], parsedObject: any): Attributes[] {
  const filteredAttributes = ontologyAttributesDefArray.filter(
    attributeDef => parsedObject[attributeDef]
  );

  const attributes = filteredAttributes.map(attr => {
    const parsedAttributes = parsedObject[attr];
    if (Array.isArray(parsedAttributes)) {
      return parsedAttributes.map(att => createAttributeObject(att, attr));
    } else if (hasLocationData(parsedAttributes)) {
      return createAttributeObject(parsedAttributes, attr);
    }
    return parsedAttributes;
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
function setRelations(ontology: Ontology, parsedObject: any): Relations[] {
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
      const attributes = setAttributes(ontology.attributes, rel);
      const relations = setRelations(ontology, rel);
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
function hasLocationData(attr: Attributes): boolean {
  return !!(attr && attr.location && attr.location.begin && attr.location.end);
}
//attr?.location?.begin
export default function transformEnrichment(enrichedHtml: EnrichedHtml[]): EnrichedHtml[] {
  if (enrichedHtml && enrichedHtml[0]) {
    const enrichmentName = getEnrichmentName(enrichedHtml[0]);
    const enrichment = enrichedHtml[0][enrichmentName];
    const updatedEnrichment = getupdatedEnrichment(enrichmentName, enrichment);
    enrichedHtml[0][enrichmentName] = updatedEnrichment;
  }
  return enrichedHtml;
}
