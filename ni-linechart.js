import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const NILineChartStyles = new CSSStyleSheet();
NILineChartStyles.replaceSync(`
  ni-line-chart {
    container-type: inline-size;
    container-name: ni-line-chart;
    --tooltipFlexDirection: row;
  }
  ni-line-chart .inner {
    position: relative;

    @container (width <= 600px) {
      flex-direction: column;
    }
  }
  ni-line-chart svg {
    position: relative;
    max-width: 100%;
  }
  ni-line-chart circle {
    fill: var(--dotColor);
    r: var(--dotSize);
    transition: fill .4s ease, r .4s ease;
  }  
  ni-line-chart circle.active {
    fill: var(--activeDotColor);    
    r: var(--activeDotSize);
  }    
  ni-line-chart.tooltip-side .inner {
    display: flex;    
    gap: 2rem;
    flex-direction: var(--tooltipFlexDirection);
  }
  ni-line-chart.tooltip-side .ni-tooltip {
    max-height: 200px;
    width: calc(var(--tooltipWidth) * 1px);
  }
  
`);
class NILineChart extends HTMLElement {
  constructor() {
    // Initialization code here
    super();

    // create link to stylesheet -- this only works if we keep the url consistent, so isn't replicable
    document.adoptedStyleSheets = [NILineChartStyles];

    // check for d3 variable
    if (typeof d3 === "undefined") {
      // set message to thius component
      this.textContent = "The d3 javascript library is not found";
      throw new Error("d3 is not loaded");
    }
    this.setupDefaults();
  }

  connectedCallback() {
    // look for data attribute
    this.getAttributes();

    this.setChart();
    this.setListeners();
  }
  setListeners() {
    // resize listener
    window.addEventListener("resize", () => {
      this.setChart();
      this.setDynamicWidth(true);
    });
  }
  setupDefaults() {
    this.chartid = `ni-line-chart-${Math.random().toString(36).substr(2, 9)}`;
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
      activeDotColor: "oklch(61.719% 0.24781 21.296)",
      activeDotSize: 7,
      lineColor: "oklch(0.8435 0.1399 93.01)",
      height: null,
      width: null,
      margin: { top: 20, right: 20, bottom: 30, left: 50 },
      tooltipField: null,
      tooltipPosition: "near", // options are side and near
      tooltopBackground: "rgba(0, 0, 0, 0.7)",
      tooltipWidth: 150,
      tooltipColor: "#fff",
      tooltipPadding: "5px",
      tooltipBorderRadius: "3px",
      tooltipSideFoldWidth: 600,
      ratio: 2.5 // height to width ratio
    };
  }
  getAttributes() {
    for (const key in this.options) {
      const dataAttr = this.getAttribute(key);
      if (!dataAttr) {
        this[key] = this.options[key];
        this.style.setProperty("--" + key, this.options[key]);
        continue;
      }
      if (key == "data") {
        this.data = JSON.parse(dataAttr);
        this.options.data = this.data;
      } else {
        this.options[key] = dataAttr;
        this[key] = this.options[key];
        this.style.setProperty("--" + key, this.options[key]);
      }
    }

    if (!this.width) {
      this.setDynamicWidth();
    }
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
    this.classList.add("tooltip-" + this.tooltipPosition);
    this.tooltip.classList.add("ni-tooltip");
    if (this.tooltipPosition == "near") {
      // TODO: CONSIDER USING ANCHOR POSITION INSTEAD
      // NOT READY FOR PRIMETIME YET - https://github.com/w3c/csswg-drafts/issues/11301
      this.tooltip.style.position = "absolute";
      this.tooltip.style.top = "var(--tooltip-top)";
      this.tooltip.style.left = "var(--tooltip-left)";
    }

    if (this.querySelector("div.inner")) {
      this.querySelector("div.inner").appendChild(this.tooltip);
    } else {
      this.appendChild(this.tooltip);
    }
  }
  setDynamicWidth(r = false) {
    if (this.parentElement) {
      if (
        this.tooltipField &&
        this.tooltipPosition == "side" &&
        this.parentElement.offsetWidth > this.tooltipSideFoldWidth
      ) {
        this.width = this.parentElement.offsetWidth - this.tooltipWidth;
        this.options.width = this.width;
        this.style.setProperty("--tooltipFlexDirection", "row");
      } else {
        this.width = this.parentElement.offsetWidth;
        this.options.width = this.width;
        this.style.setProperty("--tooltipFlexDirection", "column");
      }

      if (!this.height || r) {
        this.height = this.width / this.ratio;
        this.options.height = this.height;
      }
    }
  }

  setChart() {
    const $this = this;
    if (!this.querySelector("div.inner")) {
      const div = document.createElement("div");
      div.classList.add("inner");
      div.id = this.chartid;
      this.appendChild(div);
    }
    d3.selectAll("#" + this.chartid + " > *").remove();

    const margin = this.margin;

    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const svg = d3
      .select("#" + this.chartid)
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
      });
    // .attr("fill", this.dotColor);

    if (this.tooltipField) {
      svg
        .selectAll("circle")
        .on("mouseover", function (d, i) {
          const tooltipValue = i[$this.tooltipField];
          const dotBounds = d.target.getBoundingClientRect();
          const innerBounds = $this.querySelector(".inner").getBoundingClientRect();

          d.target.style.cursor = "pointer";
          $this.tooltip.innerHTML = tooltipValue;
          $this.tooltip.style.display = "block";

          let actives = document.querySelectorAll("#" + $this.chartid + " circle.active");
          actives.forEach((active) => {
            active.classList.remove("active");
          });
          d.target.classList.add("active");

          const pageX = dotBounds.left - innerBounds.left + dotBounds.width / 2;
          const pageY = dotBounds.top - innerBounds.top + dotBounds.height / 2;

          const subtraction = 50;
          const addition = 30;

          $this.style.setProperty("--tooltip-top", pageY + addition + "px");
          $this.style.setProperty("--tooltip-left", pageX - subtraction + "px");
        })
        .on("mouseout", function () {
          // activeHover.value = null;
        });
    }
    $this.setUpTooltip();
  }
  getDotSize() {
    return this.dotSize;
  }
}
customElements.define("ni-linechart", NILineChart);
