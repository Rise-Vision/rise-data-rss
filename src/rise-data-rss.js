import { RiseElement } from "rise-common-component/src/rise-element.js";
import { CacheMixin } from "rise-common-component/src/cache-mixin.js";
import { FetchMixin } from "rise-common-component/src/fetch-mixin.js";

import { rssConfig } from "./rise-data-rss-config.js";
import { version } from "./rise-data-rss-version.js";
import FeedFormatter from "./feed-formatter.js";
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
  static get EVENT_FEED_PROVIDER_ERROR() {
    return "feed-provider-error";
  }

  constructor() {
    super();

    this._setVersion(version);
    this._initialStart = true;
    this._latestFailed = false;
    this._feedFormatter = new FeedFormatter();
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
      .then( json => {
        this._processRssData(json, response.isOffline);
      });
  }

  _processRssData(data, isOffline) {
    if (!data.Error) {
      let slicedData = data.slice(0, this.maxitems);

      if (!isEqual(this.feedData, slicedData) || this._latestFailed) {
        this._latestFailed = false;
        this._setFeedData(slicedData);

        this.log( RiseDataRss.LOG_TYPE_INFO, "data provided" );

        this._sendRssEvent(RiseDataRss.EVENT_DATA_UPDATE, this.feedData.map( item => {
          let formattedFeed = this._feedFormatter.formatFeed(item);

          if (isOffline) {
            formattedFeed.imageUrl = null;
          }

          return formattedFeed;
        }));
      }
    }
    else {
      let error = data.Error;

      this._latestFailed = true;

      if (this._isFeedProviderError(error)) {
        this.log( RiseDataRss.LOG_TYPE_WARNING, "feed provider error", null, { feed: this.feedurl, error });
        this._sendRssEvent(RiseDataRss.EVENT_FEED_PROVIDER_ERROR, { error });
      } else {

        let errorCode = "E000000061";

        if ( error.toLowerCase() === "401 unauthorized" ) {
          //feed authentication error
          errorCode = "E000000057";
        } else if ( error.toLowerCase() === "404 not found" ) {
          //feed not found
          errorCode = "E000000058";
        } else if ( error.toLowerCase() === "not a feed" ) {
          //not a feed
          errorCode = "E000000059";
        } else if ( error.indexOf( "403" ) > 0 && error.toLowerCase().indexOf( "forbidden" ) > 0 ) {
          //feed request error
          errorCode = "E000000060";
        }

        this.log( RiseDataRss.LOG_TYPE_ERROR, "data error", {errorCode}, { feed: this.feedurl, error });
        this._sendRssEvent(RiseDataRss.EVENT_DATA_ERROR, { error });
      }
    }
  }

  _isFeedProviderError(err) {
    return !!err && ["etimedout", "econnreset", "parse error"].indexOf(err.trim().toLowerCase()) >= 0;
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
    case RiseDataRss.EVENT_FEED_PROVIDER_ERROR:
      super._setUptimeError(false);
      break;
    default:
    }
  }
}

customElements.define("rise-data-rss", RiseDataRss);
