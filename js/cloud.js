// cloud.js

var svgCloud;
var widthCloud = 500;
var heightCloud = 430;

var marginCloud = {top: 20, right: 30, bottom: 30, left: 40},
    widthInnerCloud = widthCloud - marginCloud.left - marginCloud.right,
    heightInnerCloud = heightCloud - marginCloud.top - marginCloud.bottom;

var scaleXCloud = d3.scaleLinear();
var scaleYCloud = d3.scaleLinear();
var scaleCCloud = d3.scaleOrdinal(d3.schemeCategory10);

var xAxisCloud = d3.axisBottom(scaleXCloud);
var yAxisCloud = d3.axisLeft(scaleYCloud);

var gxAxisCloud;
var gyAxisCloud;

var dataCloud;

var attXCloud;
var attYCloud;
var attCCloud;

var items;

function initCloud(svg, w, h, d, x, y, c){
    
    svgCloud = svg;
    widthCloud = w;
    heightCloud = h;
    dataCloud = d;
    attXCloud = x;
    attYCloud = y;
    attCCloud = c;

    /*
     * SVG
     */
    
    svgCloud.attr("width", widthCloud)
            .attr("height", heightCloud);
    
    /*
     * Groupe principal
     */
    var g = svgCloud.append("g")
                    .attr("transform", "translate(" + marginCloud.left + "," + marginCloud.top + ")");

    /*
     * Axe X
     */

    scaleXCloud.domain([d3.min(dataCloud, function(d) { return d[attXCloud]; }), 
                        d3.max(dataCloud, function(d) { return d[attXCloud]; })])
               .range([0, widthInnerCloud]);
    
    gxAxisCloud = g.append("g")
                  .attr("transform", "translate(0," + heightInnerCloud + ")")
                  .call(xAxisCloud);

    /*
     * Axe Y
     */

    scaleYCloud.domain([d3.min(dataCloud, function(d) { return d[attYCloud]; }), 
                        d3.max(dataCloud, function(d) { return d[attYCloud]; })])
               .range([heightInnerCloud, 0]);
    
    gyAxisCloud = g.append("g")
                  .call(yAxisCloud);
    
    /*
     * Cercles
     */
    
    items = g.selectAll(".circles")
             .data(dataCloud)
             .enter().append("circle");
    
    items.attr("stroke", "#aaaaaa")
         .attr("stroke-width", 1)
         .attr("fill", function(d) { return scaleCCloud(d[attCCloud]); } )
         .attr("r", 4)
         .attr("cx", function(d) { return scaleXCloud(d[attXCloud]); } )
         .attr("cy", function(d) { return scaleYCloud(d[attYCloud]); } );    
    
    /*
     * Ajout du Brush
     */
    var brush = d3.brush()
                  .extent([[0, 0], [widthInnerCloud, heightInnerCloud]])
                  .on("brush", brushed)
                  .on("end", brushEnded);
    
    g.append("g")
     .attr("class", "brush")
     .call(brush);
    
    function brushed({selection}) {
        if (selection === null) return; // Pas de sélection en cours

        items.attr("stroke", function(d) {
            var cx = scaleXCloud(d[attXCloud]);
            var cy = scaleYCloud(d[attYCloud]);
            if(selection[0][0] <= cx &&
               cx <= selection[1][0] &&
               selection[0][1] <= cy &&
               cy <= selection[1][1]){
                d.selected = true;
                return "magenta";
            }
            else {
                d.selected = false;
                return "#aaaaaa";
            }
        })
        .attr("stroke-width", function(d) {
            return d.selected ? 2 : 1;
        });
    }

    function brushEnded({selection}) {
        if (selection === null) {
            // Si aucune sélection, désélectionner tous les items
            items.attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 1)
                 .each(function(d) { d.selected = false; });
        }
        updateWithBrush(); // Appeler la fonction pour mettre à jour l'histogramme
    }
}

function updateCloudX(att) {
    // Mise à jour de l'attribut X
    attXCloud = att;
    
    // Mise à jour du domaine de l'échelle X
    scaleXCloud.domain([
        d3.min(dataCloud, function(d) { return d[attXCloud]; }),
        d3.max(dataCloud, function(d) { return d[attXCloud]; })
    ]);
    
    // Mise à jour de l'axe X avec transition
    gxAxisCloud.transition()
               .duration(1000)
               .call(xAxisCloud);
    
    // Mise à jour des positions des cercles avec transition
    items.transition()
         .duration(1000)
         .attr("cx", function(d) {
             return scaleXCloud(d[attXCloud]);
         });
    
    // Appel de la fonction updateHistX pour synchroniser l'histogramme
    updateHistX(att);
}

function updateCloudY(att) {
    // Mise à jour de l'attribut Y
    attYCloud = att;
    
    // Mise à jour du domaine de l'échelle Y
    scaleYCloud.domain([
        d3.min(dataCloud, function(d) { return d[attYCloud]; }),
        d3.max(dataCloud, function(d) { return d[attYCloud]; })
    ]);
    
    // Mise à jour de l'axe Y avec transition
    gyAxisCloud.transition()
               .duration(1000)
               .call(yAxisCloud);
    
    // Mise à jour des positions des cercles avec transition
    items.transition()
         .duration(1000)
         .attr("cy", function(d) {
             return scaleYCloud(d[attYCloud]);
         });
}
