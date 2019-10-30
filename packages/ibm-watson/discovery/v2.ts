/**
 * (C) Copyright IBM Corp. 2019.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as extend from 'extend';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { Authenticator, BaseService, getMissingParams, UserOptions } from 'ibm-cloud-sdk-core';
import { getAuthenticatorFromEnvironment } from 'ibm-cloud-sdk-core';
import { getSdkHeaders } from '../lib/common';

/**
 * IBM Watson&trade; Discovery for IBM Cloud Pak for Data is a cognitive search and content analytics engine that you
 * can add to applications to identify patterns, trends and actionable insights to drive better decision-making.
 * Securely unify structured and unstructured data with pre-enriched content, and use a simplified query language to
 * eliminate the need for manual filtering of results.
 */

class DiscoveryV2 extends BaseService {

  name: string; // set by prototype to 'discovery-data'
  serviceVersion: string; // set by prototype to 'v2'

  /**
   * Construct a DiscoveryV2 object.
   *
   * @param {Object} options - Options for the service.
   * @param {string} options.version - The API version date to use with the service, in "YYYY-MM-DD" format. Whenever
   * the API is changed in a backwards incompatible way, a new minor version of the API is released. The service uses
   * the API version for the date you specify, or the most recent version before that date. Note that you should not
   * programmatically specify the current date at runtime, in case the API has been updated since your application's
   * release. Instead, specify a version date that is compatible with your application, and don't change it until your
   * application is ready for a later version.
   * @param {string} [options.serviceUrl] - The base url to use when contacting the service (e.g. 'https://gateway.watsonplatform.net/discovery/api'). The base url may differ between IBM Cloud regions.
   * @param {OutgoingHttpHeaders} [options.headers] - Default headers that shall be included with every request to the service.
   * @param {Authenticator} [options.authenticator] - The Authenticator object used to authenticate requests to the service. Defaults to environment if not set
   * @constructor
   * @returns {DiscoveryV2}
   * @throws {Error}
   */
  constructor(options: UserOptions) {
    // If the caller didn't supply an authenticator, construct one from external configuration.
    if (!options.authenticator) {
      options.authenticator = getAuthenticatorFromEnvironment('discovery-data');
    }
    super(options);
    // check if 'version' was provided
    if (typeof this.baseOptions.version === 'undefined') {
      throw new Error('Argument error: version was not specified');
    }
    this.baseOptions.qs.version = options.version;
  }

  /*************************
   * collections
   ************************/

  /**
   * List collections.
   *
   * Lists existing collections for the project instance.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.projectId - The ID of the project.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response
   * @returns {Promise<DiscoveryV2.Response<DiscoveryV2.ListCollectionsResponse>>}
   */
  public listCollections(params: DiscoveryV2.ListCollectionsParams, callback?: DiscoveryV2.Callback<DiscoveryV2.ListCollectionsResponse>): Promise<DiscoveryV2.Response<DiscoveryV2.ListCollectionsResponse>> {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['projectId'];

    return new Promise((resolve, reject) => {
      const missingParams = getMissingParams(_params, requiredParams);
      if (missingParams) {
        if (_callback) {
          _callback(missingParams);
          return resolve();
        }
        return reject(missingParams);
      }

      const path = {
        'project_id': _params.projectId
      };

      const sdkHeaders = getSdkHeaders('discovery-data', 'v2', 'listCollections');

      const parameters = {
        options: {
          url: '/v2/projects/{project_id}/collections',
          method: 'GET',
          path,
        },
        defaultOptions: extend(true, {}, this.baseOptions, {
          headers: extend(true, sdkHeaders, {
            'Accept': 'application/json',
          }, _params.headers),
        }),
      };

      return this.createRequest(parameters).then(
        res => {
          if (_callback) {
            _callback(null, res);
          }
          return resolve(res);
        },
        err => {
          if (_callback) {
            _callback(err)
            return resolve();
          }
          return reject(err);
        }
      );
    });
  };

  /*************************
   * queries
   ************************/

