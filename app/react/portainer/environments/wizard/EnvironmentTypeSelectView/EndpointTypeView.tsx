import { useState } from 'react';
import { useRouter } from '@uirouter/react';
import _ from 'lodash';

import { useAnalytics } from '@/angulartics.matomo/analytics-services';

import { Button } from '@@/buttons';
import { PageHeader } from '@@/PageHeader';
import { Widget, WidgetBody, WidgetTitle } from '@@/Widget';

import { useCreateEdgeDeviceParam } from '../hooks/useCreateEdgeDeviceParam';

import {
  EnvironmentSelector,
  EnvironmentSelectorValue,
} from './EnvironmentSelector';
import { environmentTypes } from './environment-types';

export function EnvironmentTypeSelectView() {
  const createEdgeDevice = useCreateEdgeDeviceParam();

  const [types, setTypes] = useState<EnvironmentSelectorValue[]>([]);
  const { trackEvent } = useAnalytics();
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Quick Setup"
        breadcrumbs={[{ label: '环境向导' }]}
      />

      <div className="row">
        <div className="col-sm-12">
          <Widget>
            <WidgetTitle icon="svg-magic" title="环境向导" />
            <WidgetBody>
              <EnvironmentSelector
                value={types}
                onChange={setTypes}
                createEdgeDevice={createEdgeDevice}
              />
              <Button
                disabled={types.length === 0}
                onClick={() => startWizard()}
              >
                启动向导
              </Button>
            </WidgetBody>
          </Widget>
        </div>
      </div>
    </>
  );

  function startWizard() {
    if (types.length === 0) {
      return;
    }

    const steps = _.compact(
      types.map((id) => environmentTypes.find((eType) => eType.id === id))
    );

    trackEvent('endpoint-wizard-endpoint-select', {
      category: 'portainer',
      metadata: {
        environment: steps.map((step) => step.title).join('/'),
      },
    });

    router.stateService.go('portainer.wizard.endpoints.create', {
      envType: types,
      ...(createEdgeDevice ? { edgeDevice: createEdgeDevice } : {}),
    });
  }
}
