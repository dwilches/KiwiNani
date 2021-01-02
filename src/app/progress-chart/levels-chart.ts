import sortBy from "lodash/sortBy"
import * as moment from "moment"
import { Moment } from "moment"
import { WanikaniService } from "../wanikani.service/wanikani.service"

type XYData = Array<{ x: Moment, y: number }>

export class LevelsChart {

  // This dataset has in "x" the date in which each level was reached, and in "y" the level number
  private levels: XYData
  private yLevelMax: number

  constructor() {
  }

  public async initialize(wanikani: WanikaniService): Promise<void> {
    const apiLevels = await wanikani.getLevelProgressions()
    this.levels = sortBy(apiLevels, "level")
      .map(({ level, unlocked_at }) => ({ x: moment(unlocked_at), y: level }))

    this.yLevelMax = Math.max(...apiLevels.map(l => l.level))
  }

  public getMinX(): Moment {
    return this.levels[0].x.startOf("day")
  }

  public getChartConfig(): object {
    return {
      type: "line",
      data: {
        datasets: this.getDatasets()
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
        id: "left",
        display: true,
        position: "right",
        scaleLabel: {
          display: true,
          labelString: "Level"
        },
        ticks: {
          max: this.yLevelMax + 1,
          beginAtZero: true,
        }
      }
    ]
  }

  private getDatasets(): Array<object> {
    return [
      {
        label: "Level Progress",
        data: this.levels,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 3,
        fill: false,
        lineTension: 0,
        yAxisID: "left",
      }
    ]
  }
}