  /**
   * Query a project.
   *
   * By using this method, you can construct long queries. For details, see the [Discovery
   * documentation](https://cloud.ibm.com/docs/services/discovery?topic=discovery-query-concepts#query-concepts).
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.projectId - The ID of the project.
   * @param {string[]} [params.collectionIds] - A comma-separated list of collection IDs to be queried against.
   * @param {string} [params.filter] - A cacheable query that excludes documents that don't mention the query content.
   * Filter searches are better for metadata-type searches and for assessing the concepts in the data set.
   * @param {string} [params.query] - A query search returns all documents in your data set with full enrichments and
   * full text, but with the most relevant documents listed first. Use a query search when you want to find the most
   * relevant search results.
   * @param {string} [params.naturalLanguageQuery] - A natural language query that returns relevant documents by
   * utilizing training data and natural language understanding.
   * @param {string} [params.aggregation] - An aggregation search that returns an exact answer by combining query search
   * with filters. Useful for applications to build lists, tables, and time series. For a full list of possible
   * aggregations, see the Query reference.
   * @param {number} [params.count] - Number of results to return.
   * @param {string[]} [params.returnFields] - A list of the fields in the document hierarchy to return. If this
   * parameter not specified, then all top-level fields are returned.
   * @param {number} [params.offset] - The number of query results to skip at the beginning. For example, if the total
   * number of results that are returned is 10 and the offset is 8, it returns the last two results.
   * @param {string} [params.sort] - A comma-separated list of fields in the document to sort on. You can optionally
   * specify a sort direction by prefixing the field with `-` for descending or `+` for ascending. Ascending is the
   * default sort direction if no prefix is specified. This parameter cannot be used in the same query as the **bias**
   * parameter.
   * @param {boolean} [params.highlight] - When `true`, a highlight field is returned for each result which contains the
   * fields which match the query with `<em></em>` tags around the matching query terms.
   * @param {boolean} [params.spellingSuggestions] - When `true` and the **natural_language_query** parameter is used,
   * the **natural_language_query** parameter is spell checked. The most likely correction is retunred in the
   * **suggested_query** field of the response (if one exists).
   * @param {QueryLargeTableResults} [params.tableResults] - Configuration for table retrieval.
   * @param {QueryLargeSuggestedRefinements} [params.suggestedRefinements] - Configuration for suggested refinements.
   * @param {QueryLargePassages} [params.passages] - Configuration for passage retrieval.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response
   * @returns {Promise<DiscoveryV2.Response<DiscoveryV2.QueryResponse>>}
   */
  public query(params: DiscoveryV2.QueryParams, callback?: DiscoveryV2.Callback<DiscoveryV2.QueryResponse>): Promise<DiscoveryV2.Response<DiscoveryV2.QueryResponse>> {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['projectId'];

    return new Promise((resolve, reject) => {
      const missingParams = getMissingParams(_params, requiredParams);
      if (missingParams) {
        if (_callback) {
          _callback(missingParams);
          return resolve();
        }
        return reject(missingParams);
      }

      const body = {
        'collection_ids': _params.collectionIds,
        'filter': _params.filter,
        'query': _params.query,
        'natural_language_query': _params.naturalLanguageQuery,
        'aggregation': _params.aggregation,
        'count': _params.count,
        'return': _params.returnFields,
        'offset': _params.offset,
        'sort': _params.sort,
        'highlight': _params.highlight,
        'spelling_suggestions': _params.spellingSuggestions,
        'table_results': _params.tableResults,
        'suggested_refinements': _params.suggestedRefinements,
        'passages': _params.passages
      };

      const path = {
        'project_id': _params.projectId
      };

      const sdkHeaders = getSdkHeaders('discovery-data', 'v2', 'query');

      const parameters = {
        options: {
          url: '/v2/projects/{project_id}/query',
          method: 'POST',
          body,
          path,
        },
        defaultOptions: extend(true, {}, this.baseOptions, {
          headers: extend(true, sdkHeaders, {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }, _params.headers),
        }),
      };

      return this.createRequest(parameters).then(
        res => {
          if (_callback) {
            _callback(null, res);
          }
          return resolve(res);
        },
        err => {
          if (_callback) {
            _callback(err)
            return resolve();
          }
          return reject(err);
        }
      );
    });
  };

