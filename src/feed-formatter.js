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
    var description;

    if (feed["rss:description"] && feed["rss:description"]["#"]) {
      description = feed["rss:description"]["#"];
    } else if (feed.summary) {
      description = feed.summary;
    } else {
      description = feed.description;
    }

    if (description) {
      description = this._removeElements(description, "img");
    }

    return description;
  }

  _getLink (feed) {
    return feed.link || feed.permalink;
  }

  _getImageUrl (feed) {
    let foundImages = [];
    let _appendFoundImages = (html) => {
      this._extractImages(html).forEach(image => {
        foundImages.push(image);
      });
    }

    if (feed.description) {
      _appendFoundImages(feed.description);
    }

    if (feed["content:encoded"] && feed["content:encoded"]["#"]) {
      _appendFoundImages(feed["content:encoded"]["#"]);
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

  _extractImages (html) {
    let content = this._parseHTML(html);
    let imageTags = content.getElementsByTagName("img");
    let extractedImages = [];

    for (var i = 0; i < imageTags.length; i++) {
      let image = imageTags[i];

      if (image.src) {
        extractedImages.push(image.src);
      }
    }

    return extractedImages;
  }

  _removeElements (html, tag) {
    let content = this._parseHTML(html);
    let tags = content.getElementsByTagName(tag);

    for (var i = tags.length - 1; i >= 0; i--) {
      let tag = tags[i];

      tag.parentElement.removeChild(tag);
    }

    return content.innerHTML;
  }

  _parseHTML (html) {
    let div = document.createElement("div");

    div.innerHTML = html;

    return div;
  }
}
