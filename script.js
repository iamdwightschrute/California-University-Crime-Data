function createBarChart(containerId, dataUrl, valueField, categoryField) {
    // Load JSON data
    d3.json(dataUrl).then(function(data) {
        // Filter data to ensure it's clean and ready for use
        data = data.filter(d => d[valueField] && d[categoryField]);

        // Sort the data by the specified value field in descending order and take the top 25
        data = data.sort((a, b) => b[valueField] - a[valueField]).slice(0, 25);

        // Get the container element
        const container = document.querySelector('#' + containerId);

        // Adjusted dimensions and margins to fit new CSS settings
        const margin = {top: 30, right: 20, bottom: 70, left: 70},
              width = container.clientWidth - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;  // Using fixed height from your CSS setup

        // Append the svg object to the div with specified container ID
        const svg = d3.select('#' + containerId)
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
          .domain([0, d3.max(data, d => +d[valueField])])
          .range([0, width]);
        svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleBand()
          .range([0, height])
          .domain(data.map(d => d[categoryField]))
          .padding(0.1);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("rect")
          .data(data)
          .join("rect")
          .attr("x", x(0))
          .attr("y", d => y(d[categoryField]))
          .attr("width", d => x(d[valueField]))
          .attr("height", y.bandwidth())
          .attr("fill", "#69b3a2");
    }).catch(error => console.error('Error loading the data: ' + error));
}

// Example of using this function
createBarChart("barChart", "csvjson.json", "Violent crime", "Campus");

///******************************************* */



// 2nd chart
// Function to draw the pie chart
function drawPieChart(data) {
    // Set the dimensions and margins of the graph
    const width = 750,
          height = 450,
          margin = 40;

    // The radius of the pie chart is half the smallest side
    const radius = Math.min(width, height) / 2 - margin;

    // Append the svg object to the div with id "pieChart"
    const svg = d3.select("#pieChart")
      .html("") // Clear any previous SVG content
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Set the color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.crime))
      .range(d3.schemeCategory10);

    // Compute the position of each group on the pie
    const pie = d3.pie()
      .value(d => d.value);

    // Shape helper to build arcs
    const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    
      const arcLabel = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    // Build the pie chart
    const arcs = svg.selectAll('mySlices')
      .data(pie(data))
      .enter();

    arcs.append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data.crime))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add labels to pie chart
    arcs.append("text")
        .filter(d => (d.data.value / d3.sum(data, d => d.value)) > 0.1)  // Filter slices greater than 10%
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "black")  // Change font color to black or another high-contrast color
        .style("text-shadow", "1px 1px 2px white")  // Adding white text shadow for better visibility
        .text(d => `${((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1)}%`);


    // Legend setup
    const legend = svg.append("g")
      .attr("transform", `translate(${-width / 2 + 20},${-height / 2 + 20})`)
      .attr("class", "legend")
      .selectAll(".legendItem")
      .data(color.domain())
      .enter().append("g")
        .attr("class", "legendItem")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Draw rectangles for legend
    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

    // Draw text for legend
    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d);



    // Build the pie chart
    svg
      .selectAll('mySlices')
      .data(pie(data))
      .join('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data.crime))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    
}

// Load data and populate the dropdown
d3.json("csvjson.json").then(function(data) {
    // Populate the dropdown with campus names
    const campuses = Array.from(new Set(data.map(d => d.Campus).filter(Boolean)));
    const dropdown = d3.select("#campusSelect");

    // Append the default select prompt
    dropdown.append('option')
        .text("Select the Campus")
        .attr("disabled", true)
        .attr("selected", true);

    // Append actual campus options
    dropdown.selectAll('option.campus-option')
        .data(campuses)
        .enter()
        .append('option')
        .classed('campus-option', true) // Add a class for styling or specific selection if needed
        .text(d => d);

    // Handle changes in selection
    dropdown.on("change", function(event) {
        const selectedCampus = d3.select(this).property("value");
        const campusData = data.find(d => d.Campus === selectedCampus);
        if (campusData) {
            const crimeData = [
                {crime: "Robbery", value: campusData.Robbery},
                {crime: "Aggravated assault", value: campusData["Aggravated assault"]},
                {crime: "Burglary", value: campusData.Burglary},
                {crime: "Larceny-theft", value: campusData["Larceny-theft"]},
                {crime: "Motor vehicle theft", value: campusData["Motor vehicle theft"]}
            ];
            drawPieChart(crimeData);
        }
    });

    // Initial load with no data
    drawPieChart([]);  // Draw an empty chart or display a message
});

