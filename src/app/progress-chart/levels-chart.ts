import * as _ from "lodash"
import * as moment from "moment"
import { Moment } from "moment"

type XYData = Array<{ x: Moment, y: number }>

export class LevelsChart {

  // This dataset has in "x" the date in which each level was reached, and in "y" the level number
  private readonly levels: XYData
  private readonly yLevelMax: number

  constructor(apiLevels: LevelProgression[]) {
    this.levels = _.chain(apiLevels)
      .sortBy("level")
      .map(({ level, unlocked_at }) => ({ x: moment(unlocked_at), y: level }))
      .value()

    this.yLevelMax = Math.max(..._.map(apiLevels, "level"))
  }

  public getMinX(): Moment {
    return this.levels[0].x.startOf("day")
  }

  public getYAxes(): Array<object> {
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

  public getDataset(): Array<object> {
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
