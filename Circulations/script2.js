// Variables globales
let map;
let userLat = 48.6921;
let userLon = 6.1844;
let userCity = 'Nancy';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await getGeolocation();
        initMap(userLat, userLon);
        await Promise.all([
            loadBikeStations(),
            loadAirQuality(),
            loadWeather(userLat, userLon)
        ]);
        
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        showError('Erreur lors du chargement des données');
    }
});

// Géolocalisation IP 
async function getGeolocation() {
    try {
        const urls = [
            { url: 'https://ipapi.co/json/', type: 'ipapi' },
            { url: 'https://ip-api.com/json/?fields=status,country,region,regionName,city,lat,lon', type: 'ipapi-com' }
        ];
        
        for (const api of urls) {
            try {
                const response = await fetch(api.url);
                if (!response.ok) continue;
                
                const data = await response.json();
                
                // Format ipapi.co
                if (api.type === 'ipapi' && data.latitude && data.longitude) {
                    userLat = data.latitude;
                    userLon = data.longitude;
                    userCity = data.city || 'Nancy';
                    const locationEl = document.getElementById('location');
                    locationEl.textContent = `${userCity}, ${data.region || data.principalSubdivision || ''}`;
                    return;
                }
                
                // Format ip-api.com
                if (api.type === 'ipapi-com' && data.status === 'success') {
                    userLat = data.lat;
                    userLon = data.lon;
                    userCity = data.city || 'Nancy';
                    const locationEl = document.getElementById('location');
                    locationEl.textContent = `${userCity}, ${data.regionName || data.region || ''}`;
                    return;
                }
            } catch (e) {
                continue;
            }
        }
    } catch (error) {
    }
    
    
    const locationEl = document.getElementById('location');
    locationEl.textContent = `${userCity}, Grand Est`;
}

