import { Column } from 'react-table';
import { useSref } from '@uirouter/react';

import type { DockerContainer } from '@/react/docker/containers/types';
import { isOfflineEndpoint } from '@/portainer/helpers/endpointHelper';

import { useRowContext } from '../RowContext';

export const image: Column<DockerContainer> = {
  Header: '镜像',
  accessor: 'Image',
  id: 'image',
  disableFilters: true,
  Cell: ImageCell,
  canHide: true,
  sortType: 'string',
  Filter: () => null,
};

interface Props {
  value: string;
}

function ImageCell({ value: imageName }: Props) {
  const linkProps = useSref('docker.images.image', { id: imageName });
  const shortImageName = trimSHASum(imageName);

  const { environment } = useRowContext();

  if (isOfflineEndpoint(environment)) {
    return <span>{shortImageName}</span>;
  }

  return (
    <a href={linkProps.href} onClick={linkProps.onClick}>
      {shortImageName}
    </a>
  );

  function trimSHASum(imageName: string) {
    if (!imageName) {
      return '';
    }

    if (imageName.indexOf('sha256:') === 0) {
      return imageName.substring(7, 19);
    }

    return imageName.split('@sha256')[0];
  }
}
