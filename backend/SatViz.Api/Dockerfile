# Build stage: compiles the app using the full .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy just the csproj first and restore -- this lets Docker cache the
# restore step separately from your source code, so rebuilding after a
# code change doesn't re-download all NuGet packages every time.
COPY *.csproj .
RUN dotnet restore

# Now copy everything else and publish
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage: much smaller image, only what's needed to RUN the app,
# not build it -- keeps the final image lean.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "SatViz.Api.dll"]