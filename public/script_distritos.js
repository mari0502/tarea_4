console.log("CARGAR DISTRITOS"); 

// Load data from the specified JSON file
d3.json("distritos.json").then(function(data) {
    const root = buildHierarchy(data);

    // Set up the dimensions and margins of the diagram
    const width = 960;
    const height = 960;
    const radius = Math.min(width, height) / 2;

    // Append the svg object to the body of the page
    const svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const partition = d3.partition()
        .size([Math.PI, radius]);

    const arc = d3.arc()
        .startAngle(d => d.x0 + Math.PI / 2) // Rotate 90° counterclockwise
        .endAngle(d => d.x1 + Math.PI / 2)   // Rotate 90° counterclockwise
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.length + 1));

    const rootData = d3.hierarchy(root)
        .sum(d => d.value);

    partition(rootData);

    svg.selectAll("path")
        .data(rootData.descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("fill", d => color((d.children ? d : d.parent).data.name))
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`Name: ${d.data.name}<br>Value: ${d.value}`);
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
}).catch(function(error) {
    console.error("Error loading the data: " + error);
});

// Function to convert the flat data to a hierarchical format
function buildHierarchy(data) {
    const root = { name: "root", children: [] };

    data.forEach(function(d) {
        // Check if the data has 'id' or 'ID'
        const parts = d.id ? d.id.split(".") : d.ID.split(".");
        const value = d.value ? d.value : d.POBL_2022;

        let currentNode = root;

        for (let i = 0; i < parts.length; i++) {
            const children = currentNode.children;
            const nodeName = parts[i];
            let childNode;

            if (i + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                let foundChild = false;
                for (let j = 0; j < children.length; j++) {
                    if (children[j].name === nodeName) {
                        childNode = children[j];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't find the node, create a new branch.
                if (!foundChild) {
                    childNode = { name: nodeName, children: [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = { name: nodeName, value: value };
                children.push(childNode);
            }
        }
    });
    return root;
}
