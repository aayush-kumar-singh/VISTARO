function initMap() {
    const mapElement = document.getElementById("map");

    if (
        mapElement &&
        typeof L !== "undefined" &&
        typeof listing !== "undefined" &&
        listing?.geometry?.coordinates?.length === 2
    ) {
        const coordinates = listing.geometry.coordinates;

        // GeoJSON uses [longitude, latitude]
        // Leaflet uses [latitude, longitude]
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        const map = L.map("map").setView(
            [latitude, longitude],
            12
        );

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors",
            }
        ).addTo(map);

        const marker = L.marker([
            latitude,
            longitude,
        ]).addTo(map);

        marker.bindPopup(`
            <h4>${listing.title}</h4>
            <p>Exact Location provided after Booking</p>
        `);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
} else {
    initMap();
}