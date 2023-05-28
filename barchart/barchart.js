var margin = { top: 20, right: 20, bottom: 30, left: 10 };
var height = 400 - margin.top - margin.bottom;
var width = 20000 - margin.left - margin.right;

var svgElement = d3.select("#chart")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("jsondata.json").then(function(data) {
  var years = Object.keys(data[0]).filter(function(key) {
    return !isNaN(key);
  });

  var yearPicker = d3.select("#currentyearpicker");
  yearPicker.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(function(d) { return d; });

  var currentYear = yearPicker.property("value");
  updateChart(currentYear);

  yearPicker.on("change", function() {
    currentYear = yearPicker.property("value");
    var sortOrder = sortOrderSelect.value;

    updateChart(currentYear, sortOrder);
  });
  
  var sortOrderSelect = document.getElementById("sort-order");
  var sortOrder = sortOrderSelect.value;

  sortOrderSelect.addEventListener("change", function() {
    sortOrder = sortOrderSelect.value;
    updateChart(currentYear, sortOrder);
  });

  function updateChart(year, sortOrder) {
    document.getElementById("selected-year").textContent = year;
    var jsonDataByYear = data.map(function(d) {
      return { "Country": d.Country, "Value": d[year], "HDI": d["HDI Rank"] };
    });
    var uniqueHDI = [];
    jsonDataByYear = jsonDataByYear.filter(function(d) {
      if (!uniqueHDI.includes(d.Value)) {
        uniqueHDI.push(d.Value);
        return true;
      }
      return false;
    });

    jsonDataByYear = jsonDataByYear.filter(function(yearValue) {
      return yearValue.Value !== ".." && yearValue.Value !== undefined && yearValue.Value !== "";
    });

    jsonDataByYear.sort(function(min, max) {
      if (sortOrder === "ascending") {
        return min.Value - max.Value;
      } else {
        return max.Value - min.Value;
      }
    })

    var x = d3.scaleBand()
      .domain(jsonDataByYear.map(function(mappable) { return mappable.Country; }))
      .range([0, width])
      .padding(0.17);

    var y = d3.scaleLinear()
      .domain([0, d3.max(jsonDataByYear, function(mappable) { return mappable.Value; })])
      .range([height, 0]);

    var colorScale = d3.scaleLinear()
      .domain(d3.extent(jsonDataByYear, function(color) { return color.Value; }))
      .range(["red", "lightgreen"]);

    var labels = svgElement.selectAll(".chartLabels")
    .data(jsonDataByYear);

  labels.enter()
    .append("text")
    .attr("class", "chartLabels")
    .merge(labels)
    .attr("x", function(d) { return x(d.Country) + x.bandwidth() / 2; })
    .attr("y", function(d) { return y(d.Value) - 5; })
    .attr("text-anchor", "middle")
    .text(function(d) { return d.Country + " - " + d.Value; });

  labels.exit()
    .remove();

    var bars = svgElement.selectAll(".chartbars")
      .data(jsonDataByYear);

    bars.enter()
      .append("rect")
      .attr("class", "chartbars")
      .merge(bars)
      .transition()
      .duration(600)
      .attr("x", function(val) { return x(val.Country); })
      .attr("y", function(val) { return y(val.Value); })
      .attr("width", x.bandwidth())
      .attr("height", function(val) { return height - y(val.Value); })
      .style("fill", function(val) { return colorScale(val.Value); });

    bars.exit()
      .remove();

    svgElement.select(".x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

      svgElement.select(".y-axis")
      .call(d3.axisLeft(y));
  }

  var activeYear = "1990";
  updateChart(activeYear, sortOrder);
}).catch(function(error) {
  console.log("error");
});
