//PARA ACTIVAR MAPA poner a true:
var connectToMaps = true;

var actual_JSON="";
var cities_JSON="";

//MARCA MODO DE FILTRADO ACTUAL
var filteredByPais= true;

//CONTENEDOR DE MAPA
var map;

//LISTAS DE ELEMENTOS ACTUALES
var listaCiclos= [];
var listaPaises=[];

//Lista de marcas en el mapa
var currentMarkers=[];
var currentTags=[];

//NIVEL DE ZOOM, MODIFICAR SEGUN DISPOSITIVO
var zoom = 3;

/**lee los datos del JSON de datos generales**/
function intJSON(callback){

  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType("application/json");
  xhttp.open("GET", "resources/EstructMovilidadesErasmusJSON.json", false);
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(xhttp.responseText);
      }
  };
  xhttp.send(null);
}
/**Lee los datos del JSON de ciudades disponibles**/
function intJSONCities(callback){

  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType("application/json");
  xhttp.open("GET", "resources/cities.json", false);
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(xhttp.responseText);
      }
  };
  xhttp.send(null);
}

/**Crea el mapa**/
function inicializar_mapa() {

  if(window.innerWidth<900){

    console.log("Short");
    zoom=4;
  }
  if(window.innerWidth<500){
    zoom=3;
  }

  if(connectToMaps){
    var mapOptions = {
       center: new google.maps.LatLng(51.725633, 19.430143),
       zoom:zoom,
       mapTypeId: google.maps.MapTypeId.HYBRID
     };
     map = new google.maps.Map(document.getElementById("mapContainer"), mapOptions);
  }else if (!connectToMaps){
    console.log("Mapa desactivado para esta sesion!, activelo en 'code.js'");
  }
}

/**Consigue la lista de Ciclos disponibles en todo el documento**/
function getAllCiclos(){
  var listaCiclos = getCiclos();
  getCountriesByGrado();
}

/**Accede al documento JSON y devuelve un array con los string de ciclo**/
function getCiclos(){
  for (var x in actual_JSON) {
    let cicloAct = actual_JSON[x].ciclo;
    if(cicloAct!= undefined){
      if (listaCiclos.length ==0){
        listaCiclos.push(cicloAct);
      }else{
        let found = false;
        for( var i = 0; i<listaCiclos.length; i++){
          if(listaCiclos[i] == cicloAct){
            found=true;
          }
        }
        if (!found){
          listaCiclos.push(cicloAct);
        }
      }
    }
  }
  return listaCiclos;
}

/**Inicializa la funcionalidad de la pagina**/
function inicializarPag(){

  intJSON(function (response){
    actual_JSON = JSON.parse(response);
  })
  intJSONCities(function (response){
    cities_JSON = JSON.parse(response);
  })
  inicializar_mapa();

  getAllCiclos();

  generateComboCiclos();

  onChangeGrado()

}

/**Consigue la lista de paises de un ciclo**/
function getCountriesByGrado(){
  listaPaises=[];
  let combo = document.getElementById("movilidadCombo");
  if(combo.value == 'Todos'){
    for (var x in actual_JSON) {
      let paisAct = actual_JSON[x].pais;
      if (paisAct!= undefined){
        if(listaPaises.length==0){
          listaPaises.push(paisAct);
        }else{
          let found = false;
          for( var i = 0; i<listaPaises.length; i++){
            if(listaPaises[i] == paisAct){
              found=true;
            }
          }
          if (!found){
            listaPaises.push(paisAct);
          }
        }
      }
    }
  }else{
    for (var x in actual_JSON) {
      let paisAct = actual_JSON[x].pais;
      if (paisAct!= undefined){
        if(listaPaises.length==0){
          listaPaises.push(paisAct);
        }else{
          let found = false;
          for( var i = 0; i<listaPaises.length; i++){
            if(listaPaises[i] == paisAct){
              found=true;
            }
          }
          if (!found && actual_JSON[x].tipo == combo.value){
            listaPaises.push(paisAct);
          }
        }
      }
    }
  }
}
/**Consigue la lista de ciclos en un grado**/
function getCiclosByGrado(){
  listaCiclos = [];
  let combo = document.getElementById("movilidadCombo");
  if(combo.value == 'Todos'){
    listaCiclos = getCiclos();
  }
  else{
    for (var x in actual_JSON) {
      let gradoAct = actual_JSON[x].ciclo;
      if (gradoAct!= undefined){
        if(listaCiclos.length==0){
          listaCiclos.push(gradoAct);
        }else{
          let found = false;
          for( var i = 0; i<listaCiclos.length; i++){
            if(listaCiclos[i] == gradoAct){
              found=true;
            }
          }
          if (!found && actual_JSON[x].tipo == combo.value){
            listaCiclos.push(gradoAct);
          }
        }
      }
    }
  }
}
/**Genera el combo de ciclos dependiente de paises**/
function generateComboCiclos(){
  let filtersDiv = document.getElementById("selectedFilters");

  let form = document.createElement("form");
  form.setAttribute('id','byCicloFilter');

  for (let i = 0; i< listaCiclos.length; i++){

    let div = document.createElement("div");

    let input= document.createElement('input');
    input.setAttribute('type','checkbox');
    input.setAttribute('onchange','onChangeFiltroCiclos()');

    input.id=listaCiclos[i];

    let text = document.createTextNode(listaCiclos[i]);

    div.appendChild(text);
    div.appendChild(input);

    form.appendChild(div);
  }

  let sub2 = document.createElement("button");
  sub2.setAttribute("onclick","markAll()");
  sub2.appendChild(document.createTextNode("Alternar todos"));


  filtersDiv.innerHTML="";
  filtersDiv.appendChild(form);
  filtersDiv.appendChild(sub2);
}
/**Genera el combo desde la lista de paises**/
function generateComboPaises(){
  let filtersDiv = document.getElementById("selectedFilters");
  let button = document.createElement("Button");

  button.setAttribute("onClick","aceptarByPais()");
  button.setAttribute("value", "aceptar");
  button.appendChild(document.createTextNode("Aceptar"));

  filtersDiv.innerHTML="";

  let combo = document.createElement("select");

  combo.setAttribute("id","comboPaises");

  for(let i = 0; i<listaPaises.length; i++){
    let pais = document.createElement("option");
    pais.text=listaPaises[i];
    combo.add(pais);
  }
  filtersDiv.appendChild(combo);
  filtersDiv.appendChild(button);
}
/**Funcion de evento de cambio de grado**/
function onChangeGrado(){
  let selectFilter = document.getElementById("selectFilter");

  clearMarkers();

  if(selectFilter.checked){
    getCountriesByGrado();
    generateComboPaises();
  }else{
    getCiclosByGrado();
    generateComboCiclos();

  }
}
/**funcion de evento de cambio en los checkbox de ciclo**/
function changeFilterOption(){
  let selectFilter = document.getElementById("selectFilter");
  let filterDiv = document.getElementById("selectedFilters");

  clearMarkers();

  if(selectFilter.checked){
    filteredByPais=true;
    filterDiv.innerHTML="";
    getCountriesByGrado();
    generateComboPaises();
  }

  else{
    filteredByPais=false;
    filterDiv.innerHTML="";
    getCiclosByGrado();
    generateComboCiclos();
  }
}
/**consigue la lista de ciclos marcada**/

function getSelectedCheckboxes(){
  let form = document.getElementById("byCicloFilter");
  let formChildren = form.childNodes;
  let allCheckboxes = [];

  let criteria = []


  for (let i =0; i < formChildren.length; i++){
    let currentCheck = formChildren[i].childNodes[1];
    if(currentCheck.checked){
      criteria.push(currentCheck.id);
    }
  }
  return criteria;
}

/**se lanza al cambiar las condiciones de filtrado**/
function onChangeFiltroCiclos(){
  let criterios = getSelectedCheckboxes();
  clearMarkers();
  getCuratedMapContent(criterios);

}

function aceptarByPais(){
  let div = document.getElementById("selectedFilters");

  let newCombo =document.getElementById("cicloCombo");

  if(newCombo==undefined){
    newCombo= document.createElement("select");
    newButton= document.createElement("button");
    newButton.appendChild(document.createTextNode("Aceptar"));

    newCombo.setAttribute("id","cicloCombo");
    newButton.setAttribute("onClick","addMarkersByCountry()");


    div.appendChild(newCombo);
    div.appendChild(newButton);
  }

  newCombo.innerHTML ="";

  getCiclosByCountryAndGrado();
}
/**Consigue la lista de ciclos disponibles filtrando por pais y grado**/

function getCiclosByCountryAndGrado(){
  let combo = document.getElementById("comboPaises");
  let combo2 = document.getElementById("cicloCombo")
  let tipoCiclo = document.getElementById("movilidadCombo").value;
  let ciclosDentro =  [];

  for(var x in actual_JSON){
    let mismoGrado = false;
    let notIn = true;

    for(let i = 0; i<ciclosDentro.length; i++){
      if( ciclosDentro[i] == actual_JSON[x].ciclo){
        notIn = false;
      }
    }

    if( tipoCiclo == "Todos"){
      mismoGrado=true;
    }
    else if(tipoCiclo == actual_JSON[x].tipo){
      mismoGrado=true;
    }

    if(actual_JSON[x].pais == combo.value && mismoGrado && notIn ){

      ciclosDentro.push(actual_JSON[x].ciclo);

      let newOption = document.createElement("option");
      newOption.text = actual_JSON[x].ciclo;
      combo2.appendChild(newOption);
    }
  }
}
/**crea los marcadores, filtrando por pais**/
function addMarkersByCountry(){

  clearMarkers();

  let combo = document.getElementById("comboPaises");
  let tipoCiclo = document.getElementById("movilidadCombo").value;
  let ciclo = document.getElementById("cicloCombo").value;

  for(var x in actual_JSON){
    let mismoGrado = false;

    if( tipoCiclo == "Todos"){
      mismoGrado=true;
    }
    else if(tipoCiclo == actual_JSON[x].tipo){
      mismoGrado=true;
    }

    if(actual_JSON[x].pais == combo.value && mismoGrado && actual_JSON[x].ciclo == ciclo){
      let position = composeCityData(actual_JSON[x].ciudad);
      let mapCanvas = document.getElementById("map");
      let marker = new google.maps.Marker({position:position});
      marker.setMap(map);

      let ciudadAct = actual_JSON[x].ciudad;

      currentMarkers.push(marker);

      marker.set("id", ciudadAct);

      marker.addListener('click', function() {
        let city = this.get("id");
        console.log(city);
        let string = ciclosPorCiudad(city);
        var infowindow = new google.maps.InfoWindow({
          content: string
        });
        currentTags.push(infowindow);

        infowindow.open(map,this);
      });
    }
  }
}

function ciclosPorCiudad(ciudad){
  let salida = "<h3>"+ciudad+"</h3>";
  for(var x in actual_JSON){
    if(actual_JSON[x].ciudad == ciudad ){
      salida = salida+"<b>"+actual_JSON[x].tipo+"</b> <u>"+actual_JSON[x].ciclo+"</u><br>";
    }
  }
  return salida;
}

/**elimina todos los marcadores**/
function clearMarkers(){
  for (let i = 0; i < currentMarkers.length; i++) {
    currentMarkers[i].setMap(null);
  }
  for(let i = 0; i< currentTags.length; i++){
    currentTags[i].close;
  }
  currentMarkers =[];
  currentTags =[];
}

/**Crea los marcadores filtrados por ciclo**/
function getCuratedMapContent(criterios){

  clearMarkers();

  for(var x in actual_JSON){
    for(let j = 0; j<criterios.length; j++){
      if (actual_JSON[x].ciclo==criterios[j]){

        let position = composeCityData(actual_JSON[x].ciudad);
        var mapCanvas = document.getElementById("map");
        var marker = new google.maps.Marker({position:position});
        marker.setMap(map);

        var ciudadAct = actual_JSON[x].ciudad;

        currentMarkers.push(marker);

        marker.set("id", ciudadAct);

        marker.addListener('click', function() {
          let city = this.get("id");
          console.log(city);
          let string = ciclosPorCiudad(city);
          var infowindow = new google.maps.InfoWindow({
            content: string
          });
          currentTags.push(infowindow);

          infowindow.open(map,this);
        });



      }
    }
  }
}

/**devuelve un objeto position desde los datos del objeto JSON**/
function composeCityData(city){
  for(var x in cities_JSON){
    if(x==city){
      return new google.maps.LatLng(cities_JSON[x].latitude,cities_JSON[x].longitude);
    }
  }
}
/**marca todas las ciudades disponibles**/
function verTodasLasCiudades(){
    for(var x in cities_JSON){
      let position =  new google.maps.LatLng(cities_JSON[x].latitude,cities_JSON[x].longitude);
      var mapCanvas = document.getElementById("map");
      var marker = new google.maps.Marker({position:position});

      marker.setMap(map);
      marker.set("id",x);

      currentMarkers.push(marker);

      marker.addListener('click', function() {

        let city = this.get("id");
        console.log(city);
        let string = ciclosPorCiudad(city);
        var infowindow = new google.maps.InfoWindow({
          content: string
        });
        currentTags.push(infowindow);

        infowindow.open(map,this);
      });
    }
}

/**evento del boton Ver Todo**/
function markAll(){
  let form = document.getElementById("byCicloFilter");
  let formChildren = form.childNodes;

  console.log(formChildren);

  for (let i =0; i < formChildren.length; i++){
    formChildren[i].children[0].checked = !formChildren[i].children[0].checked;
    console.log(formChildren[i].children[0]);
  }

  onChangeFiltroCiclos();

}
