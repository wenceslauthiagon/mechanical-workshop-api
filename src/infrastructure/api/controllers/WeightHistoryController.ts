import { Request, Response } from 'express';
import { RecordWeightUseCase } from '@application/use-cases/weight/RecordWeightUseCase';
import { GetWeightHistoryUseCase } from '@application/use-cases/weight/GetWeightHistoryUseCase';
import { GetLatestWeightUseCase } from '@application/use-cases/weight/GetLatestWeightUseCase';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class WeightHistoryController {
  constructor(
    private readonly recordWeightUseCase: RecordWeightUseCase,
    private readonly getWeightHistoryUseCase: GetWeightHistoryUseCase,
    private readonly getLatestWeightUseCase: GetLatestWeightUseCase,
  ) {}

  async record(req: Request, res: Response): Promise<void> {
    const weightHistory = await this.recordWeightUseCase.execute({
      ...req.body,
      measurementDate: new Date(req.body.measurementDate),
    });
    res.status(HTTP_STATUS.CREATED).json(weightHistory);
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const weightHistory = await this.getWeightHistoryUseCase.execute(petId);
    res.status(HTTP_STATUS.OK).json(weightHistory);
  }

  async getLatest(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const weightHistory = await this.getLatestWeightUseCase.execute(petId);
    res.status(HTTP_STATUS.OK).json(weightHistory);
  }
}
