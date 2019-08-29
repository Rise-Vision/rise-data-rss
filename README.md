# Rise Data Rss [![CircleCI](https://circleci.com/gh/Rise-Vision/rise-data-rss/tree/master.svg?style=svg)](https://circleci.com/gh/Rise-Vision/rise-data-rss/tree/master)

## Introduction

`rise-data-rss` is a Polymer 3 Web Component that retrieves RSS Feeds and provides the result as a JSON object with a similar structure to RSS 2.0. It supports RSS 1.0, RSS 2.0 and Atom.

## Usage

The below illustrates simple usage of the component.

#### Example

```
  <rise-data-rss
      id="rise-data-rss-01" label="Test Feed"
      feedurl="https://www.feedforall.com/sample.xml"
      maxitems="15">
  </rise-data-rss>
```

Since this is not a visual component, a listener needs to be registered to process the data it provides. You can check the available events in the [events section](#events)

### Attributes

This component receives the following list of attributes:

- **id**: ( string ): Unique HTMLElement id.
- **label**: (string): Assigns the label to use for the instance of the component in Template Editor.
- **feedurl**: (string / required): The url to the RSS feed to be used for this instance.
- **maxitems**: (number / optional): The maximum number of elements to retrieve from the RSS feed. If the attribute is empty or zero, all the elements, up to the maximum, are retrieved. Defaults to 25, which is also the maximum.
- **non-editable**: ( empty / optional ): If present, it indicates this component is not available for customization in the Template Editor.

The feed is refreshed every 5 minutes. The refresh rate is not modifiable.

This component does not support PUD; it will need to be handled by Designers on a per Template basis.

### Events

The component sends the following events:

- **configured**: The component has initialized what it requires to and is ready to handle a _start_ event.
- **data-update**: An event proving a maximum of _max-items_ elements from the provided feed-url. This event will be generated on startup and whenever data on the feed has changed; if the feed has not changed since the last refresh, an event will not be generated. The data object is provided in `event.details`. The response format can be checked [here](https://www.npmjs.com/package/feedparser#what-is-the-parsed-output-produced-by-feedparser).
- **data-error**: An event indicating the feed responded with an error (i.e. feed format, etc). An error object is provided in `event.details`.
- **request-error**: An event indicating there were problems requesting the feed. An error object is provided in `event.details`.

The component listens for the following events:

- **start**: This event will make an initial fetch for the RSS feed and then periodically fetch the RSS feed (refresh will be disabled in Preview). It can be dispatched to the component when the _configured_ event has been fired.

### Provided data

The **data-update** event provides an object with the following fields:

- **title**: Title of the feed.
- **description**: Description of the feed. Any `img` tag embedded in the feed will be removed before generating the event.
- **link**: Link to the feed's originating post.
- **imageUrl**: The image associated to the post. The component looks for images in several places and provides the first valid image it finds, prioritizing what it finds in determined fields.
- **author**: Author of the post.
- **pubDate**: Publication date

### Logging

The component logs the following events to BQ:

- **start received**: The component receives the start event and commences execution.
- **data received**: The component successfully retrieved data from the feed.
- **data provided**: The component detected new data from the feed and provided it to the client.
- **data error**: The component received an error from feed-parser. The details of the error will be provided as part of the log.
- **request error**: The component was not able to connect to feed-parser.
- **client offline**: The component was not able to connect to feed-parser because the client has connectivity issues.

### Offline play

The component supports offline play out of the box, relying on the browser for Cache API availability.

Every time a successful request to the feed is made, the response is stored locally in the cache. In case connectivity is lost, the latest cached version will be available. Upon a Player restart, if a cached version exists it will be used until connectivity is restored.

## Built With
- [Polymer 3](https://www.polymer-project.org/)
- [Polymer CLI](https://github.com/Polymer/tools/tree/master/packages/cli)
- [WebComponents Polyfill](https://www.webcomponents.org/polyfills/)
- [npm](https://www.npmjs.org)

## Development

### Local Development Build
Clone this repo and change into this project directory.

Execute the following commands in Terminal:

```
npm install
npm install -g polymer-cli@1.9.7
npm run build
```

**Note**: If EPERM errors occur then install polymer-cli using the `--unsafe-perm` flag ( `npm install -g polymer-cli --unsafe-perm` ) and/or using sudo.

### Testing
You can run the suite of tests either by command terminal or interactive via Chrome browser.

#### Command Terminal
Execute the following command in Terminal to run tests:

```
npm run test
```

#### Local Server
Run the following command in Terminal: `polymer serve`.

Now in your browser, navigate to:

```
http://127.0.0.1:8081/components/rise-data-rss/demo/src/rise-data-rss-dev.html
```

## Submitting Issues
If you encounter problems or find defects we really want to hear about them. If you could take the time to add them as issues to this Repository it would be most appreciated. When reporting issues, please use the following format where applicable:

**Reproduction Steps**

1. did this
2. then that
3. followed by this (screenshots / video captures always help)

**Expected Results**

What you expected to happen.

**Actual Results**

What actually happened. (screenshots / video captures always help)

## Contributing
All contributions are greatly appreciated and welcome! If you would first like to sound out your contribution ideas, please post your thoughts to our [community](https://help.risevision.com/hc/en-us/community/topics), otherwise submit a pull request and we will do our best to incorporate it. Please be sure to submit test cases with your code changes where appropriate.

## Resources
If you have any questions or problems, please don't hesitate to join our lively and responsive [community](https://help.risevision.com/hc/en-us/community/topics).

If you are looking for help with Rise Vision, please see [Help Center](https://help.risevision.com/hc/en-us).

**Facilitator**

[Francisco Vallarino](https://github.com/fjvallarino "Francisco Vallarino")
