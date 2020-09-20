import { AfterViewInit, Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Chart } from "chart.js"
import * as moment from "moment"
import { Moment } from "moment"
import * as _ from "lodash"

type Level = { date: Moment, level: number }
type Assignment = { date: Moment, total: number, kanjis: number, radicals: number, vocabulary: number }
type AssignmentAccumulator = { total: number, radicals: number, kanjis: number, vocabulary: number }

const MIN_PASSED_AT = moment().subtract(2, "months")

@Component({
  selector: "app-progress-dashboard",
  templateUrl: "./progress-chart.component.html",
  styleUrls: [ "./progress-chart.component.css" ]
})
export class ProgressChartComponent implements OnInit, AfterViewInit {

  private allData$: Promise<{ levels: Level[], assignments: Assignment[] }>
  private chart: Chart
  loading = false

  constructor(private wanikani: WanikaniService) {
  }

  ngOnInit(): void {
    // Request needed data to the backend
    this.loading = true
    this.allData$ = Promise.all([ this.getLevels(), this.getAssignments() ])
      .then(([ levels, assignments ]) => {
        assignments = assignments.filter(o => o.date > MIN_PASSED_AT)
        levels = levels.filter(o => o.date > MIN_PASSED_AT)
        return { levels, assignments }
      })
  }

  ngAfterViewInit(): void {
    this.allData$
      .then(allData => {
        // This dataset has in "x" the date in which each level was reached, and in "y" the level number
        const levelDataset = allData.levels.map(({ level, date }) => ({ x: date, y: level }))

        // This dataset has in "x" the date in which an assignment was passed, and in "y" the accumulated number of assignments passed
        // up to that day.
        const assignments = _.uniqBy(allData.assignments, ass => moment(ass.date).startOf("hour").format())
        const kanjisDataset = assignments.map(({ kanjis, date }) => ({ x: date, y: kanjis }))
        const vocabularyDataset = assignments.map(({ vocabulary, date }) => ({ x: date, y: vocabulary }))
        const radicalsDataset = assignments.map(({ radicals, date }) => ({ x: date, y: radicals }))

        this.chart = this.createChart(levelDataset, radicalsDataset, kanjisDataset, vocabularyDataset)
      })
      .catch(error => {
        this.loading = false
        console.log(error)
      })
  }

  private getLevels(): Promise<Level[]> {
    return this.wanikani.getLevelProgressions()
      .then(levels => {
        levels = _.sortBy(levels, "level")
        return levels.map(p => ({ level: p.level, date: moment(p.unlocked_at) }))
      })
  }

  private getAssignments(): Promise<Assignment[]> {

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

    return this.wanikani.getAllAssignments()
      .then(assignments => {
          const dateAndType: Array<{ date: string, type: string }> = _.sortBy(assignments, "passed_at")
            .filter(ass => ass.passed_at)
            .map(ass => ({
              date: moment(ass.passed_at).startOf("hour").format(),
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
      )
  }

  private createChart(levelDataset: any,
                      radicalsDataset: any,
                      kanjisDataset: any,
                      vocabularyDataset: any): Chart {
    // Calculate data bounds for the Levels dataset
    const levelMaxY = Math.max(...levelDataset.map(({ y }) => y))

    const ctx = (document.getElementById("dashboardChart") as any).getContext("2d")
    const config = {
      type: "line",
      data: {
        datasets: [
          {
            label: "Level Progress",
            data: levelDataset,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
            fill: false,
            lineTension: 0,
            yAxisID: "left",
          },
          {
            label: "Radicals Passed",
            data: radicalsDataset,
            backgroundColor: "rgba(0,161,241,0.2)",
            borderColor: "rgba(0,161,241,0.8)",
            borderWidth: 1,
            fill: "origin",
            pointRadius: 1,
            steppedLine: "before",
            yAxisID: "right",
          },
          {
            label: "Kanjis Passed",
            data: kanjisDataset,
            backgroundColor: "rgba(241,0,161,0.2)",
            borderColor: "rgba(241,0,161,0.8)",
            borderWidth: 1,
            fill: "-1",
            pointRadius: 1,
            steppedLine: "before",
            yAxisID: "right",
          },
          {
            label: "Vocabulary Passed",
            data: vocabularyDataset,
            backgroundColor: "rgba(161,0,241,0.2)",
            borderColor: "rgba(161,0,241,0.8)",
            borderWidth: 1,
            fill: "-1",
            pointRadius: 1,
            steppedLine: "before",
            yAxisID: "right",
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          onComplete: () => {
            this.chartRenderingComplete()
          }
        },
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
          yAxes: [
            {
              id: "left",
              display: true,
              position: "left",
              scaleLabel: {
                display: true,
                labelString: "Level"
              },
              ticks: {
                max: levelMaxY + 1,
                beginAtZero: true,
              }
            },
            {
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
            }
          ]
        },
        title: {
          display: true,
          text: `WaniKani Progress`
        },
      }
    }
    return new Chart(ctx, config)
  }

  private chartRenderingComplete(): void {
    this.loading = false
  }
}
