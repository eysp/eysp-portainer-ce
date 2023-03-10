import { useState } from 'react';

import { useAgentDetails } from '@/portainer/environments/queries/useAgentDetails';

import { CopyButton } from '@@/buttons/CopyButton';
import { Code } from '@@/Code';
import { NavTabs } from '@@/NavTabs';

const deployments = [
  {
    id: 'linux',
    label: 'Linux',
    command: `-v "/var/run/docker.sock:/var/run/docker.sock"`,
  },
  {
    id: 'win',
    label: 'Windows',
    command: '-v \\.\\pipe\\docker_engine:\\.\\pipe\\docker_engine',
  },
];

export function DeploymentScripts() {
  const [deployType, setDeployType] = useState(deployments[0].id);

  const agentDetailsQuery = useAgentDetails();

  if (!agentDetailsQuery) {
    return null;
  }

  const options = deployments.map((c) => ({
    id: c.id,
    label: c.label,
    children: <DeployCode code={c.command} />,
  }));

  return (
    <NavTabs
      options={options}
      onSelect={(id: string) => setDeployType(id)}
      selectedId={deployType}
    />
  );
}

interface DeployCodeProps {
  code: string;
}

function DeployCode({ code }: DeployCodeProps) {
  return (
    <>
      <span className="text-muted small">
      在使用socket套接字时，确保你已经启动了Portainer
        容器，并设置了以下Docker标志。
      </span>

      <Code>{code}</Code>
      <CopyButton copyText={code}>复制命令</CopyButton>
    </>
  );
}
