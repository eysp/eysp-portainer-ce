import { EnvironmentId } from '@/portainer/environments/types';
import PortainerError from '@/portainer/error';
import axios from '@/portainer/services/axios';
import { genericHandler } from '@/docker/rest/response/handlers';

import { ContainerId, DockerContainer } from './types';

export async function startContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(
    urlBuilder(endpointId, id, '启动'),
    {},
    { transformResponse: genericHandler }
  );
}

export async function stopContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, '停止'), {});
}

export async function restartContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, '重启'), {});
}

export async function killContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, '终止'), {});
}

export async function pauseContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, '暂停'), {});
}

export async function resumeContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, '恢复'), {});
}

export async function renameContainer(
  endpointId: EnvironmentId,
  id: ContainerId,
  name: string
) {
  await axios.post<void>(
    urlBuilder(endpointId, id, '重命名'),
    {},
    { params: { name }, transformResponse: genericHandler }
  );
}

export async function removeContainer(
  endpointId: EnvironmentId,
  container: DockerContainer,
  removeVolumes: boolean
) {
  try {
    const { data } = await axios.delete<null | { message: string }>(
      urlBuilder(endpointId, container.Id),
      {
        params: { v: removeVolumes ? 1 : 0, force: true },
        transformResponse: genericHandler,
      }
    );

    if (data && data.message) {
      throw new PortainerError(data.message);
    }
  } catch (e) {
    throw new PortainerError('无法删除容器', e as Error);
  }
}

export function urlBuilder(
  endpointId: EnvironmentId,
  id?: ContainerId,
  action?: string
) {
  let url = `/endpoints/${endpointId}/docker/containers`;

  if (id) {
    url += `/${id}`;
  }

  if (action) {
    url += `/${action}`;
  }

  return url;
}
