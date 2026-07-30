import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';
import { CreateHoaxUseCase } from '@modules/hoax/use-cases/create-hoax.use-case';

@injectable()
export class HoaxController {
  constructor(
    @inject(CreateHoaxUseCase)
    private readonly createHoaxUseCase: CreateHoaxUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.createHoaxUseCase.execute(
      req.user!.userId,
      req.body,
    );

    return result.match(
      (hoax) => res.status(201).json(hoax),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };
}