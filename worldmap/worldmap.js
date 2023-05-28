(function (d3, topojson) {
  'use strict';

  const svg = d3.select('svg');
  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);
  const g = svg.append('g');
  const activeYearPicker = d3.select('#year-picker');

  g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }));

  svg.call(d3.zoom().on('zoom', () => {
    g.attr('transform', d3.event.transform);
  }));

  Promise.all([
    d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json'),
    d3.json('jsondata.json')
  ]).then(([tsvData, topoJSONdata, jsonData]) => {

    const countryName = {};
    tsvData.forEach(d => {
      countryName[d.iso_n3] = d.name;
    });

    const years = Object.keys(jsonData[0]).filter(key => !isNaN(parseInt(key)));

    activeYearPicker.selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .text(year => year);

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

    const countryPaths = g
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', d => {
      const Id = d.id;
      const country = jsonData.find(c => c.Country === countryName[Id]);
      if (country) {
        const activeYear = activeYearPicker.property('value');
        const hdiRank = country[activeYear] || 'unknown';
  
        const colorRange = d3.scaleLinear()
          .domain([0, 1])
          .range(['red', 'green']);
        return colorRange(hdiRank);
      } else {
        return 'white'; 
      }
    });

    let hdiDisplayText = null;

    countryPaths.on('click', d => {
      if (hdiDisplayText) {
        hdiDisplayText.remove();
      }

      const activeYear = activeYearPicker.property('value');
      const Id = d.id;
      const country = jsonData.find(file => file.Country === countryName[Id]);
      const hdiRank = country ? country[activeYear] || 'unknown' : 'not registered';

      hdiDisplayText = svg.append('text')
        .attr('class', 'hdi-label')
        .attr('x', 300)
        .attr('y', 550)
        .text(`HDI in ${activeYear} for ${countryName[Id]}: ${hdiRank}`);
    });

    activeYearPicker.on('change', () => {
      countryPaths.attr('fill', d => {
        const Id = d.id;
        const country = jsonData.find(data => data.Country === countryName[Id]);
        if (country) {
          const activeYear = activeYearPicker.property('value');
          const hdiRank = country[activeYear] || 'unknown';

          const colorRange = d3.scaleLinear()
            .domain([0, 1])
            .range(['red', 'green']);

          return colorRange(hdiRank);
        } else {
          return 'white';
        }
      });
    });
  });

}(d3, topojson));
