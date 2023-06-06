 var margin = { top: 20, right: 20, bottom: 0, left: 30 };
 var width = 20000 - margin.left - margin.right;
 var height = 500 - margin.top;

 // postavljanje svg elementa (isto kao u barchart.js):

 var svg = d3.select("#chart")
 .attr("height", height)
   .attr("width", width)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 d3.json("jsondata.json").then(function(data) {
   var years = Object.keys(data[0]).filter(function(key) {
     return !isNaN(key);
   });

   var yearsArray = d3.select("#year-select");
   yearsArray.selectAll("option")
     .data(years)
     .enter()
     .append("option")
     .text(function(d) { return d; });

   var currentActiveYear = yearsArray.property("value");
   updateLineGraph(currentActiveYear);

   //azuriranje grafa svaki put kad se promijeni godina:
   yearsArray.on("change", function() {
     currentActiveYear = yearsArray.property("value");
     updateLineGraph(currentActiveYear);
   });

   function updateLineGraph(year) {
     document.getElementById("activeyear").textContent = year;

     var yearData = data.map(function(d) {
       return { "Country": d.Country, "Value": d[year], "HDI": d.HDI };
     });

     //izbacivanje nedefiniranih i krivih vrijednosti:

     yearData = yearData.filter(function(d) {
       return d.Value !== "??"  && d.Value !== undefined && d.Value !== "..";
     });

     var line = d3.line()
       .x(function(val) { return x(val.Country); })
       .y(function(val) { return y(val.Value); });

     var x = d3.scaleBand()
       .domain(yearData.map(function(d) { return d.Country; }))
       .range([0, width])
       .padding(0.1);

     var y = d3.scaleLinear()
       .domain([0, d3.max(yearData, function(d) { return d.Value; })])
       .range([height, 0]);

       var labels = svg.selectAll(".label")
       .data(yearData);


       //postavljanje teksta s informacijama:
     labels.enter()
       .append("text")
       .attr("class", "label")
       .merge(labels)
       .attr("text-anchor", "middle")
       .attr("x", function(d) { return x(d.Country) + 20; })
       .attr("y", function(d) { return y(d.Value) - 5; })
       .text(function(d) { return d.Country + " - " + d.Value; });

     labels.exit()
       .remove();


     var linePath = svg.selectAll(".path")
       .data([yearData]);

       //koristenje tranzicije:
     linePath.enter()
       .append("path")
       .attr("class", "path")
       .merge(linePath)
       .transition()
       .duration(500)
       .attr("d", line)
       .style("fill", "none")
       .style("stroke", "black");

     linePath.exit()
       .remove();

       svg.select(".x-axis")
       .call(d3.axisBottom(x))
       .selectAll("text")
       .style("text-anchor", "end");

     svg.select(".y-axis")
       .call(d3.axisLeft(y));
   }

   updateLineGraph(currentActiveYear);
 }).catch(function(error) {
   console.log("Unhandled error");
 });