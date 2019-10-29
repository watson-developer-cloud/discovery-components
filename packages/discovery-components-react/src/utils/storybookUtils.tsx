import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { action } from '@storybook/addon-actions';
import { createDummyResponsePromise } from './testingUtils';

export const StoryWrapper = (props: any): any => (
  <div style={{ backgroundColor: '#f3f3f3', padding: '1rem' }}>{props.children}</div>
);

export class DummySearchClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(queryParams: DiscoveryV1.QueryParams): Promise<any> {
    action('query')(queryParams);
    return createDummyResponsePromise({});
  }

  public async getAutocompletion(
    autocompletionParams: DiscoveryV1.GetAutocompletionParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('getAutocompletion')(autocompletionParams);
    return createDummyResponsePromise({});
  }

  public async listCollections(
    listCollectionParams: DiscoveryV1.ListCollectionsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('listCollection')(listCollectionParams);
    return createDummyResponsePromise({});
  }

  public async getComponentSettings(
    getComponentSettingsParams: DiscoveryV1.GetComponentSettingsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('getComponentSettings')(getComponentSettingsParams);
    return createDummyResponsePromise({});
  }
}
