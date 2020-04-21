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

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);


var carto = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",{
		"attribution": "\u0026copy; \u003ca href=\"http://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"http://cartodb.com/attributions\"\u003eCartoDB\u003c/a\u003e, CartoDB \u003ca href =\"http://cartodb.com/attributions\"\u003eattributions\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
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


var overlayMaps = {
	"<b>Municipios</b>": municipios,
    "<b>Hospitales</b>": hospitales,
	"<b>Centros COVID-19</b>": covid
};

L.control.layers(baseMaps,overlayMaps).addTo (map);

//// Estils de capas

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

////// LEYENDA DE Hospitales
/*
var hospitaleslegend = L.control({position: "bottomleft"});
	hospitaleslegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [1, 2, 3],
			labels = ["<b> ATENCIÓN POR FASE-COVID 19</b>"],
			from, to;
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 0.6];
			labels.push(
				'<i style="background:' + Colorhospital(from + 0.6) + ' "></i> ' + 
				from + (to ? +  to: ' - ') + (to ? +  to: from + 1));
		}
		div.innerHTML = labels.join('<br>');
		return div;
}; hospitaleslegend.addTo(map)

*/

var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Atención COVID-19</h4>";
  div.innerHTML += '<i style="background: #fef0d9"></i><span>Fase 1</span><br>';
  div.innerHTML += '<i style="background: #fc8d59"></i><span>Fase 2</span><br>';
  div.innerHTML += '<i style="background: #990000"></i><span>Fase 3</span><br>';

  return div;
};


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
		layer.bindPopup("<b>Nombre de la unidad :</b>  "+ 
		feature.properties.UNIDAD+"<br><b>Institución :</b> "+
		feature.properties.NOMBRE_INS+"<br><b>Total de camas :</b>  "+
		feature.properties.TOTAL_CAMA+"<br><b>ATENCION COVID-FASE1 :</b> "+
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

/////municipios
L.geoJson(municipios1, {
	style: mun_style
	
}).addTo(municipios);


/////todos los centros médicos
L.geoJson(BD_hospitales, {
	onEachFeature: popUpInfo,
	style: style,
	pointToLayer: function (feature, latlng){
	return L.circleMarker (latlng, {
		radius:5
	});
	}
}).addTo(hospitales);   

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


/*
///// OPCIONES   PARA AGREGAR CSV CON OMNIVORE
/////  OPCION 1

omnivore.csv('https://raw.githubusercontent.com/GMCentroGeo/COVID-19/master/cvd_v3.csv').addTo(hospitales);


/////  OPCION 2
//// OTRA OPCIÓN PARA AGREGAR CSV CON OMNIVORE
  var customLayer = L.geoJson(null, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.Title);
      }
  });

  var runLayer = omnivore.csv('https://raw.githubusercontent.com/GMCentroGeo/COVID-19/master/cvd_v3.csv', null, customLayer)
      .on('ready', function() {
          // http://leafletjs.com/reference.html#map-fitbounds
          map.fitBounds(runLayer.getBounds());
      })
      .addTo(hospitales);
*/


/*
L.geoJson(clues, {
	onEachFeature: popUpInfo,
	style: Styleclues,
	pointToLayer: function (feature, latlng) {
	return L.circleMarker(latlng, {
		radius: calcRadius(feature.properties.mag)
    });
	}
}).addTo(hospitales);  */
/*
L.geoJson(clues2, {
	onEachFeature: popUpInfo,
	style: Styleclues
	
}).addTo(otros);

*/

///// Capa de Huracanes   -->  SE AGREGA CAPA DE HURACANES CON LAS CARACTERISTICAS DE POPUP, COLOR, TAMAÑO
/*
L.geoJson(tormentas1, {
	onEachFeature: popUpHur,
	style: styleh,
	pointToLayer: function (feature, latlng) {
	}
}).addTo(hospitales2);
*/
///// Simbologías   
/*
///SISMOS
var sismolegend = L.control({position: "bottomleft"});
	sismolegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [4.4, 5.0, 5.6, 6.2, 6.8],
			labels = ["<b> Magnitud de los sismos en escala de Richter</b>"],
			from, to;
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 0.6];
			labels.push(
				'<i style="background:' + Colorsismos(from + 0.6) + ' "></i> ' + 
				from + (to ? +  to: ' - ') + (to ? +  to: from + 0.5));
		}
		div.innerHTML = labels.join('<br>');
		return div;
}; 

///CICLONES                                                
var ciclonlegend = L.control({position: "bottomright"});
	ciclonlegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		  div.innerHTML += "<b> Clasificacion de ciclones tropicales</b></br>";
		  div.innerHTML += '<de style="background: #fa9dc2"></de><span>Perturbación tropical</span><br>';
		  div.innerHTML += '<de style="background: #f768a1"></de><span>Depresión tropical</span><br>';
		  div.innerHTML += '<de style="background: #ae017e"></de><span>Tormenta tropical</span><br>';
		  div.innerHTML += '<de style="background: #7a0177"></de><span>Huracán</span><br>';
		  div.innerHTML += '<de style="background: #fcc5c0"></de><span>Evento disipado</span><br>';
		return div;
};

/// PARA APARECER/DESAPARECER SIMBOLOGÍAS

map.on('overlayadd', function (eventLayer) {
	if (eventLayer.name == '<b>Fenómenos Geológicos</b>') {
		sismolegend.addTo(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
		ciclonlegend.addTo(map);
	}
});

map.on('overlayremove', function (eventLayer) {
	if (eventLayer.name =='<b>Fenómenos Geológicos</b>') {
        sismolegend.remove(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
        ciclonlegend.remove(map);
	}	
});
*/