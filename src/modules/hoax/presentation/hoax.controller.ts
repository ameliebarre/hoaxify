import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';
import { validationErrorResponse } from '@core/errors/http/validation.error';
import { hoaxIdParamSchema } from '@modules/hoax/presentation/validators/hoax-id.validator';
import { listHoaxesQuerySchema } from '@modules/hoax/presentation/validators/list-hoaxes.validator';
import { CreateHoaxUseCase } from '@modules/hoax/use-cases/create-hoax.use-case';
import { DeleteHoaxUseCase } from '@modules/hoax/use-cases/delete-hoax.use-case';
import { ListHoaxesUseCase } from '@modules/hoax/use-cases/list-hoaxes.use-case';

@injectable()
export class HoaxController {
  constructor(
    @inject(CreateHoaxUseCase)
    private readonly createHoaxUseCase: CreateHoaxUseCase,

    @inject(ListHoaxesUseCase)
    private readonly listHoaxesUseCase: ListHoaxesUseCase,

    @inject(DeleteHoaxUseCase)
    private readonly deleteHoaxUseCase: DeleteHoaxUseCase,
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

  list = async (req: Request, res: Response): Promise<Response> => {
    const queryResult = listHoaxesQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return res.status(400).json(validationErrorResponse(queryResult.error));
    }

    const result = await this.listHoaxesUseCase.execute(queryResult.data);

    return result.match(
      (hoaxes) => res.status(200).json(hoaxes),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const paramsResult = hoaxIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res
        .status(400)
        .json(validationErrorResponse(paramsResult.error));
    }

    const result = await this.deleteHoaxUseCase.execute(
      paramsResult.data.id,
      req.user!.userId,
    );

    return result.match(
      () => res.status(204).send(),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };
}