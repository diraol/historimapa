google.load('maps', '3', {
  other_params: 'sensor=false'
});

var Map = {
    
    imgPath         : '/assets/img/',
    jsPath          : '/assets/js/',
    editMode        : false,
    data            : null,
    
    map             : null,
    mapContainer    : null,
    curRoute        : null,
    pos_br          : null,
    pos             : null,
    
    _mapDiv         : null,
    _reliefMapType  : null,
    markerClusterer : null,
    imageUrl        : 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&' + 'chco=FFFFFF,008CFF,000000&ext=.png',

    zoom            : null,
    size            : 25,
    style           : null,

    init : function (dados) {

        var options, 
            mapTypeIds = [], 
            type;
        
        this.data = dados;
        pos_br = new google.maps.LatLng(-14.264383,-51.943359);
        pos = pos_br;
            
        this.mapContainer = $('#map');
        
        mapTypeIds.push(google.maps.MapTypeId["HYBRID"]);
        mapTypeIds.push("OSM");
        
        //Defining default options
        options = {
            zoom: 5,
            center: pos_br,
            mapTypeControl: true,
            mapTypeControlOptions: {
                mapTypeIds: mapTypeIds
            },
            panControl: true,
            zoomControl: true,
            zoomControlOptions: {position: google.maps.ControlPosition.TOP_LEFT},
            streetViewControl: false,
            streetViewControlOptions: {position: google.maps.ControlPosition.TOP_LEFT},
            scaleControl: true,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            styles: [{
                featureType: "road",
                stylers: [{visibility: "off"}]
            }],
        };
        
        this.map = new google.maps.Map(this.mapContainer[0], options);

        // Try HTML5 geolocation
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
            });
        };

        this.map.setCenter(pos);
        
        // OSM Maptype
        this.map.mapTypes.set("OSM", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256), 
            name: "OSM",
            alt: 'Open Street Map',
            maxZoom: 18
        }));
        
        // Relief as overlay map type
        this._reliefMapType = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                if (zoom <= this.maxZoom) {
                    return 'http://tiles2.openpistemap.org/landshaded/' + zoom + "/" + coord.x + "/" + coord.y + ".png";
                }
                return '';
            },
            tileSize: new google.maps.Size(256, 256),
            name: "Relief",
            maxZoom: 16
        });
        
        // define base map type, which are suitable for this overlay map type
        this._reliefMapType.baseMapTypes = [google.maps.MapTypeId.ROADMAP, 'OSM'];

        this._refreshMap();
        
    },

    _refreshMap: function() {
        if (this.markerClusterer) {
            this.markerClusterer.clearMarkers();
        }

        var markers = [],
            markerImage,
            zoom,
            size,
            style,
            LatLng,
            marker;

        markerImage = new google.maps.MarkerImage(this.imageUrl,
            new google.maps.Size(24, 32));

        for (var i = 0; i < this.data.length; ++i) {
            latLng = new google.maps.LatLng(this.data[i].latitude,
                this.data[i].longitude)
          
            marker = this._createMarker(
                        this.data[i].titulo,
                        this.data[i].local,
                        latLng, 
                        this.map, 
                        this.data[i].video_src,
                        this.data[i].texto,
                        markerImage
                    );
          
            markers.push(marker);
        }

        this.markerClusterer = new MarkerClusterer(this.map, markers, {
            maxZoom: this.zoom,
            gridSize: this.size,
           // styles: marker_styles[this.style]
        });
    },

    _clearClusters: function(e) {
        e.preventDefault();
        e.stopPropagation();
        markerClusterer.clearMarkers();
    },

    _createMarker: function (titulo, local, latLng, map, video_src, texto, markerImage) {
        var marker = new google.maps.Marker({
                position: latLng,
                draggable: true,
                icon: markerImage,
                title: titulo
            });

        google.maps.event.addListener(marker, 'click', function() {
            showDataBox(local, video_src, texto); 
        });

        return marker;
    }
};
