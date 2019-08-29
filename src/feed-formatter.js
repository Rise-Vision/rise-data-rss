const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const PREFERRED_FORMATS = [ "jpeg", "jpg", "png" ];
const ALT_FORMATS = [ "bmp", "gif" ];

export default class FeedFormatter {
  formatFeed (feed) {
    let formatted = {};

    formatted.title = this._getTitle(feed);
    formatted.description = this._getDescription(feed);
    formatted.link = this._getLink(feed);
    formatted.imageUrl = this._getImageUrl(feed);
    formatted.author = this._getAuthor(feed);
    formatted.pubDate = this._getPubDate(feed);

    return formatted;
  }

  _getTitle (feed) {
    return feed.title;
  }

  _getDescription (feed) {
    if (feed["rss:description"] && feed["rss:description"]["#"]) {
      return feed["rss:description"]["#"];
    } else if (feed.summary) {
      return feed.summary;
    } else {
      return feed.description;
    }
  }

  _getLink (feed) {
    return feed.link || feed.permalink;
  }

  _getImageUrl (feed) {
    let foundImages = [];

    if (feed["content:encoded"] && feed["content:encoded"]["#"]) {
      let rgx = new RegExp("src='(" + URL_REGEX.source + ")'");
      let res = feed["content:encoded"]["#"].match(rgx);

      if (res.length > 1 && res[1]) {
        foundImages.push(res[1]);
      }
    }

    if (feed["rss:image"] && feed["rss:image"]["#"]) {
      foundImages.push(feed["rss:image"]["#"]);
    }

    if (feed["media:thumbnail"] && feed["media:thumbnail"]["@"] && feed["media:thumbnail"]["@"].url) {
      foundImages.push(feed["media:thumbnail"]["@"].url);
    }

    if (feed.enclosures && feed.enclosures.length > 0 && feed.enclosures[0].url) {
      foundImages.push(feed.enclosures[0].url);
    }

    if (feed.image && feed.image.url) {
      foundImages.push(feed.image.url);
    }

    return this._getBestImage(foundImages);
  }

  _getAuthor (feed) {
    return feed.author;
  }

  _getPubDate (feed) {
    return feed.pubdate || feed.pubDate;
  }

  _isValidImage (imageUrl, validFormats) {
    let url = imageUrl.toLowerCase();

    return !!validFormats.find( ext => {
      return url.endsWith("." + ext) || url.indexOf("." + ext + "?") >= 0;
    });
  }

  _getBestImage (foundImages) {
    return foundImages.find(this._isPreferredFormat.bind(this)) || foundImages.find(this._isAltFormat.bind(this));
  }

  _isPreferredFormat (imageUrl) {
    return this._isValidImage(imageUrl, PREFERRED_FORMATS);
  }

  _isAltFormat (imageUrl) {
    return this._isValidImage(imageUrl, ALT_FORMATS);
  }
}