  /**
   * Get Autocomplete Suggestions.
   *
   * Returns completion query suggestions for the specified prefix.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.projectId - The ID of the project.
   * @param {string[]} [params.collectionIds] - The ID of the collections.
   * @param {string} [params.field] - The field in the result documents that autocompletion suggestions are identified
   * from.
   * @param {string} [params.prefix] - The prefix to use for autocompletion. For example, the prefix `Ho` could
   * autocomplete to `Hot`, `Housing`, or `How do I upgrade`. Possible completions are.
   * @param {number} [params.count] - The number of autocompletion suggestions to return.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response
   * @returns {Promise<DiscoveryV2.Response<DiscoveryV2.Completions>>}
   */
  public getAutocompletion(params: DiscoveryV2.GetAutocompletionParams, callback?: DiscoveryV2.Callback<DiscoveryV2.Completions>): Promise<DiscoveryV2.Response<DiscoveryV2.Completions>> {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['projectId'];

    return new Promise((resolve, reject) => {
      const missingParams = getMissingParams(_params, requiredParams);
      if (missingParams) {
        if (_callback) {
          _callback(missingParams);
          return resolve();
        }
        return reject(missingParams);
      }

      const query = {
        'collection_ids': _params.collectionIds,
        'field': _params.field,
        'prefix': _params.prefix,
        'count': _params.count
      };

      const path = {
        'project_id': _params.projectId
      };

      const sdkHeaders = getSdkHeaders('discovery-data', 'v2', 'getAutocompletion');

      const parameters = {
        options: {
          url: '/v2/projects/{project_id}/autocompletion',
          method: 'GET',
          qs: query,
          path,
        },
        defaultOptions: extend(true, {}, this.baseOptions, {
          headers: extend(true, sdkHeaders, {
            'Accept': 'application/json',
          }, _params.headers),
        }),
      };

      return this.createRequest(parameters).then(
        res => {
          if (_callback) {
            _callback(null, res);
          }
          return resolve(res);
        },
        err => {
          if (_callback) {
            _callback(err)
            return resolve();
          }
          return reject(err);
        }
      );
    });
  };

  /*************************
   * componentSettings
   ************************/

  /**
   * Configuration settings for components.
   *
   * Returns default configuration settings for components.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.projectId - The ID of the project.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response
   * @returns {Promise<DiscoveryV2.Response<DiscoveryV2.ComponentSettingsResponse>>}
   */
  public getComponentSettings(params: DiscoveryV2.GetComponentSettingsParams, callback?: DiscoveryV2.Callback<DiscoveryV2.ComponentSettingsResponse>): Promise<DiscoveryV2.Response<DiscoveryV2.ComponentSettingsResponse>> {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['projectId'];

    return new Promise((resolve, reject) => {
      const missingParams = getMissingParams(_params, requiredParams);
      if (missingParams) {
        if (_callback) {
          _callback(missingParams);
          return resolve();
        }
        return reject(missingParams);
      }

      const path = {
        'project_id': _params.projectId
      };

      const sdkHeaders = getSdkHeaders('discovery-data', 'v2', 'getComponentSettings');

      const parameters = {
        options: {
          url: '/v2/projects/{project_id}/component_settings',
          method: 'GET',
          path,
        },
        defaultOptions: extend(true, {}, this.baseOptions, {
          headers: extend(true, sdkHeaders, {
            'Accept': 'application/json',
          }, _params.headers),
        }),
      };

      return this.createRequest(parameters).then(
        res => {
          if (_callback) {
            _callback(null, res);
          }
          return resolve(res);
        },
        err => {
          if (_callback) {
            _callback(err)
            return resolve();
          }
          return reject(err);
        }
      );
    });
  };

}

DiscoveryV2.prototype.name = 'discovery-data';
DiscoveryV2.prototype.serviceVersion = 'v2';

/*************************
 * interfaces
 ************************/

namespace DiscoveryV2 {

  /** An operation response. **/
  export interface Response<T = any>  {
    result: T;
    status: number;
    statusText: string;
    headers: IncomingHttpHeaders;
  }

  /** The callback for a service request. */
  export type Callback<T> = (error: any, response?: Response<T>) => void;

  /** The body of a service request that returns no response data. */
  export interface Empty { }

  /** A standard JS object, defined to avoid the limitations of `Object` and `object` */
  export interface JsonObject {
    [key: string]: any;
  }

  /*************************
   * request interfaces
   ************************/

  /** Parameters for the `listCollections` operation. */
  export interface ListCollectionsParams {
    /** The ID of the project. */
    projectId: string;
    headers?: OutgoingHttpHeaders;
  }

  /** Parameters for the `query` operation. */
  export interface QueryParams {
    /** The ID of the project. */
    projectId: string;
    /** A comma-separated list of collection IDs to be queried against. */
    collectionIds?: string[];
    /** A cacheable query that excludes documents that don't mention the query content. Filter searches are better
     *  for metadata-type searches and for assessing the concepts in the data set.
     */
    filter?: string;
    /** A query search returns all documents in your data set with full enrichments and full text, but with the most
     *  relevant documents listed first. Use a query search when you want to find the most relevant search results.
     */
    query?: string;
    /** A natural language query that returns relevant documents by utilizing training data and natural language
     *  understanding.
     */
    naturalLanguageQuery?: string;
    /** An aggregation search that returns an exact answer by combining query search with filters. Useful for
     *  applications to build lists, tables, and time series. For a full list of possible aggregations, see the Query
     *  reference.
     */
    aggregation?: string;
    /** Number of results to return. */
    count?: number;
    /** A list of the fields in the document hierarchy to return. If this parameter not specified, then all
     *  top-level fields are returned.
     */
    returnFields?: string[];
    /** The number of query results to skip at the beginning. For example, if the total number of results that are
     *  returned is 10 and the offset is 8, it returns the last two results.
     */
    offset?: number;
    /** A comma-separated list of fields in the document to sort on. You can optionally specify a sort direction by
     *  prefixing the field with `-` for descending or `+` for ascending. Ascending is the default sort direction if no
     *  prefix is specified. This parameter cannot be used in the same query as the **bias** parameter.
     */
    sort?: string;
    /** When `true`, a highlight field is returned for each result which contains the fields which match the query
     *  with `<em></em>` tags around the matching query terms.
     */
    highlight?: boolean;
    /** When `true` and the **natural_language_query** parameter is used, the **natural_language_query** parameter
     *  is spell checked. The most likely correction is retunred in the **suggested_query** field of the response (if
     *  one exists).
     */
    spellingSuggestions?: boolean;
    /** Configuration for table retrieval. */
    tableResults?: QueryLargeTableResults;
    /** Configuration for suggested refinements. */
    suggestedRefinements?: QueryLargeSuggestedRefinements;
    /** Configuration for passage retrieval. */
    passages?: QueryLargePassages;
    headers?: OutgoingHttpHeaders;
  }

  /** Parameters for the `getAutocompletion` operation. */
  export interface GetAutocompletionParams {
    /** The ID of the project. */
    projectId: string;
    /** The ID of the collections. */
    collectionIds?: string[];
    /** The field in the result documents that autocompletion suggestions are identified from. */
    field?: string;
    /** The prefix to use for autocompletion. For example, the prefix `Ho` could autocomplete to `Hot`, `Housing`,
     *  or `How do I upgrade`. Possible completions are.
     */
    prefix?: string;
    /** The number of autocompletion suggestions to return. */
    count?: number;
    headers?: OutgoingHttpHeaders;
  }

  /** Parameters for the `getComponentSettings` operation. */
  export interface GetComponentSettingsParams {
    /** The ID of the project. */
    projectId: string;
    headers?: OutgoingHttpHeaders;
  }

  /*************************
   * model interfaces
   ************************/

  /** A collection for storing documents. */
  export interface Collection {
    /** The unique identifier of the collection. */
    collection_id?: string;
    /** The name of the collection. */
    name?: string;
  }

  /** An object containing an array of autocompletion suggestions. */
  export interface Completions {
    /** Array of autcomplete suggestion based on the provided prefix. */
    completions?: string[];
  }

  /** Display settings for aggregations. */
  export interface ComponentSettingsAggregation {
    /** Identifier used to map aggregation settings to aggregation configuration. */
    name?: string;
    /** User-friendly alias for the aggregation. */
    label?: string;
    /** Whether users is allowed to select more than one of the aggregation terms. */
    multiple_selections_allowed?: boolean;
    /** Type of visualization to use when rendering the aggregation. */
    visualization_type?: string;
  }

