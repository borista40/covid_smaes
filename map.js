///// Mapas base

var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
{attribution: 'Map Data &copy; OpenstreetMap contributors'}); 

var terrain = new L.StamenTileLayer("terrain");

var map = L.map('map',{
	center:[21.8818, -102.291],
	zoom:6,
    layers:[terrain]
});

var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);


var carto = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",{
		"attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"http://cartodb.com/attributions\"\u003eCartoDB\u003c/a\u003e, CartoDB \u003ca href =\"http://cartodb.com/attributions\"\u003eattributions\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
).addTo (map);

var baseMaps = {
	"<b>Mapa de calles</b>": googleStreets,
	"<b>Imagen de satélite</b>": googleSat,
	"<b>Mapa de relieve</b>": googleTerrain,
	"<b>Mapa de terreno</b>": terrain, 
	"<b>Mapa en tonos claros</b>": carto,
};

/////controladores de capas 

var hospitales = L.layerGroup([]);

var covid = L.layerGroup([]);
var municipios = L.layerGroup([]);
var estadopob = L.layerGroup([]);
var covidf1 = L.layerGroup([]);
var covidf2 = L.layerGroup([]);
var covidf3 = L.layerGroup([]);

var overlayMaps = {
	"<b>Población por estados</b>": estadopob,
	"<b>Municipios</b>": municipios,
    "<b>Hospitales</b>": hospitales,
	"<b>Centros COVID-19</b>": covid,
	"<b>Centros COVID-19 Fase 1</b>": covidf1,
	"<b>Centros COVID-19 Fase 2</b>": covidf2,
	"<b>Centros COVID-19 Fase 3</b>": covidf3
};

L.control.layers(baseMaps,overlayMaps).addTo (map);




///// estilo puntos de hospital

function Colorhospital(d) {
	return  d == 1  ? '#fef0d9' :
		d == 2 ? '#fc8d59' :
		d == 3   ? '#990000' :
		'#990000';
}

function style(feature) {
	return {
		weight: 1,
		opacity: 1,
		color: 'black',
		dashArray: '2.5',
		fillOpacity: 0.9,
		fillColor: Colorhospital(feature.properties.ESTADO_FAS)
	};
}

var minValue = 2;
var minRadius = 2;

function calcRadius(val) {
    return 2 * Math.pow(val/minValue, 2) * minRadius;  
}


//// Estilo estados y población

function edocolor(d) {
    return d > 12268096 ? '#d73027' :
           d > 9360329  ? '#fdae61' :
           d > 6452561  ? '#e0f3f8' :
           d > 3544794  ? '#74add1' :
           d > 637025   ? ' #4575b4' :
                      '#4575b4';
}

//// Estilos de capas

function edo_style(feature) {
    return {
        fillColor: 'white',
        weight: 1.5,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.35
    };
}


function mun_style(feature) {
    return {
        fillColor: 'white',
        weight: 0.5,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.35
    };
}

function edopob_style(feature) {
    return {
        fillColor: edocolor(feature.properties.Pob_Total),
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.8
    };
}

//// estilo puntos por fase
var colorfase1 = {
    "color": "#ffeda0", 
    "weight": 5,
    "opacity": 0.8
};

var colorfase2 = {
    "color": "#fc8d59",
    "weight": 5,
    "opacity": 0.5
};

var colorfase3 = {
    "color": "#990000",
    "weight": 5,
    "opacity": 0.65
};


////// LEYENDA DE Hospitales


var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Atención COVID-19</h4>";
  div.innerHTML += '<i style="background: #fef0d9"></i><span>Fase 1</span><br>';
  div.innerHTML += '<i style="background: #fc8d59"></i><span>Fase 2</span><br>';
  div.innerHTML += '<i style="background: #990000"></i><span>Fase 3</span><br>';

  return div;
};


////// LEYENDA DE Población por estados


var legendest = L.control({ position: "bottomleft" });

legendest.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Población Total</h4>";
  div.innerHTML += '<i style="background: #4575b4"></i><span>637,026 - 3,544,793</span><br>';
  div.innerHTML += '<i style="background: #74add1"></i><span>3,544,794 - 6,452,560</span><br>';
  div.innerHTML += '<i style="background: #e0f3f8"></i><span>6,452,561 - 9,360,328</span><br>';
  div.innerHTML += '<i style="background: #fdae61"></i><span>9,360,329 - 12,268,095</span><br>';
  div.innerHTML += '<i style="background: #d73027"></i><span>12,268,096 - 15,175,862</span><br>';
  return div;
};


//// Estilos de capas



////apaga/enciende leyenda al activar capa COVID-19
map.on('overlayadd', function (eventLayer) {
	if (eventLayer.name == '<b>Centros COVID-19</b>') {
		legend.addTo(map);
    } 
});

map.on('overlayremove', function (eventLayer) {
	if (eventLayer.name =='<b>Centros COVID-19</b>') {
        legend.remove(map);
    } 	
});

////apaga/enciende leyenda al activar capa ESTADOS-POBLACIÓN
map.on('overlayadd', function (eventLayer) {
	if (eventLayer.name == '<b>Población por estados</b>') {
		legendest.addTo(map);
    } 
});

map.on('overlayremove', function (eventLayer) {
	if (eventLayer.name =='<b>Población por estados</b>') {
        legendest.remove(map);
    } 	
});



//// Funciones de información por municipio
/*
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });
	info.update(layer.feature.properties);
}

function resetHighlight(e) {
    municipios.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

municipios = L.geoJson(municipios_gro, {
	style: style_adap,
	onEachFeature: onEachFeature
}).addTo(map);

////// Control de información de municipios

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Información por municipio</h4>' +  (props ?
        '<b>' + props.NOMGEO + '</b><br />' + 
		'<br><b>Capacidad de Adaptación:</b> ' + props.CAP_ADAP  +
		'<br><b>Riesgo a Ciclones Tropicales:</b> ' + props.RCla_CicTr  
		: 'Pase el cursor sobre un municipio');
};

info.addTo(map);
*/


/////Simbología de Mapa municipios   ****GRADO DE VULNERABILIDAD ****
/*
var munlegend = L.control({position: "topleft"});
	munlegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		  div.innerHTML += "<b> Grado de vulnerabilidad </b></br>";
		  div.innerHTML += '<i style="background: #9e9ac8"></i><span>Baja</span><br>';
		  div.innerHTML += '<i style="background: #6a51a3"></i><span>Media</span><br>';
		  div.innerHTML += '<i style="background: #4a1486"></i><span>Alta</span><br>';
		return div;
};

munlegend.addTo(map);
*/
///// POPup - Ventanas informativas

function popUpInfo (feature, layer) {
	if (feature.properties && feature.properties.UNIDAD){
		layer.bindPopup("<b>NOMBRE DE LA UNIDAD :</b>  "+ 
		feature.properties.UNIDAD+"<br><b>INSTITUCIÓN :</b> "+
		feature.properties.NOMBRE_INS+"<br><b>TOTAL DE CAMAS :</b>  "+
		feature.properties.TOTAL_CAMA+"<br><b>NÚMERO DE CASOS POR MUNICIPIO :</b> "+
		feature.properties.RES_MUN_18+"<br><b>ATENCION COVID-FASE1 :</b> "+
		feature.properties.FASE_1_COV+"<br><b>ATENCION COVID-FASE 2 :</b> "+
		feature.properties.FASE_2_COV+"<br><b>ATENCION COVID-FASE 3 :</b> "+
		feature.properties.FASE_3_COV+"<br><b>ESTADO :</b> "+
		feature.properties.ESTADO+"<br><b>MUNICIPIO :</b> "+
		feature.properties.MUNICIPIO+"<br><b>POBLACIÓN ESTATAL :</b> "+
		feature.properties.POB_ENT+"<br><b>POBLACIÓN MUNICIPAL :</b> "+
		feature.properties.POB_MUN);
	}
}

///// POPup de puntos por fase

function popUpInfo2 (feature, layer) {
	if (feature.properties && feature.properties.UNIDAD){
		layer.bindPopup("<b>NOMBRE DE LA UNIDAD :</b>  "+ 
		feature.properties.UNIDAD+"<br><b>NÚMERO DE CASOS POR MUNICIPIO :</b> "+
		feature.properties.RES_MUN_18+"<br><b>ATENCION COVID-FASE1 :</b> "+
		feature.properties.FASE_1_COV+"<br><b>ATENCION COVID-FASE 2 :</b> "+
		feature.properties.FASE_2_COV+"<br><b>ATENCION COVID-FASE 3 :</b> "+
		feature.properties.FASE_3_COV+"<br><b>ESTADO :</b> "+
		feature.properties.ESTADO+"<br><b>MUNICIPIO :</b> "+
		feature.properties.MUNICIPIO+"<br><b>POBLACIÓN ESTATAL :</b> "+
		feature.properties.POB_ENT+"<br><b>POBLACIÓN MUNICIPAL :</b> "+
		feature.properties.POB_MUN);
	}
}


///// Capa de hospitales y municipios -->  SE AGREGA CAPA CON LAS CARACTERISTICAS DE POPUP, COLOR, TAMAÑO
/////estados
L.geoJson(estados, {
	style: edo_style
}).addTo(map);

/////estados-población
L.geoJson(estados, {
	style: edopob_style
}).addTo(estadopob);

/////municipios
L.geoJson(municipios1, {
	style: mun_style
	
}).addTo(municipios);


/////todos los centros médicos
/*
L.geoJson(BD_hospitales, {
	onEachFeature: popUpInfo,
	style: style,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:5
	});
	}
}).addTo(hospitales);   */

/////centros médicos que dan atención al COVID-19
L.geoJson(hospitales1, {
	onEachFeature: popUpInfo,
	style: style,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:10
	});
	}
}).addTo(covid); 	


/////centros médicos que dan atención al COVID-19 en la fase 1
L.geoJson(hospitales1, {
	filter:function (feature,layer){
      if (feature.properties.ESTADO_FAS == 1) {return  'true'}
     },
	onEachFeature: popUpInfo2,
	style: colorfase1,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:10
	});
	}
}).addTo(covidf1); 	

/////centros médicos que dan atención al COVID-19 en la fase 2
L.geoJson(hospitales1, {
	filter:function (feature,layer){
      if (feature.properties.ESTADO_FAS == 2) {return  'true'}
     },
	onEachFeature: popUpInfo2,
	style: colorfase2,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:10
	});
	}
}).addTo(covidf2); 	

/////centros médicos que dan atención al COVID-19 en la fase 3
L.geoJson(hospitales1, {
	filter:function (feature,layer){
      if (feature.properties.ESTADO_FAS == 3) {return  'true'}
     },
	onEachFeature: popUpInfo2,
	style: colorfase3,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:10
	});
	}
}).addTo(covidf3); 