//********************************************************* */

function createScatterPlot(containerId, dataUrl) {
    // Load the data from a local JSON file
    d3.json(dataUrl).then(function(data) {
        // Data parsing and processing
        const processedData = data.map(d => ({
            university: d['University/College'],
            enrollment: parseInt(d['Student enrollment'].replace(/,/g, '')),
            violentCrimes: d['Violent crime'],
            propertyCrimes: d['Property crime'],
            totalCrimes: d['Violent crime'] + d['Property crime']
        }));

        // Get the dimensions of the container to size the SVG correctly
        const container = document.getElementById(containerId);
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Clear any previous content and append SVG object to the div
        const svg = d3.select("#" + containerId)
                      .html("")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", height)
                      .style("background-color", "lightblue")
                      .append("g")
                      .attr("transform", `translate(${width * 0.1}, ${height * 0.1})`);

        // Scale adjustments based on container size
        const x = d3.scaleLinear()
                    .domain([0, d3.max(processedData, d => d.enrollment)])
                    .range([0, width * 0.8]);  // Use 80% of width for graph
        const y = d3.scaleLinear()
                    .domain([0, d3.max(processedData, d => d.totalCrimes)])
                    .range([height * 0.8, 0]);  // Use 80% of height for graph

        // Add X and Y axis
        svg.append("g")
           .attr("transform", `translate(0, ${height * 0.8})`)
           .call(d3.axisBottom(x));

        svg.append("g")
           .call(d3.axisLeft(y));

        // Add dots for violent crimes
        svg.append('g')
           .selectAll("dot.violent")
           .data(processedData)
           .enter()
           .append("circle")
             .attr("cx", d => x(d.enrollment))
             .attr("cy", d => y(d.violentCrimes))
             .attr("r", 5)
             .style("fill", "#FF6347");  // Tomato color for violent crimes

        // Add dots for property crimes
        svg.append('g')
           .selectAll("dot.property")
           .data(processedData)
           .enter()
           .append("circle")
             .attr("cx", d => x(d.enrollment))
             .attr("cy", d => y(d.propertyCrimes))
             .attr("r", 5)
             .style("fill", "#4682B4");  // Steel blue color for property crimes

        // Optional: Add labels or tooltips here for additional information
    }).catch(function(error) {
        console.error('Error loading the data: ' + error);
    });
}

// Example usage
createScatterPlot("scatterplot", "data.json");


// 3rd chart 
// Line chart 
// Load JSON data