  /** Fields shown in the results section of the UI. */
  export interface ComponentSettingsFieldsShown {
    /** Body label. */
    body?: ComponentSettingsFieldsShownBody;
    /** Title label. */
    title?: ComponentSettingsFieldsShownTitle;
  }

  /** Body label. */
  export interface ComponentSettingsFieldsShownBody {
    /** Use the whole passage as the body. */
    use_passage?: boolean;
    /** Use a specific field as the title. */
    field?: string;
  }

  /** Title label. */
  export interface ComponentSettingsFieldsShownTitle {
    /** Use a specific field as the title. */
    field?: string;
  }

  /** A response containing the default component settings. */
  export interface ComponentSettingsResponse {
    /** Fields shown in the results section of the UI. */
    fields_shown?: ComponentSettingsFieldsShown;
    /** Whether or not autocomplete is enabled. */
    autocomplete?: boolean;
    /** Whether or not structured search is enabled. */
    structured_search?: boolean;
    /** Number or results shown per page. */
    results_per_page?: number;
    /** a list of component setting aggregations. */
    aggregations?: ComponentSettingsAggregation[];
  }

  /** List of document attributes. */
  export interface DocumentAttribute {
    /** The type of attribute. */
    type?: string;
    /** The text associated with the attribute. */
    text?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
  }

  /** Response object containing an array of collection details. */
  export interface ListCollectionsResponse {
    /** An array containing information about each collection in the project. */
    collections?: Collection[];
  }

  /** An abstract aggregation type produced by Discovery to analyze the input provided. */
  export interface QueryAggregation {
    /** The type of aggregation command used. Options include: term, histogram, timeslice, nested, filter, min, max,
     *  sum, average, unique_count, and top_hits.
     */
    type: string;
  }

  /** Histogram numeric interval result. */
  export interface QueryHistogramAggregationResult {
    /** The value of the upper bound for the numeric segment. */
    key: number;
    /** Number of documents with the specified key as the upper bound. */
    matching_results: number;
    /** An array of sub aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** Configuration for passage retrieval. */
  export interface QueryLargePassages {
    /** A passages query that returns the most relevant passages from the results. */
    enabled?: boolean;
    /** When `true`, passages will be returned whithin their respective result. */
    per_document?: boolean;
    /** Maximum number of passages to return per result. */
    max_passages_per_document?: number;
    /** A list of fields that passages are drawn from. If this parameter not specified, then all top-level fields
     *  are included.
     */
    fields?: string[];
    /** The maximum number of passages to return. The search returns fewer passages if the requested total is not
     *  found. The default is `10`. The maximum is `100`.
     */
    count?: number;
    /** The approximate number of characters that any one passage will have. */
    characters?: number;
  }

  /** Configuration for suggested refinements. */
  export interface QueryLargeSuggestedRefinements {
    /** Whether to perform suggested refinements. */
    enabled?: boolean;
    /** Maximum number of suggested refinements texts to be returned. The default is `10`. The maximum is `100`. */
    count?: number;
  }

  /** Configuration for table retrieval. */
  export interface QueryLargeTableResults {
    /** Whether to enable table retrieval. */
    enabled?: boolean;
    /** Maximum number of tables to return. */
    count?: number;
    /** Maximum number of tables to return per document. */
    per_document?: number;
  }

  /** A response containing the documents and aggregations for the query. */
  export interface QueryResponse {
    /** The number of matching results for the query. */
    matching_results?: number;
    /** Array of document results for the query. */
    results?: QueryResult[];
    /** Array of aggregations for the query. */
    aggregations?: QueryAggregation[];
    /** An object contain retrieval type information. */
    retrieval_details?: RetrievalDetails;
    /** Suggested correction to the submitted **natural_language_query** value. */
    suggested_query?: string;
    /** Array of suggested refinments. */
    suggested_refinements?: QuerySuggestedRefinement[];
    /** Array of table results. */
    table_results?: QueryTableResult[];
  }

  /** Result document for the specified query. */
  export interface QueryResult {
    /** The unique identifier of the document. */
    document_id?: string;
    /** Metadata of the document. */
    metadata?: JsonObject;
    /** Metadata of a query result. */
    result_metadata?: QueryResultMetadata;
    /** Passages returned by Discovery. */
    document_passages?: QueryResultPassage[];
    /** QueryResult accepts additional properties. */
    [propName: string]: any;
  }

  /** Metadata of a query result. */
  export interface QueryResultMetadata {
    /** Automatically extracted result title. */
    title?: string;
    /** The document retrieval source that produced this search result. */
    document_retrieval_source?: string;
    /** The collection id associated with this training data set. */
    collection_id?: string;
    /** The confidence score for the given result. Calculated based on how relevant the result is estimated to be.
     *  confidence can range from `0.0` to `1.0`. The higher the number, the more relevant the document. The
     *  `confidence` value for a result was calculated using the model specified in the `document_retrieval_strategy`
     *  field of the result set. This field is only returned if the **natural_language_query** parameter is specified in
     *  the query.
     */
    confidence?: number;
  }

  /** A passage query result. */
  export interface QueryResultPassage {
    /** The content of the extracted passage. */
    passage_text?: string;
    /** The position of the first character of the extracted passage in the originating field. */
    start_offset?: number;
    /** The position of the last character of the extracted passage in the originating field. */
    end_offset?: number;
    /** The label of the field from which the passage has been extracted. */
    field?: string;
  }

  /** A suggested additional query term or terms user to filter results. */
  export interface QuerySuggestedRefinement {
    /** The text used to filter. */
    text?: string;
  }

  /** A tables whose content or context match a search query. */
  export interface QueryTableResult {
    /** The identifier for the retrieved table. */
    table_id?: string;
    /** The identifier of the document the table was retrieved from. */
    source_document_id?: string;
    /** The identifier of the collection the table was retrieved from. */
    collection_id?: string;
    /** HTML snippet of the table info. */
    table_html?: string;
    /** The offset of the table html snippet in the original document html. */
    table_html_offset?: number;
    /** Full table object retrieved from Table Understanding Enrichment. */
    table?: TableResultTable;
  }

  /** Top value result for the term aggregation. */
  export interface QueryTermAggregationResult {
    /** Value of the field with a non-zero frequency in the document set. */
    key: string;
    /** Number of documents containing the 'key'. */
    matching_results: number;
    /** An array of sub aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** A timeslice interval segment. */
  export interface QueryTimesliceAggregationResult {
    /** String date value of the upper bound for the timeslice interval in ISO-8601 format. */
    key_as_string: string;
    /** Numeric date value of the upper bound for the timeslice interval in UNIX miliseconds since epoch. */
    key: number;
    /** Number of documents with the specified key as the upper bound. */
    matching_results: number;
    /** An array of sub aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** A query response containing the matching documents for the preceding aggregations. */
  export interface QueryTopHitsAggregationResult {
    /** Number of matching results. */
    matching_results: number;
    /** An array of the document results. */
    hits?: JsonObject[];
  }

  /** An object contain retrieval type information. */
  export interface RetrievalDetails {
    /** Indentifies the document retrieval strategy used for this query. `relevancy_training` indicates that the
     *  results were returned using a relevancy trained model.
     *
     *   **Note**: In the event of trained collections being queried, but the trained model is not used to return
     *  results, the **document_retrieval_strategy** will be listed as `untrained`.
     */
    document_retrieval_strategy?: string;
  }

  /** Cells that are not table header, column header, or row header cells. */
  export interface TableBodyCells {
    /** The unique ID of the cell in the current table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
    /** The textual contents of this cell from the input document without associated markup content. */
    text?: string;
    /** The `begin` index of this cell's `row` location in the current table. */
    row_index_begin?: number;
    /** The `end` index of this cell's `row` location in the current table. */
    row_index_end?: number;
    /** The `begin` index of this cell's `column` location in the current table. */
    column_index_begin?: number;
    /** The `end` index of this cell's `column` location in the current table. */
    column_index_end?: number;
    /** A list of table row header ids. */
    row_header_ids?: TableRowHeaderIds[];
    /** A list of table row header texts. */
    row_header_texts?: TableRowHeaderTexts[];
    /** A list of table row header texts normalized. */
    row_header_texts_normalized?: TableRowHeaderTextsNormalized[];
    /** A list of table column header ids. */
    column_header_ids?: TableColumnHeaderIds[];
    /** A list of table column header texts. */
    column_header_texts?: TableColumnHeaderTexts[];
    /** A list of table column header texts normalized. */
    column_header_texts_normalized?: TableColumnHeaderTextsNormalized[];
    /** A list of document attributes. */
    attributes?: DocumentAttribute[];
  }

