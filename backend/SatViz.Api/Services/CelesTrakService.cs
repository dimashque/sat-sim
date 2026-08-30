using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using SatViz.Api.Models;

namespace SatViz.Api.Services;

public class CelesTrakService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;


    public CelesTrakService(HttpClient http, IMemoryCache cache)
    {
        _http = http;
        _cache = cache;

        // CelesTrak asks that clients identify themselves (see their usage policy)
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("SatViz-Portfolio/1.0");
    }

  

    public async Task<List<SatelliteOmm>?> GetGroupAsync(string group)

        // Cache key is namespaced by group ("active", "stations", etc.) so
        // fetching "stations" doesn't collide with or overwrite "active" in cache.
{
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

    HttpResponseMessage response;
    try
    {
        response = await _http.GetAsync(url);
    }
    catch (TaskCanceledException)
    {
        Console.WriteLine($"[CelesTrak TIMEOUT] group='{group}'");
        return null; // treat a timeout the same as any other failure -- caller returns 404, not a crash
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CelesTrak ERROR] {ex.GetType().Name}: {ex.Message}");
        return null;
    }

    if (!response.IsSuccessStatusCode)
    {
        Console.WriteLine($"[CelesTrak error] {(int)response.StatusCode} for group '{group}'");
        return null;
    }

    var data = await response.Content.ReadFromJsonAsync<List<SatelliteOmm>>();

            // Set with a 3-hour expiration: long enough to avoid hammering
        // CelesTrak, short enough that satellite data (which does shift over
        // days/weeks) doesn't go stale for too long in a long-running server.
    _cache.Set(cacheKey, data, TimeSpan.FromHours(3));
    return data;
}
}