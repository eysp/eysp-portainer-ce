import { useRouter } from '@uirouter/react';
import {
  Pause,
  Play,
  Plus,
  RefreshCw,
  Slash,
  Square,
  Trash2,
} from 'react-feather';

import * as notifications from '@/portainer/services/notifications';
import { useAuthorizations, Authorized } from '@/portainer/hooks/useUser';
import { confirmContainerDeletion } from '@/portainer/services/modal.service/prompt';
import { setPortainerAgentTargetHeader } from '@/portainer/services/http-request.helper';
import {
  ContainerId,
  ContainerStatus,
  DockerContainer,
} from '@/react/docker/containers/types';
import {
  killContainer,
  pauseContainer,
  removeContainer,
  restartContainer,
  resumeContainer,
  startContainer,
  stopContainer,
} from '@/react/docker/containers/containers.service';
import type { EnvironmentId } from '@/portainer/environments/types';

import { Link } from '@@/Link';
import { ButtonGroup, Button } from '@@/buttons';

type ContainerServiceAction = (
  endpointId: EnvironmentId,
  containerId: ContainerId
) => Promise<void>;

interface Props {
  selectedItems: DockerContainer[];
  isAddActionVisible: boolean;
  endpointId: EnvironmentId;
}

export function ContainersDatatableActions({
  selectedItems,
  isAddActionVisible,
  endpointId,
}: Props) {
  const selectedItemCount = selectedItems.length;
  const hasPausedItemsSelected = selectedItems.some(
    (item) => item.State === ContainerStatus.Paused
  );
  const hasStoppedItemsSelected = selectedItems.some((item) =>
    [
      ContainerStatus.Stopped,
      ContainerStatus.Created,
      ContainerStatus.Exited,
    ].includes(item.Status)
  );
  const hasRunningItemsSelected = selectedItems.some((item) =>
    [
      ContainerStatus.Running,
      ContainerStatus.Healthy,
      ContainerStatus.Unhealthy,
      ContainerStatus.Starting,
    ].includes(item.Status)
  );

  const isAuthorized = useAuthorizations([
    'DockerContainerStart',
    'DockerContainerStop',
    'DockerContainerKill',
    'DockerContainerRestart',
    'DockerContainerPause',
    'DockerContainerUnpause',
    'DockerContainerDelete',
    'DockerContainerCreate',
  ]);

  const router = useRouter();

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <ButtonGroup>
        <Authorized authorizations="DockerContainerStart">
          <Button
            color="light"
            onClick={() => onStartClick(selectedItems)}
            disabled={selectedItemCount === 0 || !hasStoppedItemsSelected}
            icon={Play}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerStop">
          <Button
            color="light"
            onClick={() => onStopClick(selectedItems)}
            disabled={selectedItemCount === 0 || !hasRunningItemsSelected}
            icon={Square}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerKill">
          <Button
            color="light"
            onClick={() => onKillClick(selectedItems)}
            disabled={selectedItemCount === 0 || hasStoppedItemsSelected}
            icon={Slash}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerRestart">
          <Button
            color="light"
            onClick={() => onRestartClick(selectedItems)}
            disabled={selectedItemCount === 0}
            icon={RefreshCw}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerPause">
          <Button
            color="light"
            onClick={() => onPauseClick(selectedItems)}
            disabled={selectedItemCount === 0 || !hasRunningItemsSelected}
            icon={Pause}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerUnpause">
          <Button
            color="light"
            onClick={() => onResumeClick(selectedItems)}
            disabled={selectedItemCount === 0 || !hasPausedItemsSelected}
            icon={Play}
          >
            ??????
          </Button>
        </Authorized>

        <Authorized authorizations="DockerContainerDelete">
          <Button
            color="dangerlight"
            onClick={() => onRemoveClick(selectedItems)}
            disabled={selectedItemCount === 0}
            icon={Trash2}
          >
            ??????
          </Button>
        </Authorized>
      </ButtonGroup>

      {isAddActionVisible && (
        <Authorized authorizations="DockerContainerCreate">
          <Link to="docker.containers.new" className="space-left">
            <Button icon={Plus}>????????????</Button>
          </Link>
        </Authorized>
      )}
    </>
  );

  function onStartClick(selectedItems: DockerContainer[]) {
    const successMessage = '?????????????????????';
    const errorMessage = '??????????????????';
    executeActionOnContainerList(
      selectedItems,
      startContainer,
      successMessage,
      errorMessage
    );
  }

  function onStopClick(selectedItems: DockerContainer[]) {
    const successMessage = '?????????????????????';
    const errorMessage = '??????????????????';
    executeActionOnContainerList(
      selectedItems,
      stopContainer,
      successMessage,
      errorMessage
    );
  }

  function onRestartClick(selectedItems: DockerContainer[]) {
    const successMessage = '???????????????????????????';
    const errorMessage = '????????????????????????';
    executeActionOnContainerList(
      selectedItems,
      restartContainer,
      successMessage,
      errorMessage
    );
  }

  function onKillClick(selectedItems: DockerContainer[]) {
    const successMessage = '?????????????????????';
    const errorMessage = '??????????????????';
    executeActionOnContainerList(
      selectedItems,
      killContainer,
      successMessage,
      errorMessage
    );
  }

  function onPauseClick(selectedItems: DockerContainer[]) {
    const successMessage = '?????????????????????';
    const errorMessage = '??????????????????';
    executeActionOnContainerList(
      selectedItems,
      pauseContainer,
      successMessage,
      errorMessage
    );
  }

  function onResumeClick(selectedItems: DockerContainer[]) {
    const successMessage = '?????????????????????';
    const errorMessage = '??????????????????';
    executeActionOnContainerList(
      selectedItems,
      resumeContainer,
      successMessage,
      errorMessage
    );
  }

  function onRemoveClick(selectedItems: DockerContainer[]) {
    const isOneContainerRunning = selectedItems.some(
      (container) => container.State === 'running'
    );

    const runningTitle = isOneContainerRunning ? 'running' : '';
    const title = `?????????????????????????????? ${runningTitle} ?????????`;

    confirmContainerDeletion(title, (result: string[]) => {
      if (!result) {
        return;
      }
      const cleanVolumes = !!result[0];

      removeSelectedContainers(selectedItems, cleanVolumes);
    });
  }

  async function executeActionOnContainerList(
    containers: DockerContainer[],
    action: ContainerServiceAction,
    successMessage: string,
    errorMessage: string
  ) {
    for (let i = 0; i < containers.length; i += 1) {
      const container = containers[i];
      try {
        setPortainerAgentTargetHeader(container.NodeName);
        await action(endpointId, container.Id);
        notifications.success(successMessage, container.Names[0]);
      } catch (err) {
        notifications.error(
          'Failure',
          err as Error,
          `${errorMessage}:${container.Names[0]}`
        );
      }
    }

    router.stateService.reload();
  }

  async function removeSelectedContainers(
    containers: DockerContainer[],
    cleanVolumes: boolean
  ) {
    for (let i = 0; i < containers.length; i += 1) {
      const container = containers[i];
      try {
        setPortainerAgentTargetHeader(container.NodeName);
        await removeContainer(endpointId, container, cleanVolumes);
        notifications.success(
          '?????????????????????',
          container.Names[0]
        );
      } catch (err) {
        notifications.error(
          'Failure',
          err as Error,
          '??????????????????'
        );
      }
    }

    router.stateService.reload();
  }
}
