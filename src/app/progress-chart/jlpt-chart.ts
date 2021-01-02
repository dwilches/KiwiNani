import moment from "moment"
import { Moment } from "moment"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { JlptSubjects } from "./jlpt"

type KanjisPerLevel = { total: number, passed: number }

export class JlptChart {

  private kanjiLevels: { [level: number]: KanjisPerLevel }

  constructor() {
  }

  public async initialize(wanikani: WanikaniService): Promise<void> {
    const passedKanjis = new Set<number>(await wanikani.getAllAssignments()
      .then(allAssignments => allAssignments
        .filter(a => a.passed_at !== null && a.subject_type === "kanji")
        .map(a => a.subject_id)))

    this.kanjiLevels = {}
    for (let i = 1; i <= 5; i++) {
      this.kanjiLevels[i] = {
        passed: JlptSubjects[i].filter(s => passedKanjis.has(s)).length,
        total: JlptSubjects[i].length
      }
    }
  }

  public getMinX(): Moment {
    return moment()
  }

  public getChartConfig(): object {
    return {
      type: "bar",
      data: {
        labels: [ "JLPT 5", "JLPT 4", "JLPT 3", "JLPT 2", "JLPT 1" ],
        datasets: this.getDatasets()
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [ {
            gridLines: {
              offsetGridLines: true
            }
          } ],
          yAxes: this.getYAxes()
        },
        title: {
          display: true,
          text: `WaniKani Progress`
        },
      }
    }
  }

  private getYAxes(): Array<object> {
    return [
      {
        display: true,
        position: "right",
        scaleLabel: {
          display: true,
          labelString: "Passed Kanjis per Level"
        },
        ticks: {
          beginAtZero: true,
        }
      }
    ]
  }

  private getDatasets(): object {
    return [ {
      label: "Percentage of Kanjis passed per JPT level",
      backgroundColor: [ "#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850" ],
      data: [
        Math.floor(100 * this.kanjiLevels[5].passed / this.kanjiLevels[5].total),
        Math.floor(100 * this.kanjiLevels[4].passed / this.kanjiLevels[4].total),
        Math.floor(100 * this.kanjiLevels[3].passed / this.kanjiLevels[3].total),
        Math.floor(100 * this.kanjiLevels[2].passed / this.kanjiLevels[2].total),
        Math.floor(100 * this.kanjiLevels[1].passed / this.kanjiLevels[1].total)
      ]
    } ]
  }
}
