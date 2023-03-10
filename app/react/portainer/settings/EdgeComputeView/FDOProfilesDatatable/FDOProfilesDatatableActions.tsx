import { useQueryClient } from 'react-query';
import { useRouter } from '@uirouter/react';

import { Profile } from '@/portainer/hostmanagement/fdo/model';
import {
  confirmAsync,
  confirmDestructiveAsync,
} from '@/portainer/services/modal.service/confirm';
import * as notifications from '@/portainer/services/notifications';
import {
  deleteProfile,
  duplicateProfile,
} from '@/portainer/hostmanagement/fdo/fdo.service';

import { Link } from '@@/Link';
import { Button } from '@@/buttons';

interface Props {
  isFDOEnabled: boolean;
  selectedItems: Profile[];
}

export function FDOProfilesDatatableActions({
  isFDOEnabled,
  selectedItems,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div className="actionBar">
      <Link to="portainer.endpoints.profile" className="space-left">
        <Button disabled={!isFDOEnabled} icon="plus-circle" featherIcon>
          Add Profile
        </Button>
      </Link>

      <Button
        disabled={!isFDOEnabled || selectedItems.length !== 1}
        onClick={() => onDuplicateProfileClick()}
        icon="plus-circle"
        featherIcon
      >
        Duplicate
      </Button>

      <Button
        disabled={!isFDOEnabled || selectedItems.length < 1}
        color="danger"
        onClick={() => onDeleteProfileClick()}
        icon="trash-2"
        featherIcon
      >
        Remove
      </Button>
    </div>
  );

  async function onDuplicateProfileClick() {
    const confirmed = await confirmAsync({
      title: '你确定吗？',
      message: '这个动作将复制选定的配置文件。继续吗？',
      buttons: {
        confirm: {
          label: 'Confirm',
          className: 'btn-primary',
        },
      },
    });

    if (!confirmed) {
      return;
    }

    try {
      const profile = selectedItems[0];
      const newProfile = await duplicateProfile(profile.id);
      notifications.success('Profile successfully duplicated', profile.name);
      router.stateService.go('portainer.endpoints.profile.edit', {
        id: newProfile.id,
      });
    } catch (err) {
      notifications.error(
        'Failure',
        err as Error,
        'Unable to duplicate profile'
      );
    }
  }

  async function onDeleteProfileClick() {
    const confirmed = await confirmDestructiveAsync({
      title: '你确定吗？',
      message: '这个动作将删除所选的配置文件。继续吗？',
      buttons: {
        confirm: {
          label: '删除',
          className: 'btn-danger',
        },
      },
    });

    if (!confirmed) {
      return;
    }

    await Promise.all(
      selectedItems.map(async (profile) => {
        try {
          await deleteProfile(profile.id);

          notifications.success('Profile successfully removed', profile.name);
        } catch (err) {
          notifications.error(
            'Failure',
            err as Error,
            'Unable to remove profile'
          );
        }
      })
    );

    await queryClient.invalidateQueries('fdo_profiles');
  }
}
