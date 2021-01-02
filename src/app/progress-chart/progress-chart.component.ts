import { AfterViewInit, Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Chart } from "chart.js"
import * as moment from "moment"
import { LevelsChart } from "./levels-chart"
import { CountsChart } from "./counts-chart"

type ChartTimeSpan = "ALL" | "LAST_MONTH" | "LAST_3_MONTHS"
type ChartCriteria = "LEVEL" | "PASSED_AT" | "BURNED_AT"


@Component({
  selector: "app-progress-dashboard",
  templateUrl: "./progress-chart.component.html",
  styleUrls: [ "./progress-chart.component.scss" ]
})
export class ProgressChartComponent implements OnInit, AfterViewInit {

  private levelsChart: LevelsChart
  private countsChart: CountsChart

  private chart: Chart
  currentTimeSpan: ChartTimeSpan = "LAST_MONTH"
  currentCriteria: ChartCriteria = "PASSED_AT"
  loading = false

  constructor(private wanikani: WanikaniService) {
  }

  ngOnInit(): void {
    // Show "loading" until all backend data has arrived, and the chart has been rendered
    this.loading = true
  }

  ngAfterViewInit(): void {
    Promise.all([ this.wanikani.getLevelProgressions(), this.wanikani.getAllAssignments() ])
      .then(([ allLevels, allAssignments ]) => {
        this.levelsChart = new LevelsChart(allLevels)
        this.countsChart = new CountsChart(allAssignments)
        this.regenerateChartData()
      })
      .catch(console.error)
      .finally(() => this.loading = false)
  }

  private regenerateChartData(): void {
    if (this.chart) {
      this.chart.destroy()
    }
    this.chart = this.createChart()
    this.changeTimeSpan(this.currentTimeSpan)
  }

  public changeTimeSpan(timespan: ChartTimeSpan): void {
    let min

    switch (timespan) {
      case "LAST_MONTH":
        min = moment().subtract(1, "months").startOf("day")
        break
      case "LAST_3_MONTHS":
        min = moment().subtract(3, "months").startOf("day")
        break
      case "ALL":
        min = this.currentCriteria === "LEVEL" ? this.levelsChart.getMinX() : this.countsChart.getMinX(this.currentCriteria)
    }

    this.currentTimeSpan = timespan
    this.chart.options.scales.xAxes[0].time = { min }
    this.chart.update()
  }

  public changeCriteria(criteria: ChartCriteria): void {
    this.currentCriteria = criteria
    this.regenerateChartData()

    if (this.currentCriteria === "LEVEL") {
      this.changeTimeSpan("ALL")
    }

    this.chart.update()
  }

  private createChart(): Chart {
    let datasets, yAxes
    if (this.currentCriteria === "LEVEL") {
      datasets = this.levelsChart.getDataset()
      yAxes = this.levelsChart.getYAxes()
    } else {
      datasets = this.countsChart.getDataset(this.currentCriteria)
      yAxes = this.countsChart.getYAxes()
    }

    const ctx = (document.getElementById("dashboardChart") as any).getContext("2d")
    const config = {
      type: "line",
      data: {
        datasets
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                tooltipFormat: "YYYY-MM-DD h:mm a",
                displayFormats: {
                  day: "ddd, MMM DD"
                },
                unit: "day"
              },
              display: true,
              gridLines: {
                drawTicks: true,
              },
              scaleLabel: {
                display: true,
                labelString: "Date"
              }
            }
          ],
          yAxes
        },
        title: {
          display: true,
          text: `WaniKani Progress`
        },
      }
    }
    return new Chart(ctx, config)
  }
}
