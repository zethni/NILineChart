import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

class NILineChart extends HTMLElement {
  _addStyles() {
    if (document.getElementById("ni-linechart-styles")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "ni-linechart-styles";
    style.textContent = `
      ni-linechart {
        container-type: inline-size;
        container-name: ni-linechart;
        --tooltipFlexDirection: row;
      }
      ni-linechart .inner {
        position: relative;

        @container (width <= 600px) {
          flex-direction: column;
        }
      }
      ni-linechart svg {
        position: relative;
        max-width: 100%;
      }
      ni-linechart circle {
        fill: var(--dotcolor);
        r: var(--dotsize);
        transition: fill .4s ease, r .4s ease;
      }  
      ni-linechart circle.active {
        fill: var(--activedotcolor);    
        r: var(--activedotsize);
      }    
      ni-linechart.tooltip-side .inner {
        display: flex;    
        gap: 2rem;
        flex-direction: var(--tooltipFlexDirection);
      }
      ni-linechart.tooltip-side .ni-tooltip {
        max-height: 200px;
        width: calc(var(--tooltipwidth) * 1px);
      }`;
    document.head.appendChild(style);
  }
  constructor() {
    // Initialization code here
    super();
    // check for d3 variable
    if (typeof d3 === "undefined") {
      // set message to thius component
      this.textContent = "The d3 javascript library is not found";
      throw new Error("d3 is not loaded");
    }
    this._addStyles();
    this._setupDefaults();
  }

  connectedCallback() {
    // look for data attribute
    this._resetChart();
    this._setListeners();
  }
  disconnectedCallback() {
    this._removeListeners();
  }
  _setListeners() {
    // resize listener
    window.addEventListener("resize", () => {
      this._setChart();
      this._setDynamicWidth(true);
    });
  }
  _removeListeners() {
    window.removeEventListener("resize", this._setChart);
    window.removeEventListener("resize", this._setDynamicWidth);
  }
  _setupDefaults() {
    this.chartid = `ni-linechart-${Math.random().toString(36).substr(2, 9)}`;
    this.defaultdata = [];
    for (let i = 1; i <= 30; i++) {
      this.defaultdata.push({
        date: `2026-08-${i}`,
        value: Math.floor(Math.random() * 10) + 1
      });
    }
    this.options = {
      data: this.defaultdata,
      dotsize: 5,
      dotcolor: "oklch(0.8435 0.1399 93.01)",
      activedotcolor: "oklch(61.719% 0.24781 21.296)",
      activedotsize: 7,
      linecolor: "oklch(0.8435 0.1399 93.01)",
      height: null,
      width: null,
      margin: { top: 20, right: 20, bottom: 30, left: 50 },
      tooltipfield: null,
      tooltipposition: "near", // options are side and near
      tooltopbackground: "rgba(0, 0, 0, 0.7)",
      tooltipwidth: 150,
      tooltipcolor: "#fff",
      tooltippadding: "5px",
      tooltipborderradius: "3px",
      tooltipsidefoldwidth: 600,
      ratio: 2.5, // height to width ratio
      showtable: false
    };
  }
  _getAttributes() {
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
      this._setDynamicWidth();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._setAttributes({ [name]: newValue });
  }

  _setUpTooltip() {
    if (!this.tooltipfield) {
      return;
    }
    this.tooltip = document.createElement("div");
    this.tooltip.style.background = this.tooltopbackground;
    this.tooltip.style.color = this.tooltipcolor;
    this.tooltip.style.padding = this.tooltippadding;
    this.tooltip.style.borderRadius = this.tooltipborderradius;
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.display = "none";
    this.classList.add("tooltip-" + this.tooltipposition);
    this.tooltip.classList.add("ni-tooltip");
    if (this.tooltipposition == "near") {
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

  _setAttributes(changes) {
    for (const key in changes) {
      if (changes.hasOwnProperty(key)) {
        this.setAttribute(key, changes[key]);
        this[key] = changes[key];
      }
    }
    this._resetChart();
  }
  _setDynamicWidth(r = false) {
    if (this.parentElement) {
      if (
        this.tooltipfield &&
        this.tooltipposition == "side" &&
        this.parentElement.offsetWidth > this.tooltipsidefoldwidth
      ) {
        this.width = this.parentElement.offsetWidth - this.tooltipwidth;
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
  _resetChart() {
    this._getAttributes();
    this._setChart();
    this._showTable();
  }
  _showTable() {
    if (this.showtable) {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      const headerRow = document.createElement("tr");
      Object.keys(this.data[0]).forEach((key) => {
        if (key === "tooltip") return; // Skip the tooltip column in the table header
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      this.data.forEach((row, i) => {
        const tr = document.createElement("tr");
        Object.values(row).forEach((value) => {
          // if the key is "tooltip", skip this value
          if (value === row.tooltip) {
            return;
          }
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);

      if (this.querySelector("div.inner")) {
        this.querySelector("div.inner").appendChild(table);
      } else {
        this.appendChild(table);
      }
    }
  }

  _setChart() {
    const $this = this;
    if (!this.querySelector("div.inner")) {
      const div = document.createElement("div");
      div.classList.add("inner");
      div.id = this.chartid;
      this.appendChild(div);
      this.chartWrapper = div;
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
    y.domain([0, d3.max(this.data, (d) => d.value)]);

    svg
      .append("g")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));
    svg
      .append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", this.linecolor)
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg
      .append("g")
      .selectAll("dot")
      .data($this.data)
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
    // .attr("fill", this.dotcolor);

    if (this.tooltipfield) {
      svg
        .selectAll("circle")
        .on("mouseover", function (d, i) {
          const tooltipValue = i[$this.tooltipfield];
          const dotBounds = d.target.getBoundingClientRect();
          const innerBounds = $this.chartWrapper.getBoundingClientRect();

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
    $this._setUpTooltip();
  }
  getDotSize() {
    return this.dotsize;
  }
}
customElements.define("ni-linechart", NILineChart);
