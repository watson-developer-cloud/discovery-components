import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';

export function isPassage(obj: any): obj is QueryResultPassage {
  return obj && 'passage_text' in obj;
}

export function isTable(highlight: any): highlight is QueryTableResult {
  return !!highlight?.table?.location;
}
