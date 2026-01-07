import { CalculateClpcDto } from '../dto/clpc.dto.js';

export const clpcService = {
  calculate(data: CalculateClpcDto) {
    const bvd = data.backVertexDistance || 12;

    const rightResult = this.calculateEye(data.rightEyeSphere, data.rightEyeCylinder, data.rightEyeAxis, bvd);
    const leftResult = this.calculateEye(data.leftEyeSphere, data.leftEyeCylinder, data.leftEyeAxis, bvd);

    return {
      rightEye: rightResult,
      leftEye: leftResult,
    };
  },

  calculateEye(sphere: number, cylinder: number, axis: number, bvd: number) {
    const fe = sphere + cylinder;
    const fcl = fe / (1 - (bvd / 1000) * fe);

    const cylinderResult = cylinder !== 0 ? cylinder : 0;
    const axisResult = cylinder !== 0 ? axis : 0;

    return {
      sphere: parseFloat(fcl.toFixed(2)),
      cylinder: parseFloat(cylinderResult.toFixed(2)),
      axis: axisResult,
    };
  },
};
