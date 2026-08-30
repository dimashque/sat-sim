using SatViz.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Service registration (the "DI container" setup) ---
// Everything registered here becomes available for constructor injection
// anywhere in the app -- this is how CelesTrakService gets its HttpClient
// and IMemoryCache without us manually wiring them together.

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AddMemoryCache registers an in-process cache. "In-process" means it lives
// in your app's RAM and resets if the app restarts -- perfectly fine for a
// portfolio project. (If you ever scale to multiple server instances, you'd
// swap this for a shared cache like Redis, but that's not a concern here.)
builder.Services.AddMemoryCache();

// AddHttpClient registers HttpClient properly through the pooled
// IHttpClientFactory pattern mentioned above, rather than us instantiating
// it directly.
builder.Services.AddHttpClient();

// AddScoped means: one instance of CelesTrakService per HTTP request. This
// is fine here since the service itself is stateless (all the actual state
// lives in the shared IMemoryCache, not on the service instance).
builder.Services.AddScoped<CelesTrakService>();

// CORS: by default, browsers block JavaScript on one origin (your React
// app at localhost:5173) from calling an API on a different origin
// (your C# app at localhost:7xxx). This policy explicitly allows it.
// Without this, your fetch() calls from React will fail silently with a
// CORS error in the browser console -- a very common first-timer stumbling
// block.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Render config  assign a port dynamically via PORT.
// Locally, this env var won't exist, so we fall back to something
// reasonable for dev.
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");

// Order matters here: UseCors must run before the endpoints that need it.
app.UseCors("AllowFrontend");

// --- The actual endpoint ---
// This is a minimal API route (no separate Controller class needed).
// {group} is a route parameter -- calling /api/satellites/active sets
// group = "active", which we pass straight through to CelesTrak's own
// GROUP query parameter.
app.MapGet("/api/satellites/{group}", async (string group, CelesTrakService svc) =>
{
    var data = await svc.GetGroupAsync(group);

    // If CelesTrak returned nothing usable (bad group name, empty response),
    // return a proper 404 instead of an empty 200 -- this makes frontend
    // error handling straightforward (check response.ok) instead of having
    // to inspect an empty array to guess what happened.
    if (data is null || data.Count == 0)
    {
        return Results.NotFound(new { message = $"No data found for group '{group}'" });
    }

    return Results.Ok(data);
});

app.Run();