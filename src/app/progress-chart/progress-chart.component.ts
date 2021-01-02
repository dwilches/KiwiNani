import { AfterViewInit, Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Chart } from "chart.js"
import * as moment from "moment"
import { LevelsChart } from "./levels-chart"
import { CountsChart } from "./counts-chart"
import { JlptChart } from "./jlpt-chart"
import { animate, style, transition, trigger } from "@angular/animations"

type ChartTimeSpan = "ALL" | "LAST_MONTH" | "LAST_3_MONTHS"
type ChartCriteria = "LEVEL" | "PASSED_AT" | "BURNED_AT" | "JLPT"


@Component({
  selector: "app-progress-dashboard",
  templateUrl: "./progress-chart.component.html",
  styleUrls: [ "./progress-chart.component.scss" ],
  animations: [
    trigger("fadeInOutTrigger", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate(".5s ease", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate(".5s ease", style({ opacity: 0 }))
      ])
    ])
  ]
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

  public getCriteriaClass(level: string): string {
    return this.currentCriteria === level ? "btn-primary app-primary-button" : "btn-secondary"
  }

  public getTimespanClass(timespan: string): string {
    return this.currentTimeSpan === timespan ? "btn-primary app-primary-button" : "btn-secondary"
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

    if (this.currentCriteria === "LEVEL") {
      min = this.levelsChart.getMinX()
    } else if (this.currentCriteria === "JLPT") {
      min = this.jlptChart.getMinX()
    } else {
      switch (timespan) {
        case "LAST_MONTH":
          min = moment().subtract(1, "months").startOf("day")
          break
        case "LAST_3_MONTHS":
          min = moment().subtract(3, "months").startOf("day")
          break
        case "ALL":
          min = this.countsChart.getMinX(this.currentCriteria)
      }
    }

    this.currentTimeSpan = timespan
    this.chart.options.scales.xAxes[0].time = { min }
    this.chart.update()
  }

  public changeCriteria(criteria: ChartCriteria): void {
    this.currentCriteria = criteria
    this.regenerateChartData()
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
