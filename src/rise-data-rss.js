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
        observer: "_requestData"
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

  constructor() {
    super();

    this._setVersion(version);
  }

  ready() {
    super.ready();
  }

  _init() {
    super._init();
  }

  _handleStart() {
    super._handleStart();
  }

  _getUrl() {
    return rssConfig.feedParserURL + "/" + this.feedUrl;
  }

  _requestData() {
    fetch(this._getUrl(), {
      headers: { "X-Requested-With": "rise-data-rss" }
    })
    .then(res => {
      //this._logData( false );
      this._handleResponse(res.clone());
      //super.putCache(res);
    })
    .catch(() => {
      this._handleFetchError();
    });
  }

  _handleResponse(resp) {
    resp.json()
    .then(data => {
      this.feedData = data;
      super.log("info", "data received", { data });
    })
    .catch(err => {
      super.log("error", "data error", { error: err.message });
    });
  }

}

customElements.define("rise-data-rss", RiseDataRss);