  /** A key in a key-value pair. */
  export interface TableCellKey {
    /** The unique ID of the key in the table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
    /** The text content of the table cell without HTML markup. */
    text?: string;
  }

  /** A value in a key-value pair. */
  export interface TableCellValues {
    /** The unique ID of the value in the table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
    /** The text content of the table cell without HTML markup. */
    text?: string;
  }

  /** An array of values, each being the `id` value of a column header that is applicable to the current cell. */
  export interface TableColumnHeaderIds {
    /** The `id` value of a column header. */
    id?: string;
  }

  /** An array of values, each being the `text` value of a column header that is applicable to the current cell. */
  export interface TableColumnHeaderTexts {
    /** The `text` value of a column header. */
    text?: string;
  }

  /** If you provide customization input, the normalized version of the column header texts according to the customization; otherwise, the same value as `column_header_texts`. */
  export interface TableColumnHeaderTextsNormalized {
    /** The normalized version of a column header text. */
    text_normalized?: string;
  }

  /** Column-level cells, each applicable as a header to other cells in the same column as itself, of the current table. */
  export interface TableColumnHeaders {
    /** The unique ID of the cell in the current table. */
    cell_id?: string;
    /** The location of the column header cell in the current table as defined by its `begin` and `end` offsets,
     *  respectfully, in the input document.
     */
    location?: JsonObject;
    /** The textual contents of this cell from the input document without associated markup content. */
    text?: string;
    /** If you provide customization input, the normalized version of the cell text according to the customization;
     *  otherwise, the same value as `text`.
     */
    text_normalized?: string;
    /** The `begin` index of this cell's `row` location in the current table. */
    row_index_begin?: number;
    /** The `end` index of this cell's `row` location in the current table. */
    row_index_end?: number;
    /** The `begin` index of this cell's `column` location in the current table. */
    column_index_begin?: number;
    /** The `end` index of this cell's `column` location in the current table. */
    column_index_end?: number;
  }

  /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
  export interface TableElementLocation {
    /** The element's `begin` index. */
    begin: number;
    /** The element's `end` index. */
    end: number;
  }

  /** The contents of the current table's header. */
  export interface TableHeaders {
    /** The unique ID of the cell in the current table. */
    cell_id?: string;
    /** The location of the table header cell in the current table as defined by its `begin` and `end` offsets,
     *  respectfully, in the input document.
     */
    location?: JsonObject;
    /** The textual contents of the cell from the input document without associated markup content. */
    text?: string;
    /** The `begin` index of this cell's `row` location in the current table. */
    row_index_begin?: number;
    /** The `end` index of this cell's `row` location in the current table. */
    row_index_end?: number;
    /** The `begin` index of this cell's `column` location in the current table. */
    column_index_begin?: number;
    /** The `end` index of this cell's `column` location in the current table. */
    column_index_end?: number;
  }

  /** Key-value pairs detected across cell boundaries. */
  export interface TableKeyValuePairs {
    /** A key in a key-value pair. */
    key?: TableCellKey;
    /** A list of values in a key-value pair. */
    value?: TableCellValues[];
  }

  /** Full table object retrieved from Table Understanding Enrichment. */
  export interface TableResultTable {
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
    /** The textual contents of the current table from the input document without associated markup content. */
    text?: string;
    /** Text and associated location within a table. */
    section_title?: TableTextLocation;
    /** Text and associated location within a table. */
    title?: TableTextLocation;
    /** An array of table-level cells that apply as headers to all the other cells in the current table. */
    table_headers?: TableHeaders[];
    /** An array of row-level cells, each applicable as a header to other cells in the same row as itself, of the
     *  current table.
     */
    row_headers?: TableRowHeaders[];
    /** An array of column-level cells, each applicable as a header to other cells in the same column as itself, of
     *  the current table.
     */
    column_headers?: TableColumnHeaders[];
    /** An array of key-value pairs identified in the current table. */
    key_value_pairs?: TableKeyValuePairs[];
    /** An array of cells that are neither table header nor column header nor row header cells, of the current table
     *  with corresponding row and column header associations.
     */
    body_cells?: TableBodyCells[];
    /** An array of lists of textual entries across the document related to the current table being parsed. */
    contexts?: TableTextLocation[];
  }

