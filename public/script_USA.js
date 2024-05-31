console.log('Script cargado correctamente');

fetch('states_usa.bna')
  .then(response => response.text())
  .then(data => {
    
    console.log('Archivo BNA cargado correctamente');
    const width = 960;
    const height = 600;

    const svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    function parseBNA(data) {
      const lines = data.split("\n");
      const features = [];
      let feature = null;

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'P') {
          if (feature) {
            features.push(feature);
          }
          feature = { type: 'Feature', coordinates: [] };
        } else if (parts.length === 2) {
          feature.coordinates.push([+parts[1], +parts[0]]);
        }
      });

      if (feature) {
        features.push(feature);
      }

      return features;
    }

    console.log('Parseando archivo BNA');
    const states = parseBNA(data);

    const x = d3.scaleLinear()
      .domain([d3.min(states, d => d3.min(d.coordinates, c => c[0])), d3.max(states, d => d3.max(d.coordinates, c => c[0]))])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(states, d => d3.min(d.coordinates, c => c[1])), d3.max(states, d => d3.max(d.coordinates, c => c[1]))])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    console.log('Dibujando estados');
    svg.selectAll('path')
      .data(states)
      .enter().append('path')
      .attr('d', d => line(d.coordinates))
      .attr('stroke', 'black')
      .attr('fill', 'none');

  }).catch(error => console.error('Error al cargar el archivo BNA:', error));