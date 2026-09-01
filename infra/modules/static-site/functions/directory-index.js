/*
  CloudFront Function, viewer-request. Rewrites directory URIs to their
  index.html.

  ── WHY THIS IS MANDATORY ─────────────────────────────────────────────────
  S3 has two endpoints and they behave differently. The *website* endpoint
  resolves /blog/ to /blog/index.html for you. The *REST* endpoint does not,
  and Origin Access Control only works against the REST endpoint. So with OAC
  and no rewrite, every directory URL on the site returns 403 and only the
  homepage works.

  The site builds with `format: 'directory'` and `trailingSlash: 'always'`, so
  essentially every route is a directory URL. Without this function the deploy
  looks successful and the site is almost entirely broken.

  A CloudFront Function, not Lambda@Edge: this runs at every edge location on
  every request, needs sub-millisecond execution, and does string manipulation
  with no network calls. Lambda@Edge would cost more and add latency for
  nothing.

  Constraints of the runtime: this is a restricted ES5-era JavaScript engine.
  No const/let in older accounts, no template literals, no async, no require.
  Keep it boring.
*/
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // charAt and indexOf rather than endsWith and includes: those are ES6, and
  // the 1.0 runtime is ES5.1. Using ES5 methods means this behaves the same
  // whichever runtime the distribution is pinned to.
  if (uri.charAt(uri.length - 1) === '/') {
    // /blog/ -> /blog/index.html
    request.uri = uri + 'index.html';
  } else {
    // /blog -> /blog/index.html
    //
    // Tested on the LAST PATH SEGMENT, not the whole URI. A path like
    // /v1.2/guide contains a dot but is still extensionless, and skipping it
    // would leave that route 403ing.
    var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
    if (lastSegment.indexOf('.') === -1) {
      request.uri = uri + '/index.html';
    }
  }

  return request;
}
