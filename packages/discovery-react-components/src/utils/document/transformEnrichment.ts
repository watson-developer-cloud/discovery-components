import invoiceOntology from './ontology/invoices';
import purchaseOrderOntology from './ontology/purchase_orders';
import flattenDeep from 'lodash/flattenDeep';
import { getId } from './idUtils';
import { getEnrichmentName } from 'components/CIDocument/utils/enrichmentUtils';
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

const ontologyMapping = {
  invoice: invoiceOntology,
  purchase_order: purchaseOrderOntology
};

const modelMapping = {
  contract: setMetadata,
  invoice: setAttributesAndRelations,
  purchase_order: setAttributesAndRelations
};

function getUpdatedEnrichment(enrichment: EnrichedHtml, enrichmentName: string): EnrichedHtml {
  if (enrichment && enrichmentName in modelMapping) {
    enrichment = modelMapping[enrichmentName](enrichment, enrichmentName);
  }
  return enrichment;
}

function setMetadata(enrichedHtml: Contract): Contract {
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

  return enrichedHtml;
}

function setAttributesAndRelations(
  enrichment: Invoice | PurchaseOrder,
  enrichmentName: string
): Invoice | PurchaseOrder {
  const ontology = ontologyMapping[enrichmentName];
  enrichment.attributes = setAttributes(ontology, enrichment);
  enrichment.relations = setRelations(ontology, enrichment);

  return enrichment;
}

// find any instances of attribute types that are defined in the ontology and create attribute objects
function setAttributes(ontology: Ontology, parsedObject: any): Attributes[] {
  const filteredAttributes = ontology.attributes.filter(attributeDef => parsedObject[attributeDef]);

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

  const result = relationArray.map((rel: Relations): Relations => {
    const attributes = setAttributes(ontology, rel);
    const relations = setRelations(ontology, rel);
    return {
      type,
      attributes: attributes.length > 0 ? attributes : [],
      relations: relations.length > 0 ? relations : []
    };
  });

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
  return !!(
    attr &&
    attr.location &&
    typeof attr.location.begin !== 'undefined' &&
    attr.location.end
  );
}

export default function transformEnrichment(enrichedHtml: EnrichedHtml[]): EnrichedHtml[] {
  if (enrichedHtml && enrichedHtml[0]) {
    const enrichmentName = getEnrichmentName(enrichedHtml[0]);
    const enrichment = enrichedHtml[0][enrichmentName];
    const updatedEnrichment = getUpdatedEnrichment(enrichment, enrichmentName);
    enrichedHtml[0][enrichmentName] = updatedEnrichment;
  }
  return enrichedHtml;
}
