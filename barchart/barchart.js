// Set up the dimensions and margins for the chart
var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 20000 - margin.left - margin.right;
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

  // Function to update the chart based on the selected year and sort order
  function updateChart(year, sortOrder) {
    // Extract data for the selected year
    document.getElementById("selected-year").textContent = year;

    var yearData = data.map(function(d) {
      return { "Country": d.Country, "Value": d[year], "HDI": d["HDI Rank"] };
    });

    // Filter out countries with undefined or empty HDI values
    yearData = yearData.filter(function(d) {
      return d.Value !== undefined && d.Value !== "" && d.Value !== "..";
    });

    // Filter out countries with duplicate HDI values
    var uniqueHDI = [];
    yearData = yearData.filter(function(d) {
      if (!uniqueHDI.includes(d.Value)) {
        uniqueHDI.push(d.Value);
        return true;
      }
      return false;
    });

    // Sort the data based on Value and sortOrder
    yearData.sort(function(a, b) {
      if (sortOrder === "ascending") {
        return a.Value - b.Value;
      } else {
        return b.Value - a.Value;
      }
    });

    // Set up the scales
    var xScale = d3.scaleBand()
      .domain(yearData.map(function(d) { return d.Country; }))
      .range([0, width])
      .padding(0.1);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(yearData, function(d) { return d.Value; })])
      .range([height, 0]);

    // Define the color scale
    var colorScale = d3.scaleLinear()
      .domain(d3.extent(yearData, function(d) { return d.Value; }))
      .range(["red", "lightgreen"]);

    // Update the bars
    var bars = svg.selectAll(".bar")
      .data(yearData);

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .merge(bars)
      .transition()
      .duration(500)
      .attr("x", function(d) { return xScale(d.Country); })
      .attr("y", function(d) { return yScale(d.Value); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height - yScale(d.Value); })
      .style("fill", function(d) { return colorScale(d.Value); });

    bars.exit()
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

  // Get the selected sort order from the dropdown
  var sortOrderSelect = document.getElementById("sort-order");
  var sortOrder = sortOrderSelect.value;

  // Add event listener to update the chart when sort order is changed
  sortOrderSelect.addEventListener("change", function() {
    sortOrder = sortOrderSelect.value;
    updateChart(selectedYear, sortOrder);
  });

  // Call the updateChart function with initial values
  var selectedYear = "1990";
  updateChart(selectedYear, sortOrder);
}).catch(function(error) {
  console.log("Error loading data: " + error);
});
