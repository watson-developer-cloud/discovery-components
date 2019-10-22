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
import { BaseService, FileObject, getMissingParams } from 'ibm-cloud-sdk-core';
import { getSdkHeaders } from '../lib/common';

/**
 * IBM Watson&trade; Discovery for IBM Cloud Pak for Data is a cognitive search and content analytics engine that you can add to applications to identify patterns, trends and actionable insights to drive better decision-making. Securely unify structured and unstructured data with pre-enriched content, and use a simplified query language to eliminate the need for manual filtering of results.
 */

class DiscoveryV1 extends BaseService {

  static URL: string = 'https://{cluster_host}{:port}/discovery/api';
  name: string; // set by prototype to 'discovery-data'
  serviceVersion: string; // set by prototype to 'v1'

  /**
   * Construct a DiscoveryV1 object.
   *
   * @param {Object} options - Options for the service.
   * @param {string} options.version - The API version date to use with the service, in "YYYY-MM-DD" format. Whenever the API is changed in a backwards incompatible way, a new minor version of the API is released. The service uses the API version for the date you specify, or the most recent version before that date. Note that you should not programmatically specify the current date at runtime, in case the API has been updated since your application's release. Instead, specify a version date that is compatible with your application, and don't change it until your application is ready for a later version.
   * @param {string} [options.url] - The base url to use when contacting the service (e.g. 'https://gateway.watsonplatform.net/discovery/api'). The base url may differ between IBM Cloud regions.
   * @param {string} [options.username] - The username used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of IBM Cloud. When running on IBM Cloud, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
   * @param {string} [options.password] - The password used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of IBM Cloud. When running on IBM Cloud, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
   * @param {string} [options.iam_access_token] - An IAM access token fully managed by the application. Responsibility falls on the application to refresh the token, either before it expires or reactively upon receiving a 401 from the service, as any requests made with an expired token will fail.
   * @param {string} [options.iam_apikey] - An API key that can be used to request IAM tokens. If this API key is provided, the SDK will manage the token and handle the refreshing.
   * @param {string} [options.iam_url] - An optional URL for the IAM service API. Defaults to 'https://iam.cloud.ibm.com/identity/token'.
   * @param {string} [options.iam_client_id] - client id (username) for request to iam service
   * @param {string} [options.iam_client_secret] - client secret (password) for request to iam service
   * @param {string} [options.icp4d_access_token] - icp for data access token provided and managed by user
   * @param {string} [options.icp4d_url] - icp for data base url - used for authentication
   * @param {string} [options.authentication_type] - authentication pattern to be used. can be iam, basic, or icp4d
   * @param {boolean} [options.use_unauthenticated] - Set to `true` to avoid including an authorization header. This
   * option may be useful for requests that are proxied.
   * @param {OutgoingHttpHeaders} [options.headers] - Default headers that shall be included with every request to the service.
   * @param {boolean} [options.headers.X-Watson-Learning-Opt-Out] - Set to `true` to opt-out of data collection. By
   * default, all IBM Watson services log requests and their results. Logging is done only to improve the services for
   * future users. The logged data is not shared or made public. If you are concerned with protecting the privacy of
   * users' personal information or otherwise do not want your requests to be logged, you can opt out of logging.
   * @constructor
   * @returns {DiscoveryV1}
   * @throws {Error}
   */
  constructor(options: DiscoveryV1.Options) {
    super(options);
    // check if 'version' was provided
    if (typeof this._options.version === 'undefined') {
      throw new Error('Argument error: version was not specified');
    }
    this._options.qs.version = options.version;
  }

  /*************************
   * documents
   ************************/

  /**
   * Add a document.
   *
   * Add a document to a collection with optional metadata.
   *
   *   * The **version** query parameter is still required.
   *
   *   * Returns immediately after the system has accepted the document for processing.
   *
   *   * The user must provide document content, metadata, or both. If the request is missing both document content and
   * metadata, it is rejected.
   *
   *   * The user can set the **Content-Type** parameter on the **file** part to indicate the media type of the
   * document. If the **Content-Type** parameter is missing or is one of the generic media types (for example,
   * `application/octet-stream`), then the service attempts to automatically detect the document's media type.
   *
   *   * The following field names are reserved and will be filtered out if present after normalization: `id`, `score`,
   * `highlight`, and any field with the prefix of: `_`, `+`, or `-`
   *
   *   * Fields with empty name values after normalization are filtered out before indexing.
   *
   *   * Fields containing the following characters after normalization are filtered out before indexing: `#` and `,`
   *
   *  **Note:** Documents can be added with a specific **document_id** by using the
   * **_/v1/environments/{environment_id}/collections/{collection_id}/documents** method.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {NodeJS.ReadableStream|FileObject|Buffer} [params.file] - The content of the document to ingest. The maximum
   * supported file size when adding a file to a collection is 50 megabytes, the maximum supported file size when
   * testing a confiruration is 1 megabyte. Files larger than the supported size are rejected.
   * @param {string} [params.filename] - The filename for file.
   * @param {string} [params.file_content_type] - The content type of file.
   * @param {string} [params.metadata] - The maximum supported metadata file size is 1 MB. Metadata parts larger than 1
   * MB are rejected.
   * Example:  ``` {
   *   "Creator": "Johnny Appleseed",
   *   "Subject": "Apples"
   * } ```.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public addDocument(params: DiscoveryV1.AddDocumentParams, callback?: DiscoveryV1.Callback<DiscoveryV1.DocumentAccepted>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.addDocument(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }
    const formData = {
      'file': {
        data: _params.file,
        filename: _params.filename,
        contentType: _params.file_content_type
      },
      'metadata': _params.metadata
    };

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'addDocument');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/documents',
        method: 'POST',
        path,
        formData
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Update a document.
   *
   * Replace an existing document or add a document with a specified **document_id**. Starts ingesting a document with
   * optional metadata.
   *
   * **Note:** When uploading a new document with this method it automatically replaces any document stored with the
   * same **document_id** if it exists.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.document_id - The ID of the document.
   * @param {NodeJS.ReadableStream|FileObject|Buffer} [params.file] - The content of the document to ingest. The maximum
   * supported file size when adding a file to a collection is 50 megabytes, the maximum supported file size when
   * testing a confiruration is 1 megabyte. Files larger than the supported size are rejected.
   * @param {string} [params.filename] - The filename for file.
   * @param {string} [params.file_content_type] - The content type of file.
   * @param {string} [params.metadata] - The maximum supported metadata file size is 1 MB. Metadata parts larger than 1
   * MB are rejected.
   * Example:  ``` {
   *   "Creator": "Johnny Appleseed",
   *   "Subject": "Apples"
   * } ```.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public updateDocument(params: DiscoveryV1.UpdateDocumentParams, callback?: DiscoveryV1.Callback<DiscoveryV1.DocumentAccepted>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'document_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.updateDocument(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }
    const formData = {
      'file': {
        data: _params.file,
        filename: _params.filename,
        contentType: _params.file_content_type
      },
      'metadata': _params.metadata
    };

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'document_id': _params.document_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'updateDocument');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/documents/{document_id}',
        method: 'POST',
        path,
        formData
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Delete a document.
   *
   * Deletes a document from the specified collection. Only documents that were added by using the **Add a document**
   * method, **Update a document** method, or uploaded indiviually using the tooling can be deleted using this method.
   * Documents added using a source crawl cannot be deleted using this method. If the given document ID is invalid, or
   * if the document is not found, then the a success response is returned (HTTP status code `200`) with the status set
   * to 'deleted'.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.document_id - The ID of the document.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public deleteDocument(params: DiscoveryV1.DeleteDocumentParams, callback?: DiscoveryV1.Callback<DiscoveryV1.DeleteDocumentResponse>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'document_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.deleteDocument(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'document_id': _params.document_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'deleteDocument');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/documents/{document_id}',
        method: 'DELETE',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /*************************
   * queries
   ************************/

  /**
   * Query a collection (GET).
   *
   * After your content is uploaded and enriched by Discovery, you can build queries to search your content. For
   * details, see the [Query
   * documentation](https://cloud.ibm.com/docs/services/discovery-data?topic=discovery-data-query-concepts).
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.project_id - The ID of the project.
   * @param {string[]} [params.collection_ids] - The ID of the collections.
   * @param {string} [params.filter] - A cacheable query that excludes documents that don't mention the query content.
   * Filter searches are better for metadata-type searches and for assessing the concepts in the data set.
   * @param {string} [params.query] - A query search returns all documents in your data set with full enrichments and
   * full text, but with the most relevant documents listed first.
   * @param {string} [params.natural_language_query] - A natural language query that returns relevant documents by
   * utilizing training data and natural language understanding.
   * @param {string} [params.aggregation] - An aggregation search that returns an exact answer by combining query search
   * with filters. Useful for applications to build lists, tables, and time series. For a full list of possible
   * aggregations, see the Query reference.
   * @param {number} [params.count] - Number of results to return. The maximum for the **count** and **offset** values
   * together in any one query is **10000**.
   * @param {string[]} [params.return_fields] - A comma-separated list of the portion of the document hierarchy to
   * return.
   * @param {number} [params.offset] - The number of query results to skip at the beginning. For example, if the total
   * number of results that are returned is 10 and the offset is 8, it returns the last two results. The maximum for the
   * **count** and **offset** values together in any one query is **10000**.
   * @param {string[]} [params.sort] - A comma-separated list of fields in the document to sort on. You can optionally
   * specify a sort direction by prefixing the field with `-` for descending or `+` for ascending. Ascending is the
   * default sort direction if no prefix is specified.
   * @param {boolean} [params.highlight] - When true, a highlight field is returned for each result which contains the
   * fields which match the query with `<em></em>` tags around the matching query terms.
   * @param {boolean} [params.spelling_suggestions] - When `true` and the **natural_language_query** parameter is used,
   * the **natural_language_query** parameter is spell checked. The most likely correction is returned in the
   * **suggested_query** field of the response (if one exists).
   * @param {boolean} [params.table_results_enabled] - Whether to enable table retrieval.
   * @param {number} [params.table_results_count] - Number of tables to return.
   * @param {boolean} [params.suggested_refinements_enabled] - Whether to perform suggested refinements.
   * @param {number} [params.suggested_refinements_count] - Maximum number of suggested refinements texts to be
   * returned. The default is `10`. The maximum is `100`.
   * @param {boolean} [params.passages] - A passages query that returns the most relevant passages from the results.
   * @param {boolean} [params.passages_per_document] - When `true`, passages will be returned whithin their respective
   * result.
   * @param {number} [params.passages_max_passages_per_document] - Maximum number of passages to return per result.
   * @param {string[]} [params.passages_fields] - A comma-separated list of fields that passages are drawn from. If this
   * parameter not specified, then all top-level fields are included.
   * @param {number} [params.passages_count] - The maximum number of passages to return. The search returns fewer
   * passages if the requested total is not found.
   * @param {number} [params.passages_characters] - The approximate number of characters that any one passage will have.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public queryUsingGet(params: DiscoveryV1.QueryUsingGetParams, callback?: DiscoveryV1.Callback<DiscoveryV1.QueryResponse>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['project_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.queryUsingGet(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const query = {
      'collection_ids': _params.collection_ids,
      'filter': _params.filter,
      'query': _params.query,
      'natural_language_query': _params.natural_language_query,
      'aggregation': _params.aggregation,
      'count': _params.count,
      'return': _params.return_fields,
      'offset': _params.offset,
      'sort': _params.sort,
      'highlight': _params.highlight,
      'spelling_suggestions': _params.spelling_suggestions,
      'table_results.enabled': _params.table_results_enabled,
      'table_results.count': _params.table_results_count,
      'suggested_refinements.enabled': _params.suggested_refinements_enabled,
      'suggested_refinements.count': _params.suggested_refinements_count,
      'passages': _params.passages,
      'passages.per_document': _params.passages_per_document,
      'passages.max_passages_per_document': _params.passages_max_passages_per_document,
      'passages.fields': _params.passages_fields,
      'passages.count': _params.passages_count,
      'passages.characters': _params.passages_characters
    };

    const path = {
      'project_id': _params.project_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'queryUsingGet');

    const parameters = {
      options: {
        url: '/v2/projects/{project_id}/query',
        method: 'GET',
        qs: query,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Query a project.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.project_id - The ID of the project.
   * @param {string[]} [params.collection_ids] - A comma-separated list of collection IDs to be queried against.
   * @param {string} [params.filter] - A cacheable query that excludes documents that don't mention the query content.
   * Filter searches are better for metadata-type searches and for assessing the concepts in the data set.
   * @param {string} [params.query] - A query search returns all documents in your data set with full enrichments and
   * full text, but with the most relevant documents listed first. Use a query search when you want to find the most
   * relevant search results.
   * @param {string} [params.natural_language_query] - A natural language query that returns relevant documents by
   * utilizing training data and natural language understanding.
   * @param {string} [params.aggregation] - An aggregation search that returns an exact answer by combining query search
   * with filters. Useful for applications to build lists, tables, and time series. For a full list of possible
   * aggregations, see the Query reference.
   * @param {number} [params.count] - Number of results to return.
   * @param {string} [params.return_fields] - A comma-separated list of the portion of the document hierarchy to return.
   * @param {number} [params.offset] - The number of query results to skip at the beginning. For example, if the total
   * number of results that are returned is 10 and the offset is 8, it returns the last two results.
   * @param {string} [params.sort] - A comma-separated list of fields in the document to sort on. You can optionally
   * specify a sort direction by prefixing the field with `-` for descending or `+` for ascending. Ascending is the
   * default sort direction if no prefix is specified. This parameter cannot be used in the same query as the **bias**
   * parameter.
   * @param {boolean} [params.highlight] - When `true`, a highlight field is returned for each result which contains the
   * fields which match the query with `<em></em>` tags around the matching query terms.
   * @param {boolean} [params.spelling_suggestions] - When `true` and the **natural_language_query** parameter is used,
   * the **natural_language_query** parameter is spell checked. The most likely correction is retunred in the
   * **suggested_query** field of the response (if one exists).
   * @param {QueryLargeTableResults} [params.table_results] - Configuration for table retrieval.
   * @param {QueryLargeSuggestedRefinements} [params.suggested_refinements] - Configuration for suggested refinements.
   * @param {QueryLargePassages} [params.passages] - Configuration for passage retrieval.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public query(params: DiscoveryV1.QueryParams, callback?: DiscoveryV1.Callback<DiscoveryV1.QueryResponse>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['project_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.query(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const body = {
      'collection_ids': _params.collection_ids,
      'filter': _params.filter,
      'query': _params.query,
      'natural_language_query': _params.natural_language_query,
      'aggregation': _params.aggregation,
      'count': _params.count,
      'return': _params.return_fields,
      'offset': _params.offset,
      'sort': _params.sort,
      'highlight': _params.highlight,
      'spelling_suggestions': _params.spelling_suggestions,
      'table_results': _params.table_results,
      'suggested_refinements': _params.suggested_refinements,
      'passages': _params.passages
    };

    const path = {
      'project_id': _params.project_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'query');

    const parameters = {
      options: {
        url: '/v2/projects/{project_id}/query',
        method: 'POST',
        body,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Get Autocomplete Suggestions.
   *
   * Returns completion query suggestions for the specified prefix.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.project_id - The ID of the project.
   * @param {string[]} [params.collection_ids] - The ID of the collections.
   * @param {string} [params.field] - The field in the result documents that autocompletion suggestions are identified
   * from.
   * @param {string} [params.prefix] - The prefix to use for autocompletion. For example, the prefix `Ho` could
   * autocomplete to `Hot`, `Housing`, or `How do I upgrade`. Possible completions are.
   * @param {number} [params.count] - The number of autocompletion suggestions to return.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public getAutocompletion(params: DiscoveryV1.GetAutocompletionParams, callback?: DiscoveryV1.Callback<DiscoveryV1.Completions>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['project_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.getAutocompletion(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const query = {
      'collection_ids': _params.collection_ids,
      'field': _params.field,
      'prefix': _params.prefix,
      'count': _params.count
    };

    const path = {
      'project_id': _params.project_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'getAutocompletion');

    const parameters = {
      options: {
        url: '/v2/projects/{project_id}/autocompletion',
        method: 'GET',
        qs: query,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /*************************
   * trainingData
   ************************/

  /**
   * List training data.
   *
   * Lists the training data for the specified collection.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public listTrainingData(params: DiscoveryV1.ListTrainingDataParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingDataSet>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.listTrainingData(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'listTrainingData');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Add query to training data.
   *
   * Adds a query to the training data for this collection. The query can contain a filter and natural language query.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} [params.natural_language_query] - The natural text query for the new training query.
   * @param {string} [params.filter] - The filter used on the collection before the **natural_language_query** is
   * applied.
   * @param {TrainingExample[]} [params.examples] - Array of training examples.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public addTrainingData(params: DiscoveryV1.AddTrainingDataParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingQuery>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.addTrainingData(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const body = {
      'natural_language_query': _params.natural_language_query,
      'filter': _params.filter,
      'examples': _params.examples
    };

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'addTrainingData');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data',
        method: 'POST',
        body,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Delete all training data.
   *
   * Deletes all training data from a collection.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public deleteAllTrainingData(params: DiscoveryV1.DeleteAllTrainingDataParams, callback?: DiscoveryV1.Callback<DiscoveryV1.Empty>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.deleteAllTrainingData(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'deleteAllTrainingData');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data',
        method: 'DELETE',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Get details about a query.
   *
   * Gets details for a specific training data query, including the query string and all examples.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public getTrainingData(params: DiscoveryV1.GetTrainingDataParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingQuery>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.getTrainingData(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'getTrainingData');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Delete a training data query.
   *
   * Removes the training data query and all associated examples from the training data set.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public deleteTrainingData(params: DiscoveryV1.DeleteTrainingDataParams, callback?: DiscoveryV1.Callback<DiscoveryV1.Empty>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.deleteTrainingData(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'deleteTrainingData');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}',
        method: 'DELETE',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * List examples for a training data query.
   *
   * List all examples for this training data query.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public listTrainingExamples(params: DiscoveryV1.ListTrainingExamplesParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingExampleList>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.listTrainingExamples(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'listTrainingExamples');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}/examples',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Add example to training data query.
   *
   * Adds a example to this training data query.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {string} [params.document_id] - The document ID associated with this training example.
   * @param {string} [params.cross_reference] - The cross reference associated with this training example.
   * @param {number} [params.relevance] - The relevance of the training example.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public createTrainingExample(params: DiscoveryV1.CreateTrainingExampleParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingExample>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.createTrainingExample(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const body = {
      'document_id': _params.document_id,
      'cross_reference': _params.cross_reference,
      'relevance': _params.relevance
    };

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'createTrainingExample');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}/examples',
        method: 'POST',
        body,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Delete example for training data query.
   *
   * Deletes the example document with the given ID from the training data query.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {string} params.example_id - The ID of the document as it is indexed.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public deleteTrainingExample(params: DiscoveryV1.DeleteTrainingExampleParams, callback?: DiscoveryV1.Callback<DiscoveryV1.Empty>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id', 'example_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.deleteTrainingExample(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id,
      'example_id': _params.example_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'deleteTrainingExample');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}/examples/{example_id}',
        method: 'DELETE',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Change label or cross reference for example.
   *
   * Changes the label or cross reference query for this training data example.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {string} params.example_id - The ID of the document as it is indexed.
   * @param {string} [params.cross_reference] - The example to add.
   * @param {number} [params.relevance] - The relevance value for this example.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public updateTrainingExample(params: DiscoveryV1.UpdateTrainingExampleParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingExample>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id', 'example_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.updateTrainingExample(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const body = {
      'cross_reference': _params.cross_reference,
      'relevance': _params.relevance
    };

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id,
      'example_id': _params.example_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'updateTrainingExample');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}/examples/{example_id}',
        method: 'PUT',
        body,
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Get details for training data example.
   *
   * Gets the details for this training example.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.environment_id - The ID of the environment. The value of this parameter must always be
   * `default`.
   * @param {string} params.collection_id - The ID of the collection.
   * @param {string} params.query_id - The ID of the query used for training.
   * @param {string} params.example_id - The ID of the document as it is indexed.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public getTrainingExample(params: DiscoveryV1.GetTrainingExampleParams, callback?: DiscoveryV1.Callback<DiscoveryV1.TrainingExample>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['environment_id', 'collection_id', 'query_id', 'example_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.getTrainingExample(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'environment_id': _params.environment_id,
      'collection_id': _params.collection_id,
      'query_id': _params.query_id,
      'example_id': _params.example_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'getTrainingExample');

    const parameters = {
      options: {
        url: '/v1/environments/{environment_id}/collections/{collection_id}/training_data/{query_id}/examples/{example_id}',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /*************************
   * collections
   ************************/

  /**
   * List collections.
   *
   * Lists existing collections for the project instance.
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {string} params.project_id - The ID of the project.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public listCollections(params: DiscoveryV1.ListCollectionsParams, callback?: DiscoveryV1.Callback<DiscoveryV1.ListCollectionsResponse>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['project_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.listCollections(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'project_id': _params.project_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'listCollections');

    const parameters = {
      options: {
        url: '/v2/projects/{project_id}/collections',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
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
   * @param {string} params.project_id - The ID of the project.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public getComponentSettings(params: DiscoveryV1.GetComponentSettingsParams, callback?: DiscoveryV1.Callback<DiscoveryV1.ComponentSettingsResponse>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['project_id'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.getComponentSettings(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const path = {
      'project_id': _params.project_id
    };

    const sdkHeaders = getSdkHeaders('discovery-data', 'v1', 'getComponentSettings');

    const parameters = {
      options: {
        url: '/v2/projects/{project_id}/component_settings',
        method: 'GET',
        path,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

}

DiscoveryV1.prototype.name = 'discovery-data';
DiscoveryV1.prototype.serviceVersion = 'v1';

/*************************
 * interfaces
 ************************/

namespace DiscoveryV1 {

  /** Options for the `DiscoveryV1` constructor. */
  export type Options = {
    version: string;
    url?: string;
    iam_access_token?: string;
    iam_apikey?: string;
    iam_url?: string;
    iam_client_id?: string;
    iam_client_secret?: string;
    icp4d_access_token?: string;
    icp4d_url?: string;
    username?: string;
    password?: string;
    token?: string;
    authentication_type?: string;
    disable_ssl_verification?: boolean;
    use_unauthenticated?: boolean;
    headers?: OutgoingHttpHeaders;
    /** Allow additional request config parameters */
    [propName: string]: any;
  }

  export interface Response<T = any>  {
    result: T;
    data: T; // for compatibility
    status: number;
    statusText: string;
    headers: IncomingHttpHeaders;
  }

  /** The callback for a service request. */
  export type Callback<T> = (error: any, body?: T, response?: Response<T>) => void;

  /** The body of a service request that returns no response data. */
  export interface Empty { }

  /** A standard JS object, defined to avoid the limitations of `Object` and `object` */
  export interface JsonObject {
    [key: string]: any;
  }

  /*************************
   * request interfaces
   ************************/

  /** Parameters for the `addDocument` operation. */
  export interface AddDocumentParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The content of the document to ingest. The maximum supported file size when adding a file to a collection is 50 megabytes, the maximum supported file size when testing a confiruration is 1 megabyte. Files larger than the supported size are rejected. */
    file?: NodeJS.ReadableStream|FileObject|Buffer;
    /** The filename for file. */
    filename?: string;
    /** The content type of file. */
    file_content_type?: AddDocumentConstants.FileContentType | string;
    /** The maximum supported metadata file size is 1 MB. Metadata parts larger than 1 MB are rejected. Example:  ``` { "Creator": "Johnny Appleseed", "Subject": "Apples" } ```. */
    metadata?: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Constants for the `addDocument` operation. */
  export namespace AddDocumentConstants {
    /** The content type of file. */
    export enum FileContentType {
      APPLICATION_JSON = 'application/json',
      APPLICATION_MSWORD = 'application/msword',
      APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      APPLICATION_PDF = 'application/pdf',
      TEXT_HTML = 'text/html',
      APPLICATION_XHTML_XML = 'application/xhtml+xml',
    }
  }

  /** Parameters for the `updateDocument` operation. */
  export interface UpdateDocumentParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the document. */
    document_id: string;
    /** The content of the document to ingest. The maximum supported file size when adding a file to a collection is 50 megabytes, the maximum supported file size when testing a confiruration is 1 megabyte. Files larger than the supported size are rejected. */
    file?: NodeJS.ReadableStream|FileObject|Buffer;
    /** The filename for file. */
    filename?: string;
    /** The content type of file. */
    file_content_type?: UpdateDocumentConstants.FileContentType | string;
    /** The maximum supported metadata file size is 1 MB. Metadata parts larger than 1 MB are rejected. Example:  ``` { "Creator": "Johnny Appleseed", "Subject": "Apples" } ```. */
    metadata?: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Constants for the `updateDocument` operation. */
  export namespace UpdateDocumentConstants {
    /** The content type of file. */
    export enum FileContentType {
      APPLICATION_JSON = 'application/json',
      APPLICATION_MSWORD = 'application/msword',
      APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      APPLICATION_PDF = 'application/pdf',
      TEXT_HTML = 'text/html',
      APPLICATION_XHTML_XML = 'application/xhtml+xml',
    }
  }

  /** Parameters for the `deleteDocument` operation. */
  export interface DeleteDocumentParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the document. */
    document_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `queryUsingGet` operation. */
  export interface QueryUsingGetParams {
    /** The ID of the project. */
    project_id: string;
    /** The ID of the collections. */
    collection_ids?: string[];
    /** A cacheable query that excludes documents that don't mention the query content. Filter searches are better for metadata-type searches and for assessing the concepts in the data set. */
    filter?: string;
    /** A query search returns all documents in your data set with full enrichments and full text, but with the most relevant documents listed first. */
    query?: string;
    /** A natural language query that returns relevant documents by utilizing training data and natural language understanding. */
    natural_language_query?: string;
    /** An aggregation search that returns an exact answer by combining query search with filters. Useful for applications to build lists, tables, and time series. For a full list of possible aggregations, see the Query reference. */
    aggregation?: string;
    /** Number of results to return. The maximum for the **count** and **offset** values together in any one query is **10000**. */
    count?: number;
    /** A comma-separated list of the portion of the document hierarchy to return. */
    return_fields?: string[];
    /** The number of query results to skip at the beginning. For example, if the total number of results that are returned is 10 and the offset is 8, it returns the last two results. The maximum for the **count** and **offset** values together in any one query is **10000**. */
    offset?: number;
    /** A comma-separated list of fields in the document to sort on. You can optionally specify a sort direction by prefixing the field with `-` for descending or `+` for ascending. Ascending is the default sort direction if no prefix is specified. */
    sort?: string[];
    /** When true, a highlight field is returned for each result which contains the fields which match the query with `<em></em>` tags around the matching query terms. */
    highlight?: boolean;
    /** When `true` and the **natural_language_query** parameter is used, the **natural_language_query** parameter is spell checked. The most likely correction is returned in the **suggested_query** field of the response (if one exists). */
    spelling_suggestions?: boolean;
    /** Whether to enable table retrieval. */
    table_results_enabled?: boolean;
    /** Number of tables to return. */
    table_results_count?: number;
    /** Whether to perform suggested refinements. */
    suggested_refinements_enabled?: boolean;
    /** Maximum number of suggested refinements texts to be returned. The default is `10`. The maximum is `100`. */
    suggested_refinements_count?: number;
    /** A passages query that returns the most relevant passages from the results. */
    passages?: boolean;
    /** When `true`, passages will be returned whithin their respective result. */
    passages_per_document?: boolean;
    /** Maximum number of passages to return per result. */
    passages_max_passages_per_document?: number;
    /** A comma-separated list of fields that passages are drawn from. If this parameter not specified, then all top-level fields are included. */
    passages_fields?: string[];
    /** The maximum number of passages to return. The search returns fewer passages if the requested total is not found. */
    passages_count?: number;
    /** The approximate number of characters that any one passage will have. */
    passages_characters?: number;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `query` operation. */
  export interface QueryParams {
    /** The ID of the project. */
    project_id: string;
    /** A comma-separated list of collection IDs to be queried against. */
    collection_ids?: string[];
    /** A cacheable query that excludes documents that don't mention the query content. Filter searches are better for metadata-type searches and for assessing the concepts in the data set. */
    filter?: string;
    /** A query search returns all documents in your data set with full enrichments and full text, but with the most relevant documents listed first. Use a query search when you want to find the most relevant search results. */
    query?: string;
    /** A natural language query that returns relevant documents by utilizing training data and natural language understanding. */
    natural_language_query?: string;
    /** An aggregation search that returns an exact answer by combining query search with filters. Useful for applications to build lists, tables, and time series. For a full list of possible aggregations, see the Query reference. */
    aggregation?: string;
    /** Number of results to return. */
    count?: number;
    /** A comma-separated list of the portion of the document hierarchy to return. */
    return_fields?: string;
    /** The number of query results to skip at the beginning. For example, if the total number of results that are returned is 10 and the offset is 8, it returns the last two results. */
    offset?: number;
    /** A comma-separated list of fields in the document to sort on. You can optionally specify a sort direction by prefixing the field with `-` for descending or `+` for ascending. Ascending is the default sort direction if no prefix is specified. This parameter cannot be used in the same query as the **bias** parameter. */
    sort?: string;
    /** When `true`, a highlight field is returned for each result which contains the fields which match the query with `<em></em>` tags around the matching query terms. */
    highlight?: boolean;
    /** When `true` and the **natural_language_query** parameter is used, the **natural_language_query** parameter is spell checked. The most likely correction is retunred in the **suggested_query** field of the response (if one exists). */
    spelling_suggestions?: boolean;
    /** Configuration for table retrieval. */
    table_results?: QueryLargeTableResults;
    /** Configuration for suggested refinements. */
    suggested_refinements?: QueryLargeSuggestedRefinements;
    /** Configuration for passage retrieval. */
    passages?: QueryLargePassages;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `getAutocompletion` operation. */
  export interface GetAutocompletionParams {
    /** The ID of the project. */
    project_id: string;
    /** The ID of the collections. */
    collection_ids?: string[];
    /** The field in the result documents that autocompletion suggestions are identified from. */
    field?: string;
    /** The prefix to use for autocompletion. For example, the prefix `Ho` could autocomplete to `Hot`, `Housing`, or `How do I upgrade`. Possible completions are. */
    prefix?: string;
    /** The number of autocompletion suggestions to return. */
    count?: number;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `listTrainingData` operation. */
  export interface ListTrainingDataParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `addTrainingData` operation. */
  export interface AddTrainingDataParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The natural text query for the new training query. */
    natural_language_query?: string;
    /** The filter used on the collection before the **natural_language_query** is applied. */
    filter?: string;
    /** Array of training examples. */
    examples?: TrainingExample[];
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `deleteAllTrainingData` operation. */
  export interface DeleteAllTrainingDataParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `getTrainingData` operation. */
  export interface GetTrainingDataParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `deleteTrainingData` operation. */
  export interface DeleteTrainingDataParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `listTrainingExamples` operation. */
  export interface ListTrainingExamplesParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `createTrainingExample` operation. */
  export interface CreateTrainingExampleParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    /** The document ID associated with this training example. */
    document_id?: string;
    /** The cross reference associated with this training example. */
    cross_reference?: string;
    /** The relevance of the training example. */
    relevance?: number;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `deleteTrainingExample` operation. */
  export interface DeleteTrainingExampleParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    /** The ID of the document as it is indexed. */
    example_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `updateTrainingExample` operation. */
  export interface UpdateTrainingExampleParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    /** The ID of the document as it is indexed. */
    example_id: string;
    /** The example to add. */
    cross_reference?: string;
    /** The relevance value for this example. */
    relevance?: number;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `getTrainingExample` operation. */
  export interface GetTrainingExampleParams {
    /** The ID of the environment. The value of this parameter must always be `default`. */
    environment_id: string;
    /** The ID of the collection. */
    collection_id: string;
    /** The ID of the query used for training. */
    query_id: string;
    /** The ID of the document as it is indexed. */
    example_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `listCollections` operation. */
  export interface ListCollectionsParams {
    /** The ID of the project. */
    project_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Parameters for the `getComponentSettings` operation. */
  export interface GetComponentSettingsParams {
    /** The ID of the project. */
    project_id: string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /*************************
   * model interfaces
   ************************/

  /** Object containing results of the aggregation query. */
  export interface AggregationResult {
    /** Key that matched the aggregation type. */
    key?: string;
    /** Number of matching results. */
    matching_results?: number;
    /** Aggregations returned in the case of chained aggregations. */
    aggregations?: QueryAggregation[];
  }

  /** A collection for storing documents. */
  export interface Collection {
    /** The unique identifier of the collection. */
    collection_id?: string;
    /** The unique identifier of the project. */
    project_id?: string;
    /** The creation date of the collection in the format yyyy-MM-dd'T'HH:mmcon:ss.SSS'Z'. */
    created?: string;
    /** The timestamp of when the collection was last updated in the format yyyy-MM-dd'T'HH:mm:ss.SSS'Z'. */
    updated?: string;
    /** The name of the collection. */
    name?: string;
    /** The description of the collection. */
    description?: string;
    /** The language of the documents stored in the collection. Permitted values include `en` (English), `de` (German), and `es` (Spanish). */
    language?: string;
    document_counts?: DocumentCounts;
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
    aggregations?: ComponentSettingsAggregation[];
  }

  /** Information about the deleted document. */
  export interface DeleteDocumentResponse {
    /** The unique identifier of the document. */
    document_id?: string;
    /** Status of the document. A deleted document has the status deleted. */
    status?: string;
  }

  /** Information about the document that was uploaded to the collection. */
  export interface DocumentAccepted {
    /** The unique identifier of the ingested document. */
    document_id?: string;
    /** Status of the document in the ingestion process. A status of `processing` is returned for documents that are ingested with a *version* date before `2019-01-01`. The `pending` status is returned for all others. */
    status?: string;
    /** Array of notices produced by the document-ingestion process. */
    notices?: Notice[];
  }

  /** List of document attributes. */
  export interface DocumentAttribute {
    /** The type of attribute. */
    type?: string;
    /** The text associated with the attribute. */
    text?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
    location?: TableElementLocation;
  }

  /** DocumentCounts. */
  export interface DocumentCounts {
    /** The total number of available documents in the collection. */
    available?: number;
    /** The number of documents being indexed. */
    indexing?: number;
    /** The number of documents being converted. */
    converting?: number;
    /** The number of converted documents in the dataset. */
    converted?: number;
    /** The number of uploaded documents in the document store. */
    uploaded?: number;
    /** The number of documents that failed indexing. */
    indexing_failures?: number;
    /** The number of documents that failed conversion. */
    conversion_failures?: number;
  }

  /** ListCollectionsResponse. */
  export interface ListCollectionsResponse {
    /** An array containing information about each collection in the project. */
    collections?: Collection[];
  }

  /** A notice produced for the collection. */
  export interface Notice {
    /** Identifies the notice. Many notices might have the same ID. This field exists so that user applications can programmatically identify a notice and take automatic corrective action. Typical notice IDs include: `index_failed`, `index_failed_too_many_requests`, `index_failed_incompatible_field`, `index_failed_cluster_unavailable`, `ingestion_timeout`, `ingestion_error`, `bad_request`, `internal_error`, `missing_model`, `unsupported_model`, `smart_document_understanding_failed_incompatible_field`, `smart_document_understanding_failed_internal_error`, `smart_document_understanding_failed_internal_error`, `smart_document_understanding_failed_warning`, `smart_document_understanding_page_error`, `smart_document_understanding_page_warning`. **Note:** This is not a complete list, other values might be returned. */
    notice_id?: string;
    /** The creation date of the collection in the format yyyy-MM-dd'T'HH:mm:ss.SSS'Z'. */
    created?: string;
    /** Unique identifier of the document. */
    document_id?: string;
    /** Unique identifier of the query used for relevance training. */
    query_id?: string;
    /** Severity level of the notice. */
    severity?: string;
    /** Ingestion or training step in which the notice occurred. Typical step values include: `classify_elements`, `smartDocumentUnderstanding`, `ingestion`, `indexing`, `convert`. **Note:** This is not a complete list, other values might be returned. */
    step?: string;
    /** The description of the notice. */
    description?: string;
  }

  /** An aggregation produced by Discovery to analyze the input provided. */
  export interface QueryAggregation {
    /** The type of aggregation command used. For example: term, filter, max, min, etc. */
    type?: string;
    /** Array of aggregation results. */
    results?: AggregationResult[];
    /** Number of matching results. */
    matching_results?: number;
    /** Aggregations returned by Discovery. */
    aggregations?: QueryAggregation[];
  }

  /** Configuration for passage retrieval. */
  export interface QueryLargePassages {
    /** A passages query that returns the most relevant passages from the results. */
    enabled?: boolean;
    /** When `true`, passages will be returned whithin their respective result. */
    per_document?: boolean;
    /** Maximum number of passages to return per result. */
    max_passages_per_document?: boolean;
    /** A comma-separated list of fields that passages are drawn from. If this parameter not specified, then all top-level fields are included. */
    fields?: string;
    /** The maximum number of passages to return. The search returns fewer passages if the requested total is not found. The default is `10`. The maximum is `100`. */
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
    /** Number of tables to return. */
    count?: number;
  }

  /** A response containing the documents and aggregations for the query. */
  export interface QueryResponse {
    /** The number of matching results for the query. */
    matching_results?: number;
    /** Array of document results for the query. */
    results?: QueryResult[];
    /** Array of aggregation results for the query. */
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
    /** Aggregations returned by Discovery. */
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
    /** The confidence score for the given result. Calculated based on how relevant the result is estimated to be. confidence can range from `0.0` to `1.0`. The higher the number, the more relevant the document. The `confidence` value for a result was calculated using the model specified in the `document_retrieval_strategy` field of the result set. This field is only returned if the **natural_language_query** parameter is specified in the query. */
    confidence?: number;
  }

  /** QueryResultPassage. */
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
    /** Used to convert the spans in the table object to resolve in the html snippet. */
    table_html_offset?: string;
    /** Full table object retrieved from Table Understanding Enrichment. */
    table?: TableResultTable;
  }

  /** An object contain retrieval type information. */
  export interface RetrievalDetails {
    /** Indentifies the document retrieval strategy used for this query. `relevancy_training` indicates that the results were returned using a relevancy trained model. **Note**: In the event of trained collections being queried, but the trained model is not used to return results, the **document_retrieval_strategy** will be listed as `untrained`. */
    document_retrieval_strategy?: string;
  }

  /** Cells that are not table header, column header, or row header cells. */
  export interface TableBodyCells {
    /** The unique ID of the cell in the current table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
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
    row_header_ids?: TableRowHeaderIds[];
    row_header_texts?: TableRowHeaderTexts[];
    row_header_texts_normalized?: TableRowHeaderTextsNormalized[];
    column_header_ids?: TableColumnHeaderIds[];
    column_header_texts?: TableColumnHeaderTexts[];
    column_header_texts_normalized?: TableColumnHeaderTextsNormalized[];
    attributes?: DocumentAttribute[];
  }

  /** A key in a key-value pair. */
  export interface TableCellKey {
    /** The unique ID of the key in the table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
    location?: TableElementLocation;
    /** The text content of the table cell without HTML markup. */
    text?: string;
  }

  /** A value in a key-value pair. */
  export interface TableCellValues {
    /** The unique ID of the value in the table. */
    cell_id?: string;
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
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
    /** The location of the column header cell in the current table as defined by its `begin` and `end` offsets, respectfully, in the input document. */
    location?: JsonObject;
    /** The textual contents of this cell from the input document without associated markup content. */
    text?: string;
    /** If you provide customization input, the normalized version of the cell text according to the customization; otherwise, the same value as `text`. */
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
    /** The location of the table header cell in the current table as defined by its `begin` and `end` offsets, respectfully, in the input document. */
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
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
    location?: TableElementLocation;
    /** The textual contents of the current table from the input document without associated markup content. */
    text?: string;
    /** Text and associated location within a table. */
    section_title?: TableTextLocation;
    /** Text and associated location within a table. */
    title?: TableTextLocation;
    /** An array of table-level cells that apply as headers to all the other cells in the current table. */
    table_headers?: TableHeaders[];
    /** An array of row-level cells, each applicable as a header to other cells in the same row as itself, of the current table. */
    row_headers?: TableRowHeaders[];
    /** An array of column-level cells, each applicable as a header to other cells in the same column as itself, of the current table. */
    column_headers?: TableColumnHeaders[];
    /** An array of key-value pairs identified in the current table. */
    key_value_pairs?: TableKeyValuePairs[];
    /** An array of cells that are neither table header nor column header nor row header cells, of the current table with corresponding row and column header associations. */
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
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
    location?: TableElementLocation;
    /** The textual contents of this cell from the input document without associated markup content. */
    text?: string;
    /** If you provide customization input, the normalized version of the cell text according to the customization; otherwise, the same value as `text`. */
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
    /** The numeric location of the identified element in the document, represented with two integers labeled `begin` and `end`. */
    location?: TableElementLocation;
  }

  /** Term. */
  export interface Term {
    /** The field where the aggregation is located in the document. */
    field?: string;
    count?: number;
    /** Identifier used to map aggregation settings to aggregation configuration. */
    name?: string;
  }

  /** Object specifying the training queries contained in the identified training set. */
  export interface TrainingDataSet {
    /** The environment id associated with this training data set. */
    environment_id?: string;
    /** The collection id associated with this training data set. */
    collection_id?: string;
    /** Array of training queries. */
    queries?: TrainingQuery[];
  }

  /** Object containing example resppnse details for a training query. */
  export interface TrainingExample {
    /** The document ID associated with this training example. */
    document_id?: string;
    /** The cross reference associated with this training example. */
    cross_reference?: string;
    /** The relevance of the training example. */
    relevance?: number;
  }

  /** Object containing an array of training examples. */
  export interface TrainingExampleList {
    /** Array of training examples. */
    examples?: TrainingExample[];
  }

  /** Object containing training query details. */
  export interface TrainingQuery {
    /** The query ID associated with the training query. */
    query_id?: string;
    /** The natural text query for the training query. */
    natural_language_query?: string;
    /** The filter used on the collection before the **natural_language_query** is applied. */
    filter?: string;
    /** Array of training examples. */
    examples?: TrainingExample[];
  }

}

export = DiscoveryV1;
