d3.json("json/flare.json").then(function(data) {

    // Transformar los datos en una estructura jerárquica
    const hierarchicalData = transformData(data);
    console.log(hierarchicalData);


    // Llamar a la función para crear el treemap
    createTreemap(hierarchicalData);

    // Llamar a la función para crear el radial
    createRadialLayout(hierarchicalData);

    // Llamar la función para crear partitional layout
    createPartitionLayout(hierarchicalData);

    // Llamar a la función para crear el Circle Packing Layout
    createCirclePackingLayout(hierarchicalData);

}).catch(function(error) {
    console.log("Error al cargar los datos:", error);
});

// Función para transformar datos en una estructura jerárquica
function transformData(data) {
    const root = { name: "root", children: [] };
    data.forEach(item => {
        const parts = item.id.split(".");
        let currentNode = root;
        for (let i = 0; i < parts.length; i++) {
            let children = currentNode.children || [];
            let nodeName = parts[i];
            let childNode;
            if (i + 1 < parts.length) {
                childNode = children.find(child => child.name === nodeName);
                if (!childNode) {
                    childNode = { name: nodeName, children: [] };
                    children.push(childNode);
                }
                currentNode.children = children;
                currentNode = childNode;
            } else {
                childNode = { name: nodeName, value: item.value };
                children.push(childNode);
            }
        }
    });
    return root;
}

function createTreemap(hierarchicalData) {
    console.log('TREEMAP cargado correctamente');
    
    // Configuración del tamaño del contenedor y el color
    const width = 1000;
    const height = 1000;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Crear el contenedor SVG
    const svg = d3.select("#treemap-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Crear el layout del treemap
    const treemap = d3.treemap()
        .size([width, height])
        .padding(1)
        .round(true);

    // Convertir los datos a la jerarquía de d3
    const root = d3.hierarchy(hierarchicalData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Calcular el layout del treemap
    treemap(root);
    
   // Dibujar los rectángulos del treemap
   svg.selectAll("rect")
   .data(root.leaves())
   .enter().append("rect")
   .attr("x", d => d.x0)
   .attr("y", d => d.y0)
   .attr("width", d => d.x1 - d.x0)
   .attr("height", d => d.y1 - d.y0)
   .attr("fill", (d, i) => color(i)) // Color basado en el índice
   .attr("stroke", "black");
            
    // Agregar etiquetas de texto
    svg.selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("x", d => d.x0 + 5) // Ajustar la posición del texto
        .attr("y", d => d.y0 + 20) // Ajustar la posición del texto
        .attr("fill", "black")
        .text(d => d.data.name); // Mostrar el nombre del nodo
}



function createRadialLayout(hierarchicalData) {
    console.log('RADIAL LAYOUT cargado correctamente');

    // Configuración del tamaño del contenedor
    const width = 1000;
    const height = 1000;

    // Crear el contenedor SVG
    const svg = d3.select("#radial-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Crear el layout radial
    const radialLayout = d3.cluster()
        .size([360, width / 2 - 50]);

    // Convertir los datos a la jerarquía de d3
    const root = d3.hierarchy(hierarchicalData)
        .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name));

    // Calcular el layout radial
    radialLayout(root);

    // Dibujar los enlaces
    svg.selectAll("path")
        .data(root.links())
        .enter().append("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x / 180 * Math.PI)
            .radius(d => d.y));

    // Dibujar los nodos
    svg.selectAll("circle")
        .data(root.descendants())
        .enter().append("circle")
        .attr("r", 4.5)
        .attr("transform", d => "rotate(" + (d.x - 90) + ")translate(" + d.y + ",0)");

    // Agregar etiquetas de texto
    svg.selectAll("text")
        .data(root.descendants())
        .enter().append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.y)
        .attr("transform", d => "rotate(" + (d.x - 90) + ")translate(" + (d.y + 4) + ",0)" + (d.x < 180 ? "" : "rotate(180)"))
        .attr("text-anchor", d => d.x < 180 ? "start" : "end")
        .text(d => d.data.name);
}



function createPartitionLayout(hierarchicalData) {
    console.log('PARTITION LAYOUT cargado correctamente');

    // Configuración del tamaño del contenedor
    const width = 800;
    const height = 800;

    // Crear el contenedor SVG
    const svg = d3.select("#partition-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Crear el layout de partición
    const partition = data => {
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        return d3.partition()
            .size([height, (root.height + 1) * width / 3])
            (root);
    }

    // Calcular el layout de partición
    const root = partition(hierarchicalData);

    // Dibujar los nodos
    const cell = svg.selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    // Definir una escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    cell.append("rect")
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        .attr("fill", (d, i) => color(i)) // Color basado en el índice
        .attr("stroke", "white");

    // Agregar etiquetas de texto
    cell.append("text")
        .attr("x", 4)
        .attr("y", 13)
        .attr("fill", "white")
        .text(d => d.data.name);
}

function createCirclePackingLayout(hierarchicalData) {
    console.log('CIRCLE PACKING LAYOUT cargado correctamente');

    // Configuración del tamaño del contenedor
    const width = 800;
    const height = 800;

    // Crear el contenedor SVG
    const svg = d3.select("#circle-packing-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Crear el layout de Circle Packing
    const pack = data => d3.pack()
        .size([width - 2, height - 2]) // Restar un pequeño margen para evitar que los círculos se corten
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    // Calcular el layout de Circle Packing
    const root = pack(hierarchicalData);
    
    // Definir una escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Dibujar los círculos
    svg.selectAll("circle")
        .data(root.descendants().slice(1))
        .enter().append("circle")
        .attr("cx", d => d.x - width / 2 + 1) // Ajustar la posición de los círculos
        .attr("cy", d => d.y - height / 2 + 1) // Ajustar la posición de los círculos
        .attr("r", d => d.r)
        .attr("fill", d => color(d.data.name))
        .attr("fill-opacity", 0.7)
        .attr("stroke", "black");

    // Agregar etiquetas de texto a los círculos
    svg.selectAll("text")
        .data(root.descendants().slice(1))
        .enter().append("text")
        .attr("x", d => d.x - width / 2 + 1) // Ajustar la posición del texto
        .attr("y", d => d.y - height / 2 + 1) // Ajustar la posición del texto
        .style("text-anchor", "middle") // Centrar el texto
        .text(d => d.data.name); // Mostrar el nombre del nodo
}

