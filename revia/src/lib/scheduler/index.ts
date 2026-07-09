import { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";
import { SchedulingEngine } from "./engine";

export * from "./types";
export { SchedulingEngine } from "./engine";
export { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";

const algorithm = new SimpleIntervalAlgorithm();
export const schedulingEngine = new SchedulingEngine(algorithm);
