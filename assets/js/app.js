// @TODO: YOUR CODE HERE!
var max = {};
var svgWidth = 500;
var svgHeight = 500;
var xAxisHeight = 50;
var topMargin = 50;
var yAxisWidth = 75;
var rightMargin = 20;
var circleR = 8;
var yAxisHeight = svgHeight - topMargin - xAxisHeight;
var xAxisLength = svgWidth - rightMargin - yAxisWidth;

xAxisElement = document.getElementById("x-select");
yAxisElement = document.getElementById("y-select");

xAxisStat = "poverty"
yAxisStat = "poverty"

var xScale = d3.scaleLinear()
var yScale = d3.scaleLinear()
    
var xAxisCall = d3.axisBottom()
var yAxisCall = d3.axisLeft()

var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

var yAxisGroup = svg.append("g")
            .attr("transform", `translate(${yAxisWidth},${topMargin})`);
var xAxisGroup = svg.append("g")
            .attr("transform", `translate(${yAxisWidth},${(topMargin+yAxisHeight)})`);
var circles = yAxisGroup.append("g").selectAll("circle");
var text = yAxisGroup.append("g").selectAll("text");

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

function moveCircles() {
    circles
        .attr("cx", d => xScale(d[xAxisStat]))
        .attr("cy", d => yScale(d[yAxisStat]))
    text
        .attr("x", d => xScale(d[xAxisStat]))
        .attr("y", d => yScale(d[yAxisStat]))
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

    circles = circles.data(data)
        .enter()
        .append("circle")        
        .attr("r", circleR)
        .attr("fill", "blue");
    
    text = text.data(data)
        .enter()
        .append("text")
        .attr("dy", "0.4em")
        .text(d => d.abbr)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "white");

    moveCircles();
});
}

getData();
function axisChange(){
    xAxisStat = xAxisElement.value;
    yAxisStat = yAxisElement.value;
    scaleAxes();
    moveCircles();
}

xAxisElement.addEventListener("change", axisChange);
yAxisElement.addEventListener("change", axisChange);
