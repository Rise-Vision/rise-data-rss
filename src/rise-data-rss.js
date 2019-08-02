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
      feedUrl: {
        type: String,
        observer: "_feedUrlChanged"
      },
      /**
       * The maximum number of items to return from the feed. The maximum allowed is 25.
       */
      maxItems: {
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
  }

  ready() {
    super.ready();

    super.initFetch({}, this._handleResponse, this._handleError);
    super.initCache({
      name: this.tagName.toLowerCase()
    });    
  }

  _handleStart() {
    super._handleStart();

    if (this._initialStart) {
      this._initialStart = false;

      super.log("info", "rss-start");

      if (this.feedUrl) {
        this._loadFeedData();
      }
    }
  }

  _getUrl() {
    return rssConfig.feedParserURL + "/" + this.feedUrl;
  }

  _feedUrlChanged() {
    this._loadFeedData();
  }

  _loadFeedData() {
    if (!this._initialStart && this.feedUrl) {
      super.fetch(this._getUrl(), {
        headers: { "X-Requested-With": "rise-data-rss" }
      });
    }
  }

  _handleResponse(response) {
    response.json()
      .then(this._processRssData.bind(this))
      .catch(this._handleFetchError.bind(this));
  }

  _processRssData(data) {
    if (!data.Error) {
      if (!isEqual(this.feedData, data)) {
        this._setFeedData(data.slice(0, this.maxItems));

        super.log("info", "rss-data-update", {});
        this._sendRssEvent(RiseDataRss.EVENT_DATA_UPDATE, this.feedData);
      }
    }
    else {
      let error = data.Error;

      super.log("error", "rss-data-error", { error });
      this._sendRssEvent(RiseDataRss.EVENT_DATA_ERROR, { error });
    }
  }

  _handleFetchError(err) {
    let error = err ? err.message : null;

    super.log("error", "rss-request-error", { error });
    this._sendRssEvent(RiseDataRss.EVENT_REQUEST_ERROR, { error });
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
