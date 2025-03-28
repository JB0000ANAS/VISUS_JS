// histogram.js

var marginHist = {top: 20, right: 30, bottom: 40, left: 50};
var widthHist = 500 - marginHist.left - marginHist.right;
var heightHist = 290 - marginHist.top - marginHist.bottom;

var svgHist;
var scaleXHist = d3.scaleLinear();
var scaleYHist = d3.scaleLinear();

var xAxisHist = d3.axisBottom(scaleXHist);
var yAxisHist = d3.axisLeft(scaleYHist);

var gxAxisHist;
var gyAxisHist;

var dataHist;
var attHist;

var classes;
var nbClasses = 15; // Valeur initiale

var bars;

function initHistogram(svg, w, h, d, a){
    svgHist = svg
        .attr("width", w)
        .attr("height", h);
    
    // Créer un groupe pour le tracé avec les marges
    var g = svgHist.append("g")
        .attr("transform", `translate(${marginHist.left},${marginHist.top})`);
    
    dataHist = d;
    attHist = a;

    /*
     * Axe X
     */
    scaleXHist.domain([d3.min(d, function(d) { return d[a]; }), 
                       d3.max(d, function(d) { return d[a]; })]);
    scaleXHist.range([0, widthHist]);  
    
    gxAxisHist = g.append("g")
        .attr("transform", `translate(0, ${heightHist})`)
        .call(xAxisHist);
    
    /*
     * Création d'un tableau "classes" contenant des objets décrivant chaque classe
     */
    
    classes = [];        
    for(let i=0 ; i<nbClasses ; i++){
        var minX = i * (widthHist / nbClasses);
        var maxX = (i + 1) * (widthHist / nbClasses);
        classes[i] = {"id":i, "minX":minX, "maxX":maxX, "absfrequency":0, "density":0};
    }

    recalculateClassesInitial();
    
    /*
     * Axe Y
     */
    scaleYHist.domain([0, d3.max(classes, function(d) { return d.density; })]);
    scaleYHist.range([heightHist, 0]);
            
    gyAxisHist = g.append("g")
        .call(yAxisHist);
    
    /*
     * Bars
     */
    
    bars = g.selectAll(".bars")
        .data(classes)
        .enter().append("rect");    

    bars.attr("stroke", "#aaaaaa")
        .attr("stroke-width", 1)
        .attr("fill", "#dddddd")
        .attr("x", function(d) { return d.minX; })
        .attr("y", function(d) { return scaleYHist(d.density); })
        .attr("width", function(d) { return d.maxX - d.minX - 1; }) // -1 pour espacer légèrement les barres
        .attr("height", function(d) { return heightHist - scaleYHist(d.density); });
}

// Fonction initiale de calcul des classes
function recalculateClassesInitial() {
    var maxdensity = 0;
    var anySelected = dataHist.some(d => d.selected);
    for(let i=0 ; i<nbClasses ; i++){
        classes[i].absfrequency = 0;
        var minV = scaleXHist.invert(classes[i].minX);
        var maxV = scaleXHist.invert(classes[i].maxX);
        for(let j=0 ; j<dataHist.length ; j++){
            if(parseFloat(dataHist[j][attHist]) >= minV && parseFloat(dataHist[j][attHist]) <= maxV){
                if(!anySelected || dataHist[j].selected){
                    classes[i].absfrequency +=1;
                }
            }
        }
        classes[i].density = classes[i].absfrequency / (maxV - minV);
        if(classes[i].density > maxdensity) maxdensity = classes[i].density;
    }
    // Mettre à jour le domaine de l'axe Y après calcul initial
    scaleYHist.domain([0, maxdensity]);
}

// Fonction pour recalculer les classes et densités lors d'une mise à jour
function recalculateClasses() {
    var anySelected = dataHist.some(d => d.selected);
    // Réinitialisation des classes
    for(let i=0 ; i<nbClasses ; i++){
        classes[i].absfrequency = 0;
        var minV = scaleXHist.invert(classes[i].minX);
        var maxV = scaleXHist.invert(classes[i].maxX);
        for(let j=0 ; j<dataHist.length ; j++){
            if(parseFloat(dataHist[j][attHist]) >= minV && parseFloat(dataHist[j][attHist]) <= maxV){
                if(anySelected ? dataHist[j].selected : true){
                    classes[i].absfrequency +=1;
                }
            }
        }
        classes[i].density = classes[i].absfrequency / (maxV - minV);
    }

    // Trouver la densité maximale pour ajuster l'axe Y
    var maxdensity = d3.max(classes, function(d) { return d.density; });
    scaleYHist.domain([0, maxdensity]);

    // Mettre à jour l'axe Y avec transition
    gyAxisHist.transition()
        .duration(1000)
        .call(yAxisHist);
}

function updateHistX(att) {
    // Mise à jour de l'attribut X de l'histogramme
    attHist = att;

    // Mise à jour du domaine de l'échelle X
    scaleXHist.domain([
        d3.min(dataHist, function(d) { return d[attHist]; }),
        d3.max(dataHist, function(d) { return d[attHist]; })
    ]);

    // Mise à jour de l'axe X avec transition
    gxAxisHist.transition()
        .duration(1000)
        .call(xAxisHist);

    // Recalcul des classes
    recalculateClasses();

    // Mise à jour des barres de l'histogramme avec transition
    bars.transition()
        .duration(1000)
        .attr("x", function(d) { return d.minX; })
        .attr("y", function(d) { return scaleYHist(d.density); })
        .attr("height", function(d) { return heightHist - scaleYHist(d.density); });
}

// Nouvelle fonction pour mettre à jour le nombre de classes
function updateNbClasses() {
    // Récupérer la valeur de l'input
    var input = document.getElementById("nbClasses");
    var newNbClasses = parseInt(input.value);

    // Validation de la valeur
    if (isNaN(newNbClasses) || newNbClasses < 1 || newNbClasses > 50) {
        alert("Veuillez entrer un nombre valide entre 1 et 50.");
        input.value = nbClasses; // Réinitialiser à la valeur précédente
        return;
    }

    // Mettre à jour la variable nbClasses
    nbClasses = newNbClasses;

    // Mettre à jour l'histogramme
    svgHist.selectAll("*").remove();
    initHistogram(svgHist, 500, 290, dataHist, attHist);
}

// Nouvelle fonction pour mettre à jour l'histogramme avec le brush
window.updateWithBrush = function() {
    updateHistX(attHist);
}
