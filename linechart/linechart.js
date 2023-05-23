 // Set up the dimensions and margins for the chart
 var margin = { top: 20, right: 20, bottom: 30, left: 50 };
 var width = 21000 - margin.left - margin.right;
 var height = 400 - margin.top - margin.bottom;

 // Create the SVG element
 var svg = d3.select("#chart")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 // Load the data from JSON file
 d3.json("jsondata.json").then(function(data) {
   // Extract the available years from the data
   var years = Object.keys(data[0]).filter(function(key) {
     return !isNaN(key);
   });

   // Create the year dropdown options
   var yearSelect = d3.select("#year-select");
   yearSelect.selectAll("option")
     .data(years)
     .enter()
     .append("option")
     .text(function(d) { return d; });

   // Set up the initial year selection
   var selectedYear = yearSelect.property("value");


   // Update the chart based on the selected year
   updateChart(selectedYear);

   // Handle the year selection change event
   yearSelect.on("change", function() {
     selectedYear = yearSelect.property("value");
     updateChart(selectedYear);
   });

   // Function to update the chart based on the selected year
   function updateChart(year) {
     // Extract data for the selected year
     document.getElementById("selected-year").textContent = year;

     var yearData = data.map(function(d) {
       return { "Country": d.Country, "Value": d[year], "HDI": d.HDI };
     });

     // Filter out countries with undefined or empty HDI values and incomplete data
     yearData = yearData.filter(function(d) {
       return d.Value !== undefined && d.Value !== "..";
     });

     // Sort the data based on HDI value
     yearData.sort(function(a, b) {
       return a.HDI - b.HDI;
     });

     // Set up the scales
     var xScale = d3.scaleBand()
       .domain(yearData.map(function(d) { return d.Country; }))
       .range([0, width])
       .padding(0.1);

     var yScale = d3.scaleLinear()
       .domain([0, d3.max(yearData, function(d) { return d.Value; })])
       .range([height, 0]);

     // Define the line generator
     var line = d3.line()
       .x(function(d) { return xScale(d.Country) + xScale.bandwidth() / 2; })
       .y(function(d) { return yScale(d.Value); });

     // Update the line path
     var linePath = svg.selectAll(".line-path")
       .data([yearData]);

     linePath.enter()
       .append("path")
       .attr("class", "line-path")
       .merge(linePath)
       .transition()
       .duration(500)
       .attr("d", line)
       .style("fill", "none")
       .style("stroke", "steelblue")
       .style("stroke-width", "2px");

     linePath.exit()
       .remove();

     // Add country labels
     var labels = svg.selectAll(".label")
       .data(yearData);

     labels.enter()
       .append("text")
       .attr("class", "label")
       .merge(labels)
       .attr("x", function(d) { return xScale(d.Country) + xScale.bandwidth() / 2; })
       .attr("y", function(d) { return yScale(d.Value) - 5; })
       .attr("text-anchor", "middle")
       .text(function(d) { return d.Country + " - " + d.Value; });

     labels.exit()
       .remove();

     // Update the x-axis
     svg.select(".x-axis")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xScale))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-65)");

     // Update the y-axis
     svg.select(".y-axis")
       .call(d3.axisLeft(yScale));
   }

   // Call the updateChart function with initial value
   updateChart(selectedYear);
 }).catch(function(error) {
   console.log("Error loading data: " + error);
 });