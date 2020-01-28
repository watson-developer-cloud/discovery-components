import React from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { createDummyResponsePromise } from './testingUtils';

export const StoryWrapper = (props: any): any => (
  <div style={{ backgroundColor: '#f3f3f3', padding: '1rem' }}>{props.children}</div>
);

export const DocumentStoryWrapper = (props: any): any => (
  <>
    <style>{`
        .story > * {
          background-color: #fff;
        }
      `}</style>
    <div style={{ backgroundColor: '#f3f3f3' }}>
      <div className="story" style={{ maxWidth: '78ch', padding: '2rem' }}>
        {props.children}
      </div>
    </div>
  </>
);

export class DummySearchClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(queryParams: DiscoveryV2.QueryParams): Promise<any> {
    action('query')(queryParams);
    return createDummyResponsePromise({});
  }

  public async getAutocompletion(
    autocompletionParams: DiscoveryV2.GetAutocompletionParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('getAutocompletion')(autocompletionParams);
    return createDummyResponsePromise({});
  }

  public async listCollections(
    listCollectionParams: DiscoveryV2.ListCollectionsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('listCollection')(listCollectionParams);
    return createDummyResponsePromise({});
  }

  public async getComponentSettings(
    getComponentSettingsParams: DiscoveryV2.GetComponentSettingsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('getComponentSettings')(getComponentSettingsParams);
    return createDummyResponsePromise({});
  }

  public async listFields(listFieldsParams: DiscoveryV2.ListFieldsParams): Promise<any> {
    action('listFields')(listFieldsParams);
    return createDummyResponsePromise({});
  }
}
