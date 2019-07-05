# Rise Data Rss [![CircleCI](https://circleci.com/gh/Rise-Vision/rise-data-rss/tree/master.svg?style=svg)](https://circleci.com/gh/Rise-Vision/rise-data-rss/tree/master)

## Introduction

`rise-data-rss` is a Polymer 3 Web Component that retrieves RSS Feeds and provides the result as a JSON object with a similar structure to RSS 2.0. It supports RSS 1.0, RSS 2.0 and Atom.

## Usage

The below illustrates simple usage of the component.

#### Example

```
  <rise-data-rss
      id="rise-data-rss-01" label="Test Feed"
      feed-url="https://www.feedforall.com/sample.xml"
      max-items="15">
  </rise-data-rss>
```

Since this is not a visual component, a listener needs to be registered to process the data it provides. You can check the available events in the [events section](#events)

### Attributes

This component receives the following list of attributes:

- **id**: ( string ): Unique HTMLElement id.
- **label**: (string): Assigns the label to use for the instance of the component in Template Editor.
- **feed-url**: (string / required): The url to the RSS feed to be used for this instance.
- **max-items**: (number / optional): The maximum number of elements to retrieve from the RSS feed. If the attribute is empty or zero, all the elements, up to the maximum, are retrieved. Defaults to 25, which is also the maximum.
- **non-editable**: ( empty / optional ): If present, it indicates this component is not available for customization in the Template Editor.

This component does not support PUD; it will need to be handled by Designers on a per Template basis.

### Events

The component sends the following events:

- **configured**: The component has initialized what it requires to and is ready to handle a _start_ event.
- **rss-data-update**: An event proving a maximum of _max-items_ elements from the provided feed-url. This event will be generated on startup and whenever data on the feed has changed; if the feed has not changed since the last refresh, an event will not be generated. The provided format can be checked [here](https://www.npmjs.com/package/feedparser#what-is-the-parsed-output-produced-by-feedparser).
- **rss-error**: An event indicating an error occurred (i.e. feed retrieval, feed format, etc). It provides errorMessage and errorDetail as in other components.

The component listens for the following events:

- **start**: This event will make an initial fetch for the RSS feed and then periodically fetch the RSS feed (refresh will be disabled in Preview). It can be dispatched to the component when the _configured_ event has been fired.

### Logging

The component logs the following events to BQ:

- **rss-start**: The component receives the start event and commences execution.
- **rss-data-update**: The component detected new data in the feed and reported it to the consumer.
- **rss-feed-parser-error**: The component was not able to connect to feed-parser.
- **rss-data-error**: The component received an error from feed-parser. The details of the error will be provided as part of the log.

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
