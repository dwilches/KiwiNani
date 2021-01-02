import moment from "moment"
import { Moment } from "moment"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { JlptKanjiSubjects, JlptVocabSubjects } from "./jlpt"

type CountsPerLevel = { total: number, passed: number }

export class JlptChart {

  private kanjiLevels: { [level: number]: CountsPerLevel }
  private vocabLevels: { [level: number]: CountsPerLevel }

  constructor() {
  }

  public async initialize(wanikani: WanikaniService): Promise<void> {
    const allAssignments = await wanikani.getAllAssignments()
    const passedKanjis = new Set<number>(allAssignments
      .filter(a => a.passed_at !== null && a.subject_type === "kanji")
      .map(a => a.subject_id))
    const passedVocab = new Set<number>(allAssignments
      .filter(a => a.passed_at !== null && a.subject_type === "vocabulary")
      .map(a => a.subject_id))

    this.kanjiLevels = {}
    for (let i = 1; i <= 5; i++) {
      this.kanjiLevels[i] = {
        passed: JlptKanjiSubjects[i].filter(s => passedKanjis.has(s)).length,
        total: JlptKanjiSubjects[i].length
      }
    }

    this.vocabLevels = {}
    for (let i = 1; i <= 5; i++) {
      this.vocabLevels[i] = {
        passed: JlptVocabSubjects[i].filter(s => passedVocab.has(s)).length,
        total: JlptVocabSubjects[i].length
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
        labels: [ "Total", "JLPT 5", "JLPT 4", "JLPT 3", "JLPT 2", "JLPT 1" ],
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
        tooltips: {
          callbacks: {
            label: tooltipItem => {
              const label = tooltipItem.datasetIndex === 0 ? "Kanjis" : "Vocabulary"
              return `${ label }: ${ tooltipItem.yLabel }%`
            }
          }
        }
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
    const totalPassedKanjis = this.kanjiLevels[5].passed + this.kanjiLevels[4].passed +
      this.kanjiLevels[3].passed + this.kanjiLevels[2].passed + this.kanjiLevels[1].passed
    const totalKanjis = this.kanjiLevels[5].total + this.kanjiLevels[4].total +
      this.kanjiLevels[3].total + this.kanjiLevels[2].total + this.kanjiLevels[1].total
    const totalPassedVocabs = this.vocabLevels[5].passed + this.vocabLevels[4].passed +
      this.vocabLevels[3].passed + this.vocabLevels[2].passed + this.vocabLevels[1].passed
    const totalVocabs = this.vocabLevels[5].total + this.vocabLevels[4].total +
      this.vocabLevels[3].total + this.vocabLevels[2].total + this.vocabLevels[1].total

    return [
      {
        label: "Kanjis passed per JLPT level",
        backgroundColor: [ "#3e95cd", "#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#c45850" ],
        data: [
          Math.floor(100 * totalPassedKanjis / totalKanjis),
          Math.floor(100 * this.kanjiLevels[5].passed / this.kanjiLevels[5].total),
          Math.floor(100 * this.kanjiLevels[4].passed / this.kanjiLevels[4].total),
          Math.floor(100 * this.kanjiLevels[3].passed / this.kanjiLevels[3].total),
          Math.floor(100 * this.kanjiLevels[2].passed / this.kanjiLevels[2].total),
          Math.floor(100 * this.kanjiLevels[1].passed / this.kanjiLevels[1].total)
        ]
      },
      {
        label: "Vocabulary passed per JLPT level",
        backgroundColor: [ "#9ecae6", "#ffb1c1", "#9ad0f4", "#e5b2fe", "#ffe6aa", "#e1aba7" ],
        data: [
          Math.floor(100 * totalPassedVocabs / totalVocabs),
          Math.floor(100 * this.vocabLevels[5].passed / this.vocabLevels[5].total),
          Math.floor(100 * this.vocabLevels[4].passed / this.vocabLevels[4].total),
          Math.floor(100 * this.vocabLevels[3].passed / this.vocabLevels[3].total),
          Math.floor(100 * this.vocabLevels[2].passed / this.vocabLevels[2].total),
          Math.floor(100 * this.vocabLevels[1].passed / this.vocabLevels[1].total)
        ]
      }
    ]
  }
}
