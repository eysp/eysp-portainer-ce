import { boolean, object, SchemaOf, string } from 'yup';

import { gpusListValidation } from '@/react/portainer/environments/wizard/EnvironmentsCreationView/shared/Hardware/GpusList';

import { metadataValidation } from '../../shared/MetadataFieldset/validation';
import { nameValidation } from '../../shared/NameField';

import { FormValues } from './types';

export function validation(): SchemaOf<FormValues> {
  return object({
    name: nameValidation(),
    meta: metadataValidation(),
    overridePath: boolean().default(false),
    socketPath: string()
      .default('')
      .when('overridePath', (overridePath, schema) =>
        overridePath
          ? schema.required(
              '启用覆盖路径时，需要socket路径'
            )
          : schema
      ),
    gpus: gpusListValidation(),
  });
}
