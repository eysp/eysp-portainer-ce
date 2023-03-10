angular.module('portainer.docker').controller('ServicesDatatableActionsController', [
  '$q',
  '$state',
  'ServiceService',
  'ServiceHelper',
  'Notifications',
  'ModalService',
  'ImageHelper',
  'WebhookService',
  function ($q, $state, ServiceService, ServiceHelper, Notifications, ModalService, ImageHelper, WebhookService) {
    const ctrl = this;

    this.scaleAction = function scaleService(service) {
      var config = ServiceHelper.serviceToConfig(service.Model);
      config.Mode.Replicated.Replicas = service.Replicas;
      ServiceService.update(service, config)
        .then(function success() {
          Notifications.success('Service successfully scaled', 'New replica count: ' + service.Replicas);
          $state.reload();
        })
        .catch(function error(err) {
          Notifications.error('失败', err, 'Unable to scale service');
          service.Scale = false;
          service.Replicas = service.ReplicaCount;
        });
    };

    this.removeAction = function (selectedItems) {
      ModalService.confirmDeletion(
        '你想删除选中的服务吗？所有与所选服务相关的容器也将被删除。',
        function onConfirm(confirmed) {
          if (!confirmed) {
            return;
          }
          removeServices(selectedItems);
        }
      );
    };

    this.updateAction = function (selectedItems) {
      ModalService.confirmServiceForceUpdate(
        '你想强制更新所选服务吗？所有与所选服务相关的任务将被重新创建。',
        function (result) {
          if (!result) {
            return;
          }
          var pullImage = false;
          if (result[0]) {
            pullImage = true;
          }
          forceUpdateServices(selectedItems, pullImage);
        }
      );
    };

    function forceUpdateServices(services, pullImage) {
      var actionCount = services.length;
      angular.forEach(services, function (service) {
        var config = ServiceHelper.serviceToConfig(service.Model);
        if (pullImage) {
          config.TaskTemplate.ContainerSpec.Image = ImageHelper.removeDigestFromRepository(config.TaskTemplate.ContainerSpec.Image);
        }

        // As explained in https://github.com/docker/swarmkit/issues/2364 ForceUpdate can accept a random
        // value or an increment of the counter value to force an update.
        config.TaskTemplate.ForceUpdate++;
        ServiceService.update(service, config)
          .then(function success() {
            Notifications.success('Service successfully updated', service.Name);
          })
          .catch(function error(err) {
            Notifications.error('失败', err, 'Unable to force update service' + service.Name);
          })
          .finally(function final() {
            --actionCount;
            if (actionCount === 0) {
              $state.reload();
            }
          });
      });
    }

    function removeServices(services) {
      var actionCount = services.length;
      angular.forEach(services, function (service) {
        ServiceService.remove(service)
          .then(function success() {
            return WebhookService.webhooks(service.Id, ctrl.endpointId);
          })
          .then(function success(data) {
            return $q.when(data.length !== 0 && WebhookService.deleteWebhook(data[0].Id));
          })
          .then(function success() {
            Notifications.success('Service successfully removed', service.Name);
          })
          .catch(function error(err) {
            Notifications.error('失败', err, 'Unable to remove service');
          })
          .finally(function final() {
            --actionCount;
            if (actionCount === 0) {
              $state.reload();
            }
          });
      });
    }
  },
]);
