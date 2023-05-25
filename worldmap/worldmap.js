(function (d3, topojson) {
  'use strict';

  const svg = d3.select('svg');
  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);
  const g = svg.append('g');
  const yearPicker = d3.select('#year-picker');

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

    yearPicker.selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .text(d => d);

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
    const countryPaths = g
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', d => {
      const countryId = d.id;
      const country = jsonData.find(c => c.Country === countryName[countryId]);
      if (country) {
        const selectedYear = yearPicker.property('value');
        const hdiRank = country[selectedYear] || '???';
  
        // Calculate the color based on HDI value
        const colorScale = d3.scaleLinear()
          .domain([0, 1])
          .range(['red', 'green']);
  
        return colorScale(hdiRank);
      } else {
        return 'white'; 
      }
    });
  

    countryPaths.append('title')
      .text(d => {
        const countryId = d.id;
        const country = jsonData.find(c => c.Country === countryName[countryId]);
        if (country) {
          const selectedYear = yearPicker.property('value');
          const hdiRank = country[selectedYear] || '???';
          return `${country.Country} (HDI Rank: ${hdiRank})`;
        } else {
          return 'unknown';
        }
      });

    let hdiLabel = null;

    countryPaths.on('click', d => {
      if (hdiLabel) {
        hdiLabel.remove();
      }

      const selectedYear = yearPicker.property('value');
      const countryId = d.id;
      const country = jsonData.find(c => c.Country === countryName[countryId]);
      const hdiRank = country ? country[selectedYear] || '???' : '???';

      hdiLabel = svg.append('text')
        .attr('class', 'hdi-label')
        .attr('x', 10)
        .attr('y', 20)
        .text(`HDI in ${selectedYear} for ${countryName[countryId]}: ${hdiRank}`);
    });

    yearPicker.on('change', () => {
      countryPaths.attr('fill', d => {
        const countryId = d.id;
        const country = jsonData.find(c => c.Country === countryName[countryId]);
        if (country) {
          const selectedYear = yearPicker.property('value');
          const hdiRank = country[selectedYear] || '???';

          const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(['red', 'green']);

          return colorScale(hdiRank);
        } else {
          return 'white';
        }
      });

      countryPaths.select('title')
        .text(d => {
          const countryId = d.id;
          const country = jsonData.find(c => c.Country === countryName[countryId]);
          if (country) {
            const selectedYear = yearPicker.property('value');
            const hdiRank = country[selectedYear] || '???';
            return `${country.Country} (HDI Rank: ${hdiRank})`;
          } else {
            return 'unknown';
          }
        });
    });
  });

}(d3, topojson));