  /** An array of values, each being the `id` value of a row header that is applicable to this body cell. */
  export interface TableRowHeaderIds {
    /** The `id` values of a row header. */
    id?: string;
  }

  /** An array of values, each being the `text` value of a row header that is applicable to this body cell. */
  export interface TableRowHeaderTexts {
    /** The `text` value of a row header. */
    text?: string;
  }

  /** If you provide customization input, the normalized version of the row header texts according to the customization; otherwise, the same value as `row_header_texts`. */
  export interface TableRowHeaderTextsNormalized {
    /** The normalized version of a row header text. */
    text_normalized?: string;
  }

  /** Row-level cells, each applicable as a header to other cells in the same row as itself, of the current table. */
  export interface TableRowHeaders {
    /** The unique ID of the cell in the current table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
    /** The textual contents of this cell from the input document without associated markup content. */
    text?: string;
    /** If you provide customization input, the normalized version of the cell text according to the customization;
     *  otherwise, the same value as `text`.
     */
    text_normalized?: string;
    /** The `begin` index of this cell's `row` location in the current table. */
    row_index_begin?: number;
    /** The `end` index of this cell's `row` location in the current table. */
    row_index_end?: number;
    /** The `begin` index of this cell's `column` location in the current table. */
    column_index_begin?: number;
    /** The `end` index of this cell's `column` location in the current table. */
    column_index_end?: number;
  }

  /** Text and associated location within a table. */
  export interface TableTextLocation {
    /** The text retrieved. */
    text?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled
     *  `begin` and `end`.
     */
    location?: TableElementLocation;
  }

  /** Returns a scalar calculation across all documents for the field specified. Possible calculations include min, max, sum, average, and unique_count. */
  export interface QueryCalculationAggregation extends QueryAggregation {
    /** The field to perform the calculation on. */
    field: string;
    /** The value of the calculation. */
    value: number;
  }

  /** A modifier that will narrow down the document set of the sub aggregations it precedes. */
  export interface QueryFilterAggregation extends QueryAggregation {
    /** The filter written in Discovery Query Language syntax applied to the documents before sub aggregations are
     *  run.
     */
    match: string;
    /** Number of documents matching the filter. */
    matching_results: number;
    /** An array of sub aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** Numeric interval segments to categorize documents by using field values from a single numeric field to describe the category. */
  export interface QueryHistogramAggregation extends QueryAggregation {
    /** The numeric field name used to create the histogram. */
    field: string;
    /** The size of the sections the results are split into. */
    interval: number;
    /** Array of numeric intervals. */
    results?: QueryHistogramAggregationResult[];
  }

  /** A restriction that alter the document set used for sub aggregations it precedes to nested documents found in the field specified. */
  export interface QueryNestedAggregation extends QueryAggregation {
    /** The path to the document field to scope sub aggregations to. */
    path: string;
    /** Number of nested documents found in the specified field. */
    matching_results: number;
    /** An array of sub aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** Returns the top values for the field specified. */
  export interface QueryTermAggregation extends QueryAggregation {
    /** The field in the document used to generate top values from. */
    field: string;
    /** The number of top values returned. */
    count?: number;
    /** Array of top values for the field. */
    results?: QueryTermAggregationResult[];
  }

  /** A specialized histogram aggregation that uses dates to create interval segments. */
  export interface QueryTimesliceAggregation extends QueryAggregation {
    /** The date field name used to create the timeslice. */
    field: string;
    /** The date interval value. Valid values are seconds, minutes, hours, days, weeks, and years. */
    interval: string;
    /** Array of aggregation results. */
    results?: QueryTimesliceAggregationResult[];
  }

  /** Returns the top documents ranked by the score of the query. */
  export interface QueryTopHitsAggregation extends QueryAggregation {
    /** The number of documents to return. */
    size: number;
    /** A query response containing the matching documents for the preceding aggregations. */
    hits?: QueryTopHitsAggregationResult;
  }

}

export = DiscoveryV2;
