<!doctype html>
<html lang="en">
  <head>
    <title>Next Iteration - Projects</title>
  </head>
  <style>
    @layer old, new;
    @import url("/style.css") layer(old);
    @import url("/style2026.css") layer(new);
  </style>
  <script type="module" src="/assets/js/ni-header.js"></script>
  <script type="module" src="/assets/js/components/NILineChart/ni-linechart.js"></script>
  <meta name="view-transition" content="same-origin" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <body>
    <ni-header></ni-header>
    <main>
      <script>
        const lineData = [
          { date: "2025-03-22", value: 7, tooltip: "March 22, 2025" },
          { date: "2025-03-29", value: 7, tooltip: "March 29, 2025" },
          { date: "2025-05-01", value: 9, tooltip: "May 1, 2025" },
          { date: "2025-05-02", value: 9.5, tooltip: "May 2, 2025" },
          { date: "2025-05-03", value: 8.5, tooltip: "May 3, 2025" },
          { date: "2025-05-04", value: 8.5, tooltip: "May 4, 2025" },
          { date: "2025-05-05", value: 9.5, tooltip: "May 5, 2025" },
          { date: "2025-05-25", value: 8.5, tooltip: "May 25, 2025" },
          { date: "2025-05-28", value: 9, tooltip: "May 28, 2025" },
          { date: "2025-05-29", value: 8, tooltip: "May 29, 2025" },
          { date: "2025-07-02", value: 9, tooltip: "July 2, 2025" },
          { date: "2025-07-03", value: 10, tooltip: "July 3, 2025" },
          { date: "2025-07-11", value: 8.5, tooltip: "July 11, 2025" },
          { date: "2025-07-14", value: 9, tooltip: "July 14, 2025" },
          { date: "2025-07-15", value: 8.5, tooltip: "July 15, 2025" },
          { date: "2025-09-06", value: 9, tooltip: "September 6, 2025" }
        ];
      </script>
      <h2>First one - with a near position</h2>
      <ni-line-chart id="line" tooltipField="tooltip" activeDotColor="orange"></ni-line-chart>

      <h2>Second one - with a side position</h2>
      <ni-line-chart id="line2" tooltipField="tooltip" tooltipPosition="side"></ni-line-chart>
      <script>
        const lineChart = document.getElementById("line");
        const lineChart2 = document.getElementById("line2");
        lineChart.setAttribute("data", JSON.stringify(lineData));
        lineChart2.setAttribute("data", JSON.stringify(lineData));
      </script>
    </main>
  </body>
</html>
