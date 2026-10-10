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
    this.id = `ni-line-chart-${Math.random().toString(36).substr(2, 9)}`;
    this.data = [];
    for (let i = 1; i <= 30; i++) {
      this.data.push({
        date: `2026-08-${i}`,
        value: Math.floor(Math.random() * 10) + 1
      });
    }
    this.options = {
      data: this.data,
      dotSize: 5,
      dotColor: "oklch(0.8435 0.1399 93.01)",
      activeDotColor: "red",
      activeDotSize: 7,
      lineColor: "oklch(0.8435 0.1399 93.01)",
      height: 500,
      width: 960,
      margin: { top: 20, right: 20, bottom: 30, left: 50 },
      tooltipField: null,
      tooltipPosition: "near", // options are side and near
      tooltopBackground: "rgba(0, 0, 0, 0.7)",
      tooltipColor: "#fff",
      tooltipPadding: "5px",
      tooltipBorderRadius: "3px"
    };
  }
  getAttributes() {
    for (const key in this.options) {
      const dataAttr = this.getAttribute(key);
      if (!dataAttr) {
        this[key] = this.options[key];
        continue;
      }
      if (key == "data") {
        this.data = JSON.parse(dataAttr);
        this.options.data = this.data;
      } else {
        this.options[key] = dataAttr;
        this[key] = this.options[key];
      }
    }
  }

  connectedCallback() {
    // this.attachShadow({ mode: "open" }).adoptedStyleSheets = [linechartStyles];

    // look for data attribute
    this.getAttributes();

    this.setChart();
    this.setUpTooltip();
  }
  setUpTooltip() {
    if (!this.tooltipField) {
      return;
    }
    this.tooltip = document.createElement("div");
    this.tooltip.style.background = this.tooltopBackground;
    this.tooltip.style.color = this.tooltipColor;
    this.tooltip.style.padding = this.tooltipPadding;
    this.tooltip.style.borderRadius = this.tooltipBorderRadius;
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.display = "none";
    if (this.tooltipPosition == "near") {
      // TODO: CONSIDER USING ANCHOR POSITION INSTEAD
      this.tooltip.style.position = "absolute";
      this.tooltip.style.top = "var(--tooltip-top)";
      this.tooltip.style.left = "var(--tooltip-left)";
    }
    if (this.tooltipPosition == "side") {
      if (this.querySelector("div.inner")) {
        this.querySelector("div.inner").style.display = "flex";
      }
    }
    if (this.querySelector("div.inner")) {
      this.querySelector("div.inner").appendChild(this.tooltip);
    } else {
      this.appendChild(this.tooltip);
    }
  }

  setChart() {
    const div = document.createElement("div");
    div.classList.add("inner");
    const $this = this;
    this.appendChild(div);

    d3.selectAll("#" + this.id + " > div.inner > svg").remove();
    const margin = this.margin;

    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const svg = d3
      .select("#" + this.id + "> div.inner")
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
      .attr("fill", this.dotColor);

    if (this.tooltipField) {
      svg
        .selectAll("circle")
        .on("mouseover", function (d, i) {
          const tooltipValue = i[$this.tooltipField];
          const dotBounds = d.target.getBoundingClientRect();
          d.target.style.cursor = "pointer";
          $this.tooltip.innerHTML = tooltipValue;
          $this.tooltip.style.display = "block";

          let actives = document.querySelectorAll("#" + $this.id + " circle.active");
          actives.forEach((active) => {
            active.classList.remove("active");
          });
          d.target.classList.add("active");

          const pageX = dotBounds.left + dotBounds.width / 2;
          const pageY = dotBounds.top + dotBounds.height / 2;

          const subtraction = 50;
          const addition = 30;

          $this.style.setProperty("--tooltip-top", pageY + addition + "px");
          $this.style.setProperty("--tooltip-left", pageX - subtraction + "px");
        })
        .on("mouseout", function () {
          // activeHover.value = null;
        });
    }
  }
  getDotSize() {
    return this.dotSize;
  }
}
customElements.define("ni-line-chart", NILineChart);
