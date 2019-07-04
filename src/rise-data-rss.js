import { html } from "@polymer/polymer";
import { RiseElement } from "rise-common-component/src/rise-element.js";
import { version } from "./rise-data-rss-version.js";

export default class RiseDataRss extends RiseElement {

  static get template() {
    return html`[[maxItems]]`;
  }

  static get properties() {
    return {
      feedUrl: {
        type: String
      },
      maxItems: {
        type: Number,
        value: 25
      }
    };
  }

  constructor() {
    super();

    this._setVersion( version );
  }

}

customElements.define("rise-data-rss", RiseDataRss);
