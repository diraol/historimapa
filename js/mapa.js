google.load('maps', '3', {
  other_params: 'sensor=false'
});

$(document).ready(function() {
    //$.getJson('dados/data.json', function(data) {
        Map.init(data);
    //});
    updateVideoSize();
});

var marker_styles = [[{
  url: '../images/people35.png',
  height: 35,
  width: 35,
  anchor: [16, 0],
  textColor: '#ff00ff',
  textSize: 10
}, {
  url: '../images/people45.png',
  height: 45,
  width: 45,
  anchor: [24, 0],
  textColor: '#ff0000',
  textSize: 11
}, {
  url: '../images/people55.png',
  height: 55,
  width: 55,
  anchor: [32, 0],
  textColor: '#ffffff',
  textSize: 12
}], [{
  url: '../images/conv30.png',
  height: 27,
  width: 30,
  anchor: [3, 0],
  textColor: '#ff00ff',
  textSize: 10
}, {
  url: '../images/conv40.png',
  height: 36,
  width: 40,
  anchor: [6, 0],
  textColor: '#ff0000',
  textSize: 11
}, {
  url: '../images/conv50.png',
  width: 50,
  height: 45,
  anchor: [8, 0],
  textSize: 12
}], [{
  url: '../images/heart30.png',
  height: 26,
  width: 30,
  anchor: [4, 0],
  textColor: '#ff00ff',
  textSize: 10
}, {
  url: '../images/heart40.png',
  height: 35,
  width: 40,
  anchor: [8, 0],
  textColor: '#ff0000',
  textSize: 11
}, {
  url: '../images/heart50.png',
  width: 50,
  height: 44,
  anchor: [12, 0],
  textSize: 12
}]];


var edadosMapStyle = [
    /*{
        featureType: '',
        elementType: '',
        stylers: [
            {color: ''},
            {hue: ''},
            {saturation: ''},
            {lightness: ''},
            {gamma: ''},
            {visibility: ''},
            {weight: ''}
        ]
    },*/
    {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
            {visibility: 'on'},
        ]
    },
    {
        featureType: 'road',
        elementType: 'all',
        stylers: [
            {visibility: 'off'},
        ]
    }

]

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
            type,
            refresh, //DELETAR
            clear; //DELETAR
        
        this.data = dados;
        
        pos_br = new google.maps.LatLng(-14.264383,-51.943359);
        pos = pos_br;
            
        this.mapContainer = $('#map');
        
        //Adding default MapTypes
        //for(type in google.maps.MapTypeId) {
        //    mapTypeIds.push(google.maps.MapTypeId[type]);
        //}

        mapTypeIds.push(google.maps.MapTypeId["HYBRID"]);
        mapTypeIds.push("OSM");
        
        //Defining default options
        options = {
            zoom: 5,
            center: pos_br,
            mapTypeControl: true,
            mapTypeControlOptions: {
                //style: google.maps.MapTypeControlStyle.DEFAULT, //DROPDOWN_MENU  HORIZONTAL_BAR
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
        //this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(Map.Controls.ReliefCtrl.getCrontrol());

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
            tileSize: new google.maps.Size(256, 256), //TODO: Testar outros tamanhos
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
            tileSize: new google.maps.Size(256, 256), //TODO: Testar outros tamanhos
            name: "Relief",
            maxZoom: 16
        });
        
        // define base map type, which are suitable for this overlay map type
        this._reliefMapType.baseMapTypes = [google.maps.MapTypeId.ROADMAP, 'OSM'];

        //Map.Controls.ReliefCtrl.toggleRelief();
        
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

        for (var i = 0; i < 1000; ++i) {
            latLng = new google.maps.LatLng(this.data.photos[i].latitude,
                this.data.photos[i].longitude)
          
            marker = this._createMarker(
                        this.data.photos[i].owner_name, 
                        latLng, 
                        this.map, 
                        this.data.photos[i].photo_file_url, 
                        markerImage
                    );
          
            markers.push(marker);
        }

        this.markerClusterer = new MarkerClusterer(this.map, markers, {
            maxZoom: this.zoom,
            gridSize: this.size,
            styles: marker_styles[this.style]
        });
    },

    _clearClusters: function(e) {
        e.preventDefault();
        e.stopPropagation();
        markerClusterer.clearMarkers();
    },

    _createMarker: function (owner_name, latLng, map, photo_url, markerImage) {
        var media = "<img src='" + photo_url + "'/>",
            marker = new google.maps.Marker({
                position: latLng,
                draggable: true,
                icon: markerImage,
                title: owner_name
            });

        google.maps.event.addListener(marker, 'click', function() {
            document.getElementById("marker-video").innerHTML = media;
        });

        return marker;
    }

};

function updateVideoSize() {
    var video_proportion = 1.78,
        video_div_width = document.getElementById("marker-video").offsetWidth - 6,
        marker_content_div_width = document.getElementById("marker-content").offsetWidth,
        text_div_width = marker_content_div_width - video_div_width - 14,
        box_height = video_div_width/video_proportion;

    $("#current-video")[0].setAttribute("width", video_div_width);
    $("#current-video")[0].setAttribute("height", box_height);
    $("#marker-video").css("height", box_height + "px");
    $("#marker-text").css("height", box_height + "px");
    $("#marker-text").css("width", text_div_width + "px");
    
    //if (video_width >= 1280){
    //    var size = {
    //        'video' : {
    //            'width': 1280,
    //            'height': 720
    //        },
    //        'text' : {
    //            'width': ,
    //            'height': 720
    //        }
    //    };
    //} else if (video_width >= 853) {
    //    var size = {
    //        'video' : {
    //            'width': 853
    //            'height': 480
    //        },
    //        'text' : {
    //            'width': ,
    //            'height': 480
    //        }
    //    };
    //} else if (video_width >= 640) {
    //    var size = {
    //        'video' : {
    //            'width': 640
    //            'height': 360
    //        },
    //        'text' : {
    //            'width': ,
    //            'height': 360
    //        }
    //    };
    //} else {
    //    var size = {
    //        'video' : {
    //            'width': 560
    //            'height': 315
    //        },
    //        'text' : {
    //            'width': ,
    //            'height': 315
    //        }
    //    };
    //
    //}
}


function buildInfoWindow(dataDict){
    // dataDict = {
    //      'imagem': '',
    //      'video': '',
    //      'texto': '',
    //      'link': ''
    // }
    return dataDict;
    var contentString = '<div id="infoContainer">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
        '<div id="bodyContent">'+
        '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
        'sandstone rock formation in the southern part of the '+
        'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
        'south west of the nearest large town, Alice Springs; 450&#160;km '+
        '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
        'features of the Uluru - Kata Tjuta National Park. Uluru is '+
        'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
        'Aboriginal people of the area. It has many springs, waterholes, '+
        'rock caves and ancient paintings. Uluru is listed as a World '+
        'Heritage Site.</p>'+
        '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
        'http://en.wikipedia.org/w/index.php?title=Uluru</a> '+
        '(last visited June 22, 2009).</p>'+
        '</div>'+
        '</div>';
    return contentString 
    
}


$(window).resize(function() {
    updateVideoSize();
});
