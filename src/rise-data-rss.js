import { RiseElement } from "rise-common-component/src/rise-element.js";
import { CacheMixin } from "rise-common-component/src/cache-mixin.js";
import { FetchMixin } from "rise-common-component/src/fetch-mixin.js";

import { rssConfig } from "./rise-data-rss-config.js";
import { version } from "./rise-data-rss-version.js";
import isEqual from "lodash-es/isEqual";

const fetchBase = CacheMixin( RiseElement );

export default class RiseDataRss extends FetchMixin(fetchBase) {

  static get properties() {
    return {
      /**
       * The url of the feed that will be requested through feed-parser.
       */
      feedurl: {
        type: String
      },
      /**
       * The maximum number of items to return from the feed. The maximum allowed is 25.
       */
      maxitems: {
        type: Number,
        value: 25
      },
      /**
       * The latest successful response from the feed.
       */
      feedData: {
        type: Object,
        readOnly: true
      }
    };
  }

  // Each item of observers array is a method name followed by
  // a comma-separated list of one or more dependencies.
  static get observers() {
    return [
      "_reset(feedurl, maxitems)"
    ]
  }

  // Event name constants
  static get EVENT_DATA_UPDATE() {
    return "data-update";
  }

  static get EVENT_DATA_ERROR() {
    return "data-error";
  }

  static get EVENT_REQUEST_ERROR() {
    return "request-error";
  }

  constructor() {
    super();

    this._setVersion(version);
    this._initialStart = true;
    this._latestFailed = false;
  }

  ready() {
    super.ready();

    super.initFetch({
      refresh: 1000 * 60 * 5,
      retry: 1000 * 60 * 5,
      cooldown: 1000 * 60 * 10
    }, this._handleResponse, this._handleError);

    super.initCache({
      name: this.tagName.toLowerCase(),
      expiry: -1
    });    
  }

  _handleStart() {
    super._handleStart();

    if (this._initialStart) {
      this._initialStart = false;

      if (this.feedurl) {
        this._loadFeedData();
      }
    }
  }

  _getUrl() {
    return rssConfig.feedParserURL + "/" + this.feedurl;
  }

  _reset() {
    this._loadFeedData();
  }

  _loadFeedData() {
    if (!this._initialStart && this.feedurl) {
      super.fetch(this._getUrl(), {
        headers: { "X-Requested-With": "rise-data-rss" }
      });
    }
  }

  _handleResponse(response) {
    response.json()
      .then(this._processRssData.bind(this));
  }

  _processRssData(data) {
    if (!data.Error) {
      let slicedData = data.slice(0, this.maxitems);

      if (!isEqual(this.feedData, slicedData) || this._latestFailed) {
        this._latestFailed = false;
        this._setFeedData(slicedData);

        this.log( "info", "data provided" );

        this._sendRssEvent(RiseDataRss.EVENT_DATA_UPDATE, this.feedData);
      }
    }
    else {
      let error = data.Error;

      this._latestFailed = true;
      this.log( "error", "data error", { error });

      this._sendRssEvent(RiseDataRss.EVENT_DATA_ERROR, { error });
    }
  }

  _handleError(err) {
    let error = err ? err.message : null;

    if (!(err && err.isOffline)) {
      this._sendRssEvent(RiseDataRss.EVENT_REQUEST_ERROR, { error });
    }
  }

  _sendRssEvent(name, detail) {
    super._sendEvent(name, detail);

    switch (name) {
    case RiseDataRss.EVENT_REQUEST_ERROR:
    case RiseDataRss.EVENT_DATA_ERROR:
      super._setUptimeError(true);
      break;
    case RiseDataRss.EVENT_DATA_UPDATE:
      super._setUptimeError(false);
      break;
    default:
    }
  }
}

customElements.define("rise-data-rss", RiseDataRss);
