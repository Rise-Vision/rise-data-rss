import { RiseElement } from "rise-common-component/src/rise-element.js";
import { rssConfig } from "./rise-data-rss-config.js";
import { version } from "./rise-data-rss-version.js";

export default class RiseDataRss extends RiseElement {

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

  _getUrl() {
    return rssConfig.feedParserURL + "/" + this.feedUrl;
  }

  _feedUrlChanged() {
    if (!this._initialStart && this.feedUrl) {
      this._requestData();
    }
  }

  _handleStart() {
    super._handleStart();

    if (this._initialStart) {
      this._initialStart = false;

      super.log("info", "rss-start");

      if (this.feedUrl) {
        this._requestData();
      }
    }
  }

  _requestData() {
    fetch(this._getUrl(), {
      headers: { "X-Requested-With": "rise-data-rss" }
    })
    .then(resp => {
      return resp.json();
    })
    .then(data => {
      this._handleResponse(data);
    })
    .catch(err => {
      this._handleFetchError(err);
    });
  }

  _handleResponse(data) {
    console.log('_handleResponse', data);
    if (!data.Error) {
      // Temporary solution; this should use a more robust comparison method
      if (JSON.stringify(this.feedData) !== JSON.stringify(data)) {
        this._setFeedData(data);

        super.log("info", "rss-data-update", this.feedData);
        this._sendEvent(RiseDataRss.EVENT_DATA_UPDATE, this.feedData);
      }
      else {
        super.log("info", "rss-data-unchanged");
      }
    }
    else {
      let error = data.Error;

      super.log("error", "rss-data-error", { error });
      this._sendEvent(RiseDataRss.EVENT_DATA_ERROR, { error });
    }
  }

  _handleFetchError(err) {
    let error = err ? err.message : null;

    super.log("error", "rss-request-error", { error });
    this._sendEvent(RiseDataRss.EVENT_REQUEST_ERROR, { error });
  }
}

customElements.define("rise-data-rss", RiseDataRss);
