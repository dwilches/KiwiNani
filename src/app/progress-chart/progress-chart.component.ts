import { AfterViewInit, Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Chart } from "chart.js"
import * as moment from "moment"
import { LevelsChart } from "./levels-chart"
import { CountsChart } from "./counts-chart"
import { JlptChart } from "./jlpt-chart"

type ChartTimeSpan = "ALL" | "LAST_MONTH" | "LAST_3_MONTHS"
type ChartCriteria = "LEVEL" | "PASSED_AT" | "BURNED_AT" | "JLPT"


@Component({
  selector: "app-progress-dashboard",
  templateUrl: "./progress-chart.component.html",
  styleUrls: [ "./progress-chart.component.scss" ]
})
export class ProgressChartComponent implements OnInit, AfterViewInit {

  private levelsChart: LevelsChart
  private countsChart: CountsChart
  private jlptChart: JlptChart

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
    this.levelsChart = new LevelsChart()
    this.countsChart = new CountsChart()
    this.jlptChart = new JlptChart()

    Promise
      .all([
        this.levelsChart.initialize(this.wanikani),
        this.countsChart.initialize(this.wanikani),
        this.jlptChart.initialize(this.wanikani)
      ])
      .then(() => {
        this.regenerateChartData()
        this.loading = false
      })
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
        min = this.currentCriteria === "LEVEL"
          ? this.levelsChart.getMinX()
          : this.currentCriteria === "JLPT"
            ? this.jlptChart.getMinX()
            : this.countsChart.getMinX(this.currentCriteria)
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
    let config
    if (this.currentCriteria === "LEVEL") {
      config = this.levelsChart.getChartConfig()
    } else if (this.currentCriteria === "JLPT") {
      config = this.jlptChart.getChartConfig()
    } else {
      config = this.countsChart.getChartConfig(this.currentCriteria)
    }

    const ctx = (document.getElementById("dashboardChart") as any).getContext("2d")
    return new Chart(ctx, config)
  }
}