d3.json("csvjson.json").then(function(data) {
    // Aggregate data by university, summing all relevant crimes
    const aggregatedData = {};
    data.forEach(d => {
        if (!aggregatedData[d["University/College"]]) {
            aggregatedData[d["University/College"]] = {
                "University/College": d["University/College"],
                "Violent Crime": 0,  // Includes violent crime, robbery, rape, murder, aggravated assault
                "Property Crime": 0  // Includes property crime, burglary, larceny-theft, motor vehicle theft
            };
        }
        aggregatedData[d["University/College"]]["Violent Crime"] += (+d["Violent crime"] + +d["Robbery"] + +d["Rape (revised definition)"] + +d["Murder and nonnegligent manslaughter"] + +d["Aggravated assault"]);
        aggregatedData[d["University/College"]]["Property Crime"] += (+d["Property crime"] + +d["Burglary"] + +d["Larceny-theft"] + +d["Motor vehicle theft"]);
    });

    // Convert the aggregated object to an array
    let processedData = Object.values(aggregatedData);

    /// List of universities to exclude
    const excludedUniversities = ["University of California", "California State University"];

// Filter function to exclude any university whose name contains any string in the list
    processedData = processedData.filter(d =>
        !excludedUniversities.some(excludedName => d["University/College"].includes(excludedName))
);

    // Calculate total for sorting
    processedData.forEach(d => {
        d.total = d["Violent Crime"] + d["Property Crime"]; // Calculate total crimes for sorting
    });

    // Sort the array by the total crimes in descending order
    processedData.sort((a, b) => b.total - a.total);
    // Define SVG dimensions and margins
    const margin = {top: 20, right: 20, bottom: 150, left: 60},
          svgWidth = 960,
          svgHeight = 500,
          width = svgWidth - margin.left - margin.right,
          height = svgHeight - margin.top - margin.bottom;

    // Create SVG and append to the container
    const svg = d3.select("#stacked-bar-chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale for crimes
    const color = d3.scaleOrdinal()
        .domain(["Violent Crime", "Property Crime"])
        .range(["#ca0020", "#377eb8"]);

    // Stack the data
    const stack = d3.stack().keys(["Violent Crime", "Property Crime"]);
    const layers = stack(processedData);

    // Scales for the axes
    const x = d3.scaleBand()
        .domain(processedData.map(d => d["University/College"]))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(layers, layer => d3.max(layer, d => d[1]))])
        .range([height, 0]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Draw the bars
    svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .attr("fill", layer => color(layer.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x(d.data["University/College"]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]));

    // Adding the legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + (width - 100) + ",0)")
        .selectAll("g")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", -10)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);
}).catch(function(error) {
    console.error("Error loading the data:", error);
});



// Chart 4 
// Correlation Matrix 
// Path to your data file
const dataURL = "csvjson.json";

// Load JSON data
d3.json(dataURL).then(function(data) {
    // Assuming you want to calculate correlation for a matrix after loading
    const variables = ["Violent crime", "Property crime", "Student enrollment", "Burglary"];
    const correlationMatrix = calculateCorrelation(data, variables);

    // Now you can pass this 'correlationMatrix' to a function that creates the correlation heatmap
    drawCorrelationMatrix(correlationMatrix, variables);
}).catch(function(error) {
    console.error("Error loading the data:", error);
});

function calculateCorrelation(data, variables) {
    const n = data.length;
    let matrix = variables.map((_, i) => variables.map((_, j) => {
        if (i === j) return 1;  // Correlation of a variable with itself is 1

        let sum1 = 0, sum2 = 0, sum1sq = 0, sum2sq = 0, pSum = 0;
        data.forEach(d => {
            const x = +d[variables[i]];
            const y = +d[variables[j]];
            sum1 += x;
            sum2 += y;
            sum1sq += x * x;
            sum2sq += y * y;
            pSum += x * y;
        });
        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1sq - sum1 * sum1 / n) * (sum2sq - sum2 * sum2 / n));
        return num / den;
    }));

    return matrix;
}