// Carte Leaflet
function initMap(lat, lon) {
    map = L.map('map').setView([lat, lon], 13);
    
    // OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Position de l'utilisateur
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background-color: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    L.marker([lat, lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Votre position</b>')
        .openPopup();
}

// Vélos VélOstan
async function loadBikeStations() {
    try {
        const baseUrl = 'https://api.cyclocity.fr/contracts/nancy/gbfs/v2';
        const infoResponse = await fetch(`${baseUrl}/station_information.json`);
        if (!infoResponse.ok) {
            throw new Error('Impossible de charger les informations des stations');
        }
        const infoData = await infoResponse.json();
        const stationsInfo = infoData.data?.stations || [];
        const statusResponse = await fetch(`${baseUrl}/station_status.json`);
        if (!statusResponse.ok) {
            throw new Error('Impossible de charger le statut des stations');
        }
        const statusData = await statusResponse.json();
        const stationsStatus = statusData.data?.stations || [];
        const statusMap = new Map();
        stationsStatus.forEach(status => {
            statusMap.set(status.station_id, status);
        });
        
        let totalBikes = 0;
        stationsInfo.forEach(stationInfo => {
            const stationId = stationInfo.station_id;
            const stationStatus = statusMap.get(stationId);
            
            if (!stationStatus) {
                return;
            }
            const stationLat = stationInfo.lat;
            const stationLon = stationInfo.lon;
            const name = stationInfo.name || 'Station';
            const availableBikes = stationStatus.num_bikes_available || 0;
            const availableSpots = stationStatus.num_docks_available || 0;
            const isRenting = stationStatus.is_renting === 1;
            const isReturning = stationStatus.is_returning === 1;
            totalBikes += availableBikes;
            const bikeIcon = L.divIcon({
                className: 'bike-marker',
                html: `<div style="background-color: ${availableBikes > 0 ? '#4CAF50' : '#f44336'}; 
                              color: white; 
                              width: 30px; 
                              height: 30px; 
                              border-radius: 50%; 
                              display: flex; 
                              align-items: center; 
                              justify-content: center; 
                              font-weight: bold; 
                              border: 2px solid white; 
                              box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚴</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            let popupContent = `<b>${name}</b><br>`;
            popupContent += ` Vélos disponibles: <strong>${availableBikes}</strong><br>`;
            popupContent += ` Places libres: <strong>${availableSpots}</strong><br>`;            
            if (!isRenting) {
                popupContent += `<span style="color: #f44336;"> Location indisponible</span><br>`;
            }
            if (!isReturning) {
                popupContent += `<span style="color: #f44336;"> Retour indisponible</span><br>`;
            }
            L.marker([stationLat, stationLon], { icon: bikeIcon })
                .addTo(map)
                .bindPopup(popupContent);
        });
        document.getElementById('bikes-available').textContent = totalBikes;
    } catch (error) {
        console.error('Erreur chargement vélos:', error);
        showError('Impossible de charger les stations de vélos. Vérifiez votre connexion.');
    }
}

// Qualité de l'air
async function loadAirQuality() {
    const airQualityEl = document.getElementById('air-quality');
    
    const url = "https://services3.arcgis.com/Is0UwT37raQYl9Jj/arcgis/rest/services/ind_grandest/FeatureServer/0/query?where=lib_zone%3D%27Nancy%27&outFields=*&f=json";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            // 1. Trouver la date d'aujourd'hui (sans les heures/minutes)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // 2. Chercher dans la liste l'élément qui correspond à aujourd'hui
            // date_ech est un timestamp en millisecondes
            let forecast = data.features.find(item => {
                const itemDate = new Date(item.attributes.date_ech);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === today.getTime();
            });
            
            // 3. Si on ne trouve pas "aujourd'hui" (ex: bug date), on prend le dernier élément dispo (le plus récent)
            if (!forecast) {
                // On trie par date pour être sûr d'avoir le dernier
                data.features.sort((a, b) => a.attributes.date_ech - b.attributes.date_ech);
                forecast = data.features[data.features.length - 1];
            }
            
            const attr = forecast.attributes;
            
            // Mise à jour de l'affichage
            const valueEl = airQualityEl.querySelector('.value');
            valueEl.textContent = `Nancy: ${attr.lib_qual || 'Non disponible'}`;
            
            // On utilise la couleur fournie par l'API (coul_qual)
            if (attr.coul_qual) {
                valueEl.style.color = attr.coul_qual;
            } else {
                // Fallback si pas de couleur
                const airCode = attr.code_qual || 2;
                valueEl.style.color = airCode > 3 ? "#f44336" : "#4CAF50";
            }
        } else {
            airQualityEl.querySelector('.value').textContent = 'Nancy: Données indisponibles';
        }
    } catch (error) {
        console.error("Erreur Air:", error);
        airQualityEl.querySelector('.value').textContent = 'Nancy: Erreur API';
    }
}

// Chargement des données météo
async function loadWeather(lat, lon) {
    try {
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation&timezone=Europe/Paris`;
        const response = await fetch(openMeteoUrl);
        
        let temp = 15;
        let windSpeed = 0;
        let rain = 0;
        
        if (response.ok) {
            const data = await response.json();
            temp = data.current?.temperature_2m || 15;
            windSpeed = data.current?.wind_speed_10m || 0; // en km/h
            rain = data.current?.precipitation || 0;
        }
        
        document.getElementById('temperature').textContent = `${Math.round(temp)}°C`;
        document.getElementById('wind').textContent = `${Math.round(windSpeed)} km/h`;
        document.getElementById('rain').textContent = rain > 0 ? `${rain} mm/h` : 'Aucune';
        
    } catch (error) {
        console.error('Erreur chargement météo:', error);
        document.getElementById('temperature').textContent = 'N/A';
        document.getElementById('wind').textContent = 'N/A';
        document.getElementById('rain').textContent = 'N/A';
    }
}

// Affichage d'erreur
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
}

