// @TODO: YOUR CODE HERE!
var max = {};
var svgWidth = 500;
var svgHeight = 500;
var xAxisHeight = 50;
var topMargin = 50;
var yAxisWidth = 75;
var rightMargin = 20;
var circleR = 7;
var yAxisHeight = svgHeight - topMargin - xAxisHeight;
var xAxisLength = svgWidth - rightMargin - yAxisWidth;

var xAxisElement = document.getElementById("x-select");
var yAxisElement = document.getElementById("y-select");

var xAxisStat = "poverty"
var yAxisStat = "poverty"
var xAxisMoe = "povertyMoe"
var yAxisMoe = "povertyMoe"

var xScale = d3.scaleLinear()
var yScale = d3.scaleLinear()
var ZoomXScale = xScale;
var ZoomYScale = yScale;

var xAxisCall = d3.axisBottom()
var yAxisCall = d3.axisLeft()

var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

var view = svg.append("rect")
    .attr("class", "view")
    .attr("x", yAxisWidth)
    .attr("y", xAxisHeight)
    .attr("width", xAxisLength)
    .attr("height", yAxisHeight)
    .style("fill", "none");

var yAxisGroup = svg.append("g")
            .attr("transform", `translate(${yAxisWidth},${topMargin})`);
var xAxisGroup = svg.append("g")
            .attr("transform", `translate(${yAxisWidth},${(topMargin+yAxisHeight)})`);
var ellipses = yAxisGroup.append("g").selectAll("ellipse");
var text = yAxisGroup.append("g").selectAll("text");

var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0-xAxisLength, 0-yAxisHeight], [yAxisWidth + 2.0*xAxisLength, xAxisHeight + 2.0*yAxisHeight]])
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed() {

    // view.attr("transform", d3.event.transform);
    // ellipses.attr("transform", d3.event.transform);
    // text.attr("transform", d3.event.transform)
    ZoomXScale = d3.event.transform.rescaleX(xScale)
    ZoomYScale = d3.event.transform.rescaleY(yScale)
  
    // update axes
    xAxisGroup.call(xAxisCall.scale(ZoomXScale));
    yAxisGroup.call(yAxisCall.scale(ZoomYScale));

    moveEllipses();
}

var xAxisText = xAxisGroup.append("text")
    .attr("x", xAxisLength/2)
    .attr("y", xAxisHeight)
    .attr("dy", "-0.5em")
    .text("hi")
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "black");

var yAxisText = yAxisGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - yAxisWidth)
    .attr("x", 0 - yAxisHeight/2)
    .attr("dy", "1em")
    .text("hi")
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "black");

first = true;

function scaleAxes() {

    xScale
        .domain([0, max[xAxisStat]])
        .range([0, xAxisLength]);
    yScale
        .domain([0, max[yAxisStat]])
        .range([yAxisHeight, 0]);

    xAxisCall.scale(xScale);
    yAxisCall.scale(yScale);

    xAxisText.text(xAxisStat);
    yAxisText.text(yAxisStat);

    yAxisGroup.call(yAxisCall);
    xAxisGroup.call(xAxisCall);
}

function moveEllipses() {
    let xScaleGain = Math.abs((ZoomXScale(1) - ZoomXScale(0)));
    let yScaleGain = Math.abs((ZoomYScale(1) - ZoomYScale(0)));
    const Moe = {
        "poverty": (d => d["povertyMoe"]),
        "age": (d => d["ageMoe"]),
        "income": (d => d["incomeMoe"]),
        "healthcare": (d => (d["healthcareHigh"] - d["healthcareLow"])/2),
        "obesity": (d => (d["obesityHigh"] -d["obesityLow"])/2),
        "smokes": (d => (d["smokesHigh"] -d["smokesLow"])/2)
    }

    ellipses
        .attr("cx", d => ZoomXScale(d[xAxisStat]))
        .attr("cy", d => ZoomYScale(d[yAxisStat]))
        .attr("rx", d => xScaleGain * Moe[xAxisStat](d))
        .attr("ry", d => yScaleGain * Moe[yAxisStat](d))
    text
        .attr("x", d => ZoomXScale(d[xAxisStat]))
        .attr("y", d => ZoomYScale(d[yAxisStat]))
}

function insertOption(element, s){
    if (!element.options.namedItem(s)){
        let o = document.createElement("option");
        o.text = s;
        element.options.add(o);
    }
}

["poverty", "age", "income", "healthcare", "obesity", "smokes"].forEach(s=>{
    insertOption(xAxisElement, s);
    insertOption(yAxisElement, s);
}) 

function getData() {
d3.csv("assets/data/data.csv", state => {

    for (let s in state){
        if ((!max.hasOwnProperty(s)) || (+state[s] > max[s])){
            max[s] = +state[s];
        }
    }
    return state;
    }).then(data => {
    
    scaleAxes();
    ellipses = ellipses.data(data)
        .enter()
        .append("ellipse")
        .attr("rx", circleR)
        .attr("ry", circleR)
        .attr("fill", "skyblue")
        .attr("stroke-width", "1")
        .attr("stroke", "black")
        .attr("opacity", "0.5");
    
    text = text.data(data)
        .enter()
        .append("text")
        .attr("dy", "0.4em")
        .attr("dx", 0)
        .text(d => d.abbr)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "black");

    moveEllipses();

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return(`${d["state"]}<br>${xAxisStat}: ${d[xAxisStat]}<br>${yAxisStat}: ${d[yAxisStat]}`)
        })

    text.call(toolTip);

    text.on("mouseover", function(data){
        //console.log(data);
        toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });  
});
}

getData();

function axisChange(){

    xAxisStat = xAxisElement.value;
    yAxisStat = yAxisElement.value;
    scaleAxes();
    resetted();
}

function resetted() {
    svg
    //.transition()
    //    .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    ZoomXScale = xScale
    ZoomYScale = yScale

    // update axes
    xAxisGroup.call(xAxisCall.scale(ZoomXScale));
    yAxisGroup.call(yAxisCall.scale(ZoomYScale));

    moveEllipses();      
  }
  
xAxisElement.addEventListener("change", axisChange);
yAxisElement.addEventListener("change", axisChange);
d3.select("button")
    .on("click", resetted);
