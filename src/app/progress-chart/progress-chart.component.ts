import { AfterViewInit, Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Chart } from "chart.js"
import * as moment from "moment"
import { Moment } from "moment"
import * as _ from "lodash"

type Level = { date: Moment, level: number }
type Assignment1 = { date: Moment, total: number, kanjis: number, radicals: number, vocabulary: number }
type AssignmentAccumulator = { total: number, radicals: number, kanjis: number, vocabulary: number }

type ChartTimeSpan = "ALL" | "LAST_MONTH" | "LAST_3_MONTHS"
type ChartCriteria = "LEVEL" | "PASSED_AT" | "BURNED_AT"


@Component({
  selector: "app-progress-dashboard",
  templateUrl: "./progress-chart.component.html",
  styleUrls: [ "./progress-chart.component.css" ]
})
export class ProgressChartComponent implements OnInit, AfterViewInit {

  private allLevels: Level[]
  private allAssignments: Assignment[]

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
    Promise.all([ this.getLevels(), this.wanikani.getAllAssignments() ])
      .then(([ allLevels, allAssignments ]) => {
        this.allLevels = allLevels
        this.allAssignments = allAssignments
        this.regenerateChartData()
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => this.loading = false)
  }

  private regenerateChartData(): void {
    // This dataset has in "x" the date in which each level was reached, and in "y" the level number
    const levelDataset = this.allLevels.map(({ level, date }) => ({ x: date, y: level }))

    // This dataset has in "x" the date in which an assignment was passed, and in "y" the accumulated number of assignments passed
    // up to that day.
    const assignments = _.uniqBy(this.getAssignments(), ass => moment(ass.date).startOf("hour").format())
    const kanjisDataset = assignments.map(({ kanjis, date }) => ({ x: date, y: kanjis }))
    const vocabularyDataset = assignments.map(({ vocabulary, date }) => ({ x: date, y: vocabulary }))
    const radicalsDataset = assignments.map(({ radicals, date }) => ({ x: date, y: radicals }))

    this.chart = this.createChart(levelDataset, radicalsDataset, kanjisDataset, vocabularyDataset)
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
        min = this.allLevels[0].date.startOf("day")
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

  private getLevels(): Promise<Level[]> {
    return this.wanikani.getLevelProgressions()
      .then(levels => {
        levels = _.sortBy(levels, "level")
        return levels.map(p => ({ level: p.level, date: moment(p.unlocked_at) }))
      })
  }

  private getAssignments(): Assignment1[] {

    function makeAccum(total: number, kanjis: number, radicals: number, vocabulary: number): AssignmentAccumulator {
      return { total, kanjis, radicals, vocabulary }
    }

    function updateAccum(accum: AssignmentAccumulator, type): AssignmentAccumulator {
      return {
        total: accum.total + 1,
        kanjis: accum.kanjis + (type === "kanji" ? 1 : 0),
        radicals: accum.radicals + (type === "radical" ? 1 : 0),
        vocabulary: accum.vocabulary + (type === "vocabulary" ? 1 : 0),
      }
    }

    const assignments = this.allAssignments
    const field = this.currentCriteria === "PASSED_AT" ? "passed_at" : "burned_at"
    const dateAndType: Array<{ date: string, type: string }> = _.sortBy(assignments, field)
      .filter(ass => ass[field])
      .map(ass => ({
        date: moment(ass[field]).startOf("hour").format(),
        type: ass.subject_type
      }))

    const accumByDate: Record<string, AssignmentAccumulator> = {}
    dateAndType.reduce((prevAccum, curr) => {
      if (!accumByDate[curr.date]) {
        accumByDate[curr.date] = makeAccum(0, 0, 0, 0)
      }

      accumByDate[curr.date] = updateAccum(prevAccum, curr.type)
      return updateAccum(prevAccum, curr.type)
    }, makeAccum(0, 0, 0, 0))

    return dateAndType.map(o => ({
      date: moment(o.date),
      total: accumByDate[o.date].total,
      radicals: accumByDate[o.date].radicals,
      kanjis: accumByDate[o.date].kanjis,
      vocabulary: accumByDate[o.date].vocabulary,
    }))
  }

  private createChart(levelDataset: any,
                      radicalsDataset: any,
                      kanjisDataset: any,
                      vocabularyDataset: any): Chart {
    let datasets, yAxes
    if (this.currentCriteria === "LEVEL") {
      // Calculate data bounds for the Levels dataset
      const levelMaxY = Math.max(...levelDataset.map(({ y }) => y))
      datasets = [{
        label: "Level Progress",
        data: levelDataset,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 3,
        fill: false,
        lineTension: 0,
        yAxisID: "left",
      }]
      yAxes = [{
        id: "left",
        display: true,
        position: "right",
        scaleLabel: {
          display: true,
          labelString: "Level"
        },
        ticks: {
          max: levelMaxY + 1,
          beginAtZero: true,
        }
      }]
    } else {
      datasets = [
        {
          label: "Radicals " + (this.currentCriteria === "PASSED_AT" ? "Passed" : "Burned"),
          data: radicalsDataset,
          backgroundColor: "rgba(0,161,241,0.2)",
          borderColor: "rgba(0,161,241,0.8)",
          borderWidth: 1,
          fill: "origin",
          pointRadius: 3,
          steppedLine: "before",
          yAxisID: "right",
        },
        {
          label: "Kanjis " + (this.currentCriteria === "PASSED_AT" ? "Passed" : "Burned"),
          data: kanjisDataset,
          backgroundColor: "rgba(241,0,161,0.2)",
          borderColor: "rgba(241,0,161,0.8)",
          borderWidth: 1,
          fill: "-1",
          pointRadius: 3,
          steppedLine: "before",
          yAxisID: "right",
        },
        {
          label: "Vocabulary " + (this.currentCriteria === "PASSED_AT" ? "Passed" : "Burned"),
          data: vocabularyDataset,
          backgroundColor: "rgba(161,0,241,0.2)",
          borderColor: "rgba(161,0,241,0.8)",
          borderWidth: 1,
          fill: "-1",
          pointRadius: 3,
          steppedLine: "before",
          yAxisID: "right",
        }
      ]
      yAxes = [{
        id: "right",
        display: true,
        position: "right",
        scaleLabel: {
          display: true,
          labelString: "Radicals / Kanjis / Vocabulary"
        },
        stacked: true,
        ticks: {
          beginAtZero: true,
        }
      }]
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
                labelString: "Date When Passed"
              },
              ticks: {
                // min: minDate,
                // max: maxDate
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