function drawCorrelationMatrix(data, variables) {
    const margin = {top: 50, right: 20, bottom: 100, left: 100},
          width = 600 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#correlationMatrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(variables)
        .padding(0.05);

    const yScale = d3.scaleBand()
        .range([0, height])
        .domain(variables)
        .padding(0.05);

    const colorScale = d3.scaleSequential(t => d3.interpolateRdBu(Math.pow(t, 3))) // Cubing the input to emphasize extremes
        .domain([-1, 1]);
    

    // Draw correlation cells
    svg.selectAll().data(data.flat()).enter().append("rect")
        .attr("x", (d, i) => xScale(variables[i % variables.length]))
        .attr("y", (d, i) => yScale(variables[Math.floor(i / variables.length)]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d));

    // Axes setup
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale).tickSize(0)).select(".domain").remove();
    svg.append("g").call(d3.axisLeft(yScale).tickSize(0)).select(".domain").remove();

    // **Legend setup starts here**
    const legendWidth = 300, legendHeight = 20;
    const legendSvg = svg.append("g")
        .attr("transform", `translate(${(width - legendWidth) / 2},${height + 40})`);

    const legendScale = d3.scaleLinear().domain([-1, 1]).range([0, legendWidth]);
    legendSvg.append("defs").append("linearGradient").attr("id", "gradient")
        .selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({offset: `${100*i/n.length}%`, color: colorScale(t)})))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient)");

    legendSvg.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).tickSize(6).ticks(8))
        .select(".domain").remove();

        

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "80px")
        .style("height", "30px")
        .style("padding", "2px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none");

    svg.selectAll()
        .data(data.flat())
        .enter().append("rect")
        .attr("x", (d, i) => xScale(variables[i % variables.length]))
        .attr("y", (d, i) => yScale(variables[Math.floor(i / variables.length)]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d))
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Correlation: " + d.toFixed(2))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add the axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .select(".domain").remove();

        svg.append("g")
            .call(d3.axisLeft(yScale).tickSize(0))
            .select(".domain").remove();
    }

/************************************ */
//Chart 5 
// Histogram 


// Load JSON data
// Load JSON data
d3.json("csvjson.json").then(function(data) {
    data = data.filter(d => d["Student enrollment"] > 0 && d["Violent crime"] > 0);
    console.log("Data Loaded: ", data);  // Corrected typo in log statement

    // Filter out potential outliers or incorrect data if necessary
    data = data.filter(d => d["Student enrollment"] > 0 && d["Violent crime"] > 0);

    // Set dimensions and margins of the graph
    const margin = {top: 20, right: 20, bottom: 40, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Append the svg object to the div with id "scatterPlot"
    const svg = d3.select("#scatterPlot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLog()  // Using logarithmic scale to handle wide data range
      .domain([1, d3.max(data, d => Math,max(1,d["Student enrollment"]))])  // Ensure domain starts from 1 to avoid log(0)
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("~s")));  // Formatting for readability

    // Add Y axis
    const y = d3.scaleLog()  // Using logarithmic scale
      .domain([1, d3.max(data, d => Math,max(1,d["Violent crime"]))])  // Ensure domain starts from 1 to avoid log(0)
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("~s")));  // Formatting for readability

    // Add dots
    svg.append("g")
      .selectAll("circle")  // Ensure the selector is correct
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", x(100))  // Example: 100 students
      .attr("cy", y(10))   // Example: 10 violent crimes
      .attr("r", 10)
      .style("fill", "red");
    
}).catch(function(error) {
    console.error("Error loading the data:", error);
});


// Load data
d3.json("csvjson.json").then(function(data) {
    // Filter data to ensure only relevant entries are included
    data = data.map(d => +d["Larceny-theft"]).filter(value => !isNaN(value));

    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select("#histogram")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set the ranges for x-axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([0, width]);

    // Set the parameters for the histogram
    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(20));  // Adjust number of bins here

    // Bin the data
    const bins = histogram(data);

    // Set the y-axis range
    const y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, d => d.length)]); // Scale the y-axis based on maximum frequency

    // Append the bar rectangles to the svg element
    svg.selectAll("rect")
      .data(bins)
      .enter().append("rect")
        .attr("x", 1)
        .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .style("fill", "#69b3a2");

    // Add the x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add the y-axis
    svg.append("g")
      .call(d3.axisLeft(y));
}).catch(error => console.error("Error loading the data:", error));


// Chart 5 
// Bubble chart 



// new scatter plot  
// new findings 



