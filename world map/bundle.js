(function (d3, topojson) {
  'use strict';

  const svg = d3.select('svg');

  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);

  const g = svg.append('g');

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


    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
    const countryPaths = g.selectAll('path').data(countries.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator);

    countryPaths.append('title')
      .text(d => {
        const countryId = d.id;
        const country = jsonData.find(c => c.Country === countryName[countryId]);
        if (country) {
          const hdiRank = country['2018']; // Assuming '2018' is the HDI rank property for that year
          return `${country.Country} (HDI Rank: ${hdiRank})`;
        } else {
          return 'unknown'; // Return only the country name if no matching country object is found
        }
      });

    let hdiLabel = null;

    countryPaths.on('click', d => {
      if (hdiLabel) {
        hdiLabel.remove();
      }
      
      const countryId = d.id;
      const country = jsonData.find(c => c.Country === countryName[countryId]);
      const hdiRank2018 = country ? country['2018'] : '???';
      
      hdiLabel = svg.append('text')
        .attr('class', 'hdi-label')
        .attr('x', 10)
        .attr('y', 20)
        .text(`HDI in 2018 for ${countryName[countryId]}: ${hdiRank2018}`);
    });
  });

}(d3, topojson));
