import * as _ from "lodash"
import * as moment from "moment"
import { Moment } from "moment"

export type ChartType = "PASSED_AT" | "BURNED_AT"
type XYData = Array<{ x: Moment, y: number }>
type SingleAccumulator = { total: number, radicals: number, kanjis: number, vocabulary: number }
type Accumulators = Record<string, SingleAccumulator>

export class CountsChart {

  private readonly allAssignments: Assignment[]

  constructor(allAssignments: Assignment[]) {
    this.allAssignments = allAssignments
  }

  public getMinX(chartType: ChartType): Moment {
    const field = chartType === "PASSED_AT" ? "passed_at" : "burned_at"
    const sorted: Moment[] = _.chain(this.allAssignments)
      .sortBy(field)
      .map(ass => moment(ass[field]))
      .value()
    return sorted[0].startOf("day")
  }

  public getYAxes(): Array<object> {
    return [
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
  }

  /**
   * This dataset has in "x" the date in which an assignment was passed, and in "y" the accumulated number of assignments passed/burned
   * up to that day.
   */
  public getDataset(chartType: ChartType): Array<object> {
    const { kanjis, vocabulary, radicals } = this.getAssignments(chartType)

    return [
      {
        label: "Radicals " + (chartType === "PASSED_AT" ? "Passed" : "Burned"),
        data: radicals,
        backgroundColor: "rgba(0,161,241,0.2)",
        borderColor: "rgba(0,161,241,0.8)",
        borderWidth: 1,
        fill: "origin",
        pointRadius: 3,
        steppedLine: "before",
        yAxisID: "right",
      },
      {
        label: "Kanjis " + (chartType === "PASSED_AT" ? "Passed" : "Burned"),
        data: kanjis,
        backgroundColor: "rgba(241,0,161,0.2)",
        borderColor: "rgba(241,0,161,0.8)",
        borderWidth: 1,
        fill: "-1",
        pointRadius: 3,
        steppedLine: "before",
        yAxisID: "right",
      },
      {
        label: "Vocabulary " + (chartType === "PASSED_AT" ? "Passed" : "Burned"),
        data: vocabulary,
        backgroundColor: "rgba(161,0,241,0.2)",
        borderColor: "rgba(161,0,241,0.8)",
        borderWidth: 1,
        fill: "-1",
        pointRadius: 3,
        steppedLine: "before",
        yAxisID: "right",
      }
    ]
  }

  private getAssignments(chartType: ChartType): { kanjis: XYData, vocabulary: XYData, radicals: XYData } {
    const field = chartType === "PASSED_AT" ? "passed_at" : "burned_at"
    let totalAccum: SingleAccumulator = { total: 0, kanjis: 0, radicals: 0, vocabulary: 0 }
    const accumByDate: Accumulators = {}

    _.sortBy(this.allAssignments, field)
      .filter(ass => ass[field])
      .forEach(ass => {
        const date = moment(ass[field]).startOf("hour").format()
        totalAccum = accumByDate[date] = CountsChart.updateAccum(totalAccum, ass.subject_type)
      })

    const assignments = Object.entries(accumByDate)
      .map(([ date, accum ]) => ({
        date: moment(date),
        total: accum.total,
        radicals: accum.radicals,
        kanjis: accum.kanjis,
        vocabulary: accum.vocabulary,
      }))

    return {
      kanjis: assignments.map(({ kanjis, date }) => ({ x: date, y: kanjis })),
      vocabulary: assignments.map(({ vocabulary, date }) => ({ x: date, y: vocabulary })),
      radicals: assignments.map(({ radicals, date }) => ({ x: date, y: radicals }))
    }
  }

  private static updateAccum(accum: SingleAccumulator, type: string): SingleAccumulator {
    return {
      total: accum.total + 1,
      kanjis: accum.kanjis + (type === "kanji" ? 1 : 0),
      radicals: accum.radicals + (type === "radical" ? 1 : 0),
      vocabulary: accum.vocabulary + (type === "vocabulary" ? 1 : 0),
    }
  }
}
