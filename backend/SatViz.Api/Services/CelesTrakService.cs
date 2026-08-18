using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using SatViz.Api.Models;

namespace SatViz.Api.Services;

public class CelesTrakService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;

    // We're using constructor injection here (ASP.NET Core's dependency
    // injection hands us these automatically) rather than `new`-ing up an
    // HttpClient ourselves. This matters because HttpClient is meant to be
    // reused/pooled -- creating a fresh one per request can exhaust sockets
    // under load. Registering it via AddHttpClient() in Program.cs and
    // injecting it here is the recommended pattern.
    public CelesTrakService(HttpClient http, IMemoryCache cache)
    {
        _http = http;
        _cache = cache;

        // CelesTrak asks that clients identify themselves (see their usage
        // policy). A generic browser-mimicking User-Agent is bad practice --
        // if something goes wrong on their end, they can't tell who's hitting
        // them. Setting a clear one costs nothing and is the polite/correct
        // way to consume a free public data source.
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("SatViz-Portfolio/1.0");
    }

    public async Task<List<SatelliteOmm>?> GetGroupAsync(string group)
    {
        // Cache key is namespaced by group ("active", "stations", etc.) so
        // fetching "stations" doesn't collide with or overwrite "active" in cache.
        var cacheKey = $"celestrak:{group}";

        // TryGetValue is the "ask, don't fetch" pattern: if we already have
        // fresh data in memory, skip the network call entirely. This is the
        // core reason we cache at all -- CelesTrak's own data doesn't update
        // more than a few times a day, so re-fetching every request would be
        // pure waste (and rude to their servers).
        if (_cache.TryGetValue(cacheKey, out List<SatelliteOmm>? cached))
        {
            return cached;
        }

        var url = $"https://celestrak.org/NORAD/elements/gp.php?GROUP={group}&FORMAT=json";

        // GetFromJsonAsync does two things in one call: performs the GET,
        // and deserializes the JSON response body directly into our model
        // list. If CelesTrak is down or returns malformed data, this throws --
        // which we deliberately let bubble up for now rather than swallowing,
        // so we notice problems during development instead of silently
        // serving null.
        var data = await _http.GetFromJsonAsync<List<SatelliteOmm>>(url);

        // Set with a 3-hour expiration: long enough to avoid hammering
        // CelesTrak, short enough that satellite data (which does shift over
        // days/weeks) doesn't go stale for too long in a long-running server.
        _cache.Set(cacheKey, data, TimeSpan.FromHours(3));

        return data;
    }
}