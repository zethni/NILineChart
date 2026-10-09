import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
class NILineChart extends HTMLElement {
  constructor() {
    // Initialization code here
    super();
    // check for d3 variable
    if (typeof d3 === "undefined") {
      // set message to thius component
      this.textContent = "The d3 javascript library is not found";
      throw new Error("d3 is not loaded");
    }
    this.setupDefaults();
  }
  setupDefaults() {
    this.paramOptions = ["data", "dotSize", "dotColor", "lineColor", "width", "height", "margin"];
    this.id = `ni-line-chart-${Math.random().toString(36).substr(2, 9)}`;
    this.data = [];
    for (let i = 1; i <= 30; i++) {
      this.data.push({
        date: `2026-08-${i}`,
        value: Math.floor(Math.random() * 10) + 1
      });
    }
    this.dotSize = 5;
    this.dotColor = "oklch(0.8435 0.1399 93.01)";

    this.lineColor = "oklch(0.8435 0.1399 93.01)";
    this.width = 960;
    this.height = 500;
    this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
  }
  getAttributes() {
    this.paramOptions.forEach((attr) => {
      console.log({ attr });
      const dataAttr = this.getAttribute(attr);
      if (!dataAttr) {
        return;
      }
      if (attr == "data") {
        this.data = JSON.parse(dataAttr);
      } else {
        this[attr] = dataAttr;
      }
    });
  }

  connectedCallback() {
    // look for data attribute
    this.getAttributes();

    this.setChart();
  }

  setChart() {
    const div = document.createElement("div");
    const $this = this;
    this.appendChild(div);
    div.id = this.id;

    d3.selectAll("#" + this.id.value + " > *").remove();
    const margin = this.margin;
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    const x = d3.scaleTime().range([0, innerWidth]);
    const y = d3.scaleLinear().range([innerHeight, 0]);

    const parseTime = d3.timeParse("%Y-%m-%d");

    const line = d3
      .line()
      .x((d) => x(parseTime(d.date)))
      .y((d) => y(d.value));

    // const straightline = d3
    //   .line()
    //   .x((d) => x(d.date))
    //   .y((d) => y(d.value));

    x.domain(
      d3.extent(this.data, (d) => {
        return parseTime(d.date);
      })
    );
    y.domain([0, 10]);

    svg
      .append("g")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", this.lineColor)
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg
      .append("g")
      .selectAll("dot")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(parseTime(d.date));
      })
      .attr("cy", function (d) {
        return y(d.value);
      })
      .attr("r", function (d) {
        return $this.getDotSize();
      })
      .attr("fill", this.dotColor)
      .on("mouseover", function (d, i) {
        let index = this.data.indexOf(i);
        activeHover.value = index;
        const dotBounds = d.target.getBoundingClientRect();
        d.target.style.cursor = "pointer";
        let actives = document.querySelectorAll("#" + this.id.value + " circle.active");
        actives.forEach((active) => {
          active.classList.remove("active");
        });
        d.target.classList.add("active");

        const pageX = dotBounds.left + dotBounds.width / 2;
        const pageY = dotBounds.top + dotBounds.height / 2;

        const subtraction = 50;
        const addition = 30;
        let root = document.querySelector(":root");
        root.style.setProperty("--tooltip-top", pageY + addition + "px");
        root.style.setProperty("--tooltip-left", pageX - subtraction + "px");
      })
      .on("mouseout", function () {
        // activeHover.value = null;
      });
  }
  getDotSize() {
    return this.dotSize;
  }
}
customElements.define("ni-line-chart", NILineChart);
