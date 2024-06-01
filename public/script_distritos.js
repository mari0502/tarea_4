console.log("CARGAR DISTRITOS....");

d3.json("json/distritos.json").then(function(data) {

    // Transformar los datos en una estructura jerárquica
    const DistritosData = transformData(data);
    console.log(DistritosData);

    // Llamar a la función para crear el treemap
    createTreemap(DistritosData);

    // Llamar a la función para crear el radial
    createRadialLayout(DistritosData);

    // Llamar la función para crear partitional layout
    createPartitionLayout(DistritosData);

    // Llamar a la función para crear el Circle Packing Layout
    createCirclePackingLayout(DistritosData);

}).catch(function(error) {
    console.log("Error al cargar los datos:", error);
});

// Transformar los datos en una estructura jerárquica
function transformData(data) {
    const root = { name: "Costa Rica", children: [] };
    data.forEach(item => {
        const parts = item.ID.split(".");
        let currentNode = root;
        parts.forEach((part, index) => {
            let children = currentNode.children || [];
            let childNode = children.find(child => child.name === part);
            if (!childNode) {
                childNode = { name: part, children: [] };
                children.push(childNode);
            }
            currentNode.children = children;
            currentNode = childNode;
            if (index === parts.length - 1) {
                childNode.data = item;
                childNode.value = item.POBL_2022;
            }
        });
    });
    return root;
}



// ---------------------------------------------- Crear Treemap ------------------------------------------------------------------------------------------
function createTreemap(hierarchicalData) {
    console.log('TREEMAP cargado correctamente');

    const width = 1000;
    const height = 1000;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#treemap-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const treemap = d3.treemap()
        .size([width, height])
        .padding(1)
        .round(true);

    const root = d3.hierarchy(hierarchicalData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap(root);

    svg.selectAll("rect")
        .data(root.leaves())
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html("Nombre: " + d.data.name + "<br>Población 2022: " + d.data.data.POBL_2022);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");
}

// ------------------------------------------------------ Crear Radial Layout --------------------------------------------------------------------------
function createRadialLayout(hierarchicalData) {
    console.log('RADIAL LAYOUT cargado correctamente');

    const width = 800;
    const height = 800;

    const svg = d3.select("#radial-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const radialLayout = d3.cluster()
        .size([360, width / 2 - 50]);

    const root = d3.hierarchy(hierarchicalData)
        .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name));

    radialLayout(root);

    svg.selectAll("path")
        .data(root.links())
        .enter().append("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x / 180 * Math.PI)
            .radius(d => d.y));

    svg.selectAll("circle")
        .data(root.descendants())
        .enter().append("circle")
        .attr("r", 4.5)
        .attr("transform", d => "rotate(" + (d.x - 90) + ")translate(" + d.y + ",0)")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html("Nombre: " + d.data.name + "<br>Población 2022: " + d.data.data.POBL_2022);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");
}

// ------------------------------------------------------ Crear Partition Layout ---------------------------------------------------------------
function createPartitionLayout(hierarchicalData) {
    console.log('PARTITION LAYOUT cargado correctamente');

    const width = 800;
    const height = 800;
    const textXOffset = 5; // Desplazamiento horizontal del texto
    const textYOffset = 20; // Desplazamiento vertical del texto

    const svg = d3.select("#partition-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const partition = d3.partition()
        .size([width, height])
        .padding(1)
        .round(true);

    const root = d3.hierarchy(hierarchicalData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    partition(root);

    // Definir una escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const rects = svg.selectAll("rect")
        .data(root.descendants())
        .enter().append("rect")
        .attr("x", d => d.y0)
        .attr("y", d => d.x0)
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        .attr("fill", (d, i) => color(i)); // Color basado en el índice

    rects.on("mouseover", function(d) {
        d3.select(this).attr("fill", "orange"); // Cambiar el color al pasar el cursor
    });

    rects.on("mouseout", function(d, i) {
        d3.select(this).attr("fill", color(i)); // Restaurar el color original
    });

    svg.selectAll("text")
        .data(root.descendants())
        .enter().append("text")
        .attr("x", d => d.y0 + textXOffset)
        .attr("y", d => d.x0 + textYOffset)
        .text(d => d.data.name);
}

// ------------------------------------------------------ Crear Circle Packing Layout ----------------------------------------------------------------------
function createCirclePackingLayout(hierarchicalData) {
    // Definir anchura y altura
    const width = 800;
    const height = 800;
    
    // Definir una escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#circle-packing-layout-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const pack = d3.pack()
        .size([width, height])
        .padding(1);

    const root = d3.hierarchy(hierarchicalData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const nodes = pack(root).descendants().slice(1); // Excluir el nodo raíz

    // Crear una simulación de fuerzas para evitar la superposición de los círculos
    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX().strength(0.02))
        .force("y", d3.forceY().strength(0.02))
        .force("collide", d3.forceCollide().radius(d => d.r + 1));

    svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => color(d.data.name));

    svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", ".35em") // Desplazamiento vertical para centrar el texto
        .style("text-anchor", "middle") // Alinear el texto al centro del círculo
        .text(d => d.data.name);

    // Actualizar la posición de los círculos y el texto en cada "tick" de la simulación
    simulation.on("tick", () => {
        svg.selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        svg.selectAll("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}