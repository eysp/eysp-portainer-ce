import { Column } from 'react-table';
import clsx from 'clsx';

import { ownershipIcon } from '@/portainer/filters/filters';
import type { DockerContainer } from '@/react/docker/containers/types';
import { ResourceControlOwnership } from '@/react/portainer/access-control/types';

export const ownership: Column<DockerContainer> = {
  Header: '所有权',
  id: 'ownership',
  accessor: (row) =>
    row.ResourceControl?.Ownership || ResourceControlOwnership.ADMINISTRATORS,
  Cell: OwnershipCell,
  disableFilters: true,
  canHide: true,
  sortType: 'string',
  Filter: () => null,
};

interface Props {
  value: 'public' | 'private' | 'restricted' | 'administrators';
}

function OwnershipCell({ value }: Props) {
  return (
    <>
      <i
        className={clsx(ownershipIcon(value), 'space-right')}
        aria-hidden="true"
      />
      {value || ResourceControlOwnership.ADMINISTRATORS}
    </>
  );
}
