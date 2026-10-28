import type { Cards } from "./component";

export type CardProps = {
  cards: Cards["cards"];
  dataCslp:
    | {
        [key: string]: {
          "data-cslp": string;
        };
      }
    | undefined;
};
