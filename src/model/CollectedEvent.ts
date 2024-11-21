import {
  prop,
  modelOptions,
  index,
  getModelForClass,
} from "@typegoose/typegoose";
import { getEnv } from "../util/env";
import { ChainType } from "../types";

@modelOptions({
  schemaOptions: {
    collection: getEnv("COLLECTED_EVENT_COLLECTION_NAME", "CollectedEvents"),
    timestamps: true,
  },
})
@index({ integrator: 1 })
@index({ blockNumber: 1 })
export class CollectedEvent {
  @prop({ type: () => String })
  public chain: ChainType;

  @prop({ type: () => String })
  public integrator: string;

  @prop({ type: () => String })
  public lifiFee: string;

  @prop({ type: () => String })
  public integratorFee: string;

  @prop({ type: () => Number })
  public blockNumber: number;

  @prop({ type: () => String })
  public token: string;
}

const CollectedEventModel = getModelForClass(CollectedEvent);

export default CollectedEventModel;
