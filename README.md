# cluster-backend

Built on node 8.10.0. Holds the API to power the backend of the cluster challenge.

To run project, clone the repo and run `yarn` from the root to install dependencies.

## Available commands.

To lint the project: `yarn lint`

To run unit tests: `yarn test`

To create a build: `yarn build`

To run (after a build): `yarn start`

To run while watching for changes (auto re-build and run): `yarn watch`

## Design Discussion

The project has been designed with readability in mind. I try to keep comments sparse,
and instead focus on fluent naming and structure to communicate intent. Comments are
provided in cases where more treatment is required, typically when a subtle design
decision has been made.

### API

The api has a single endpoint called: `/search`. By design, it is a post that accepts
a json blob. Each search request has the following shape:

```
{
  "search": string, // the search string used to filter programs
  "length": number, // max number of programs to return
  "offset": number, // offset used for paging through programs
  "sortType": string, // the sort type to be applied to this search

  // optional, only required for "DISTANCE" sort type
  "userGeoLocation": {
    "latitude": number,
    "longitude: number,
  }
}
```

There is only one endpoint for now for simplicity's sake, but in the future we might
want to split it out if the amount of data we have to provide in the post body were to
become messy. For now, we are following more of a simple RPC standard as opposed to a
REST api. Depending on use case, it might make sense to convert this entirely to a RESTful
api using GETs and query-strings and placing caching layers in front of the server.

Server responses are always 200 OK, with the following shape:

```
{
  "error": string, // null if no error, otherwise will have some informative string
  "result": object // null if error, otherwise the result
}
```

### Data

We are using a simple repo pattern to manage access to the program data. Since we
were given a small static data set, we are managing the data set in memory. This clearly
does not scale, but is sufficient as a proof of concept for the challenge.

### Filtering and sorting

The programs repo is where the main heavy lifting happens. A search is split into three
parts: 1) Filtering down to matching programs. 2) Sorting the programs. 3) Returning the correct slice.

The filtering is done by concatenating relevant terms of a program into a search string
and then doing a simple match using the following code snippet: https://gist.github.com/vpalos/4334557.
We opted to use a case-insensitive full word match mode.

The other two steps are self explanatory.

In production, I'd probably use ElasticSearch since it can handle all three steps for us,
and is essentially built for this use-case. (It can even handle geo-location based distance searches).

### Other patterns of note

#### API config

I've added in a pattern for configuring api endpoint listeners. It can be viewed
in `api/config.ts` and `api/search_programs.ts`. Essentially, it's a pattern for
listening to requests on a specific verb, hooking up a handler, running
a custom set of validations on the request data being sent over, and reporting errors.

#### Metrics

I've also added in a pattern for reporting on metrics. Since this is a search application,
the business will be very sensitive to how long it takes us to return our search results.
The metrics library allows us to wrap sync or async functions with a reporter that
will send runtime and context info to whichever metrics listener we decide is appropriate.
Currently, I've only added metrics to the main entrypoint and the only listener I've
conigured logs the data to the console.

### Tests

I've written a suite of unit tests and integration tests. The unit tests ensure that
the various sort types are working. The integration tests exercise the whole framework
and make sure the server starts, performs request validation, and sends back data.

### Running the challenge

To verify it works, I recommend running `yarn` to install, `yarn test` to run the tests
(note that I am passing the env var DISABLE_LOGGING during yarn test to stop the tests
from being too chatty, feel free to turn off to see error logging and metrics logging),
and then `yarn watch` to start the server. To send requests to the server, I was using
postman with the following:

POST: http://localhost:8080/search

BODY:

```
{
	"search": "long beach",
	"length": 1,
	"offset": 1,
	"sortType": "DISTANCE",
	"userGeoLocation": {
		"latitude": 0,
		"longitude": 0
	}
}
```

Valid sort types are:

RELEVANCY

COST_LOW_TO_HIGH

COST_HIGH_TO_LOW

DISTANCE

DURATION
