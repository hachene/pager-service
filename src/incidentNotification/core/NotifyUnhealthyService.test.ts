import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { Alert } from './models/Alert'
import { MonitoredService, MonitoredServiceStatus } from './models/MonitoredService'
import { NotifyUnhealthyService } from './NotifyUnhealthyService'

describe('NotifyUnhealthyService', () => {
  let subject: NotifyUnhealthyService
  let monitoredService: MonitoredService
  let alert: Alert
  let markMonitoredServiceAsUnhealthyMock: jest.Mock<any, any>

  beforeAll(() => {
    markMonitoredServiceAsUnhealthyMock = jest.fn()
    const persistanceAdapterMock: PersistanceInterface = {
      markMonitoredServiceAsUnhealthy: markMonitoredServiceAsUnhealthyMock,
    }

    subject = new NotifyUnhealthyService(persistanceAdapterMock)
  })

  describe('given a Monitored Service in an Healthy State', () => {
    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeAll(() => {
        monitoredService = new MonitoredService({
          id: 1,
          status: MonitoredServiceStatus.healthy,
        })

        alert = new Alert({
          monitoredServiceId: 1,
        })
      })

      it('the Monitored Service becomes unhealthy', () => {
        subject.perform(alert)

        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledTimes(1)
        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledWith(alert.monitoredServiceId)
      })
    })
  })
})
