using System.Text.Json.Serialization;

namespace SatViz.Api.Models;

// This record mirrors the JSON structure CelesTrak returns for each satellite.
// Why a "record" and not a "class"? Records are immutable by default and give us
// value-based equality for free -- perfect for data that's just "here's a fact
// about a satellite at this epoch," which we never mutate after fetching.
//
// The [JsonPropertyName] attributes matter because CelesTrak uses SCREAMING_SNAKE_CASE
// field names (a convention from the original OMM/CCSDS standard), while C# convention
// is PascalCase. Without these attributes, System.Text.Json wouldn't know that
// "NORAD_CAT_ID" in the JSON should map to our "NoradId" property.
public record SatelliteOmm(
    [property: JsonPropertyName("OBJECT_NAME")] string ObjectName,
    [property: JsonPropertyName("OBJECT_ID")] string ObjectId,
    [property: JsonPropertyName("NORAD_CAT_ID")] int NoradCatId,
    [property: JsonPropertyName("EPOCH")] string Epoch,
    [property: JsonPropertyName("MEAN_MOTION")] double MeanMotion,
    [property: JsonPropertyName("ECCENTRICITY")] double Eccentricity,
    [property: JsonPropertyName("INCLINATION")] double Inclination,
    [property: JsonPropertyName("RA_OF_ASC_NODE")] double RaOfAscNode,
    [property: JsonPropertyName("ARG_OF_PERICENTER")] double ArgOfPericenter,
    [property: JsonPropertyName("MEAN_ANOMALY")] double MeanAnomaly,
    [property: JsonPropertyName("BSTAR")] double Bstar,
    [property: JsonPropertyName("MEAN_MOTION_DOT")] double MeanMotionDot,
    [property: JsonPropertyName("MEAN_MOTION_DDOT")] double MeanMotionDdot
);