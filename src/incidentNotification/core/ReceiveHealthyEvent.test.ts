import { buildPersistanceInterfaceAdapterMock } from '../../testUtils/mocks'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { MonitoredService, MonitoredServiceStatus } from './models/MonitoredService'
import { ReceiveHealthyEvent } from './ReceiveHealthyEvent'

describe('ReceiveHealthyEvent', () => {
  let subject: ReceiveHealthyEvent

  let persistanceInterfaceAdapterMock: PersistanceInterface

  beforeEach(() => {
    const returnedMonitoredService = new MonitoredService({
      id: 1,
      status: MonitoredServiceStatus.unhealthy,
    })
    persistanceInterfaceAdapterMock = buildPersistanceInterfaceAdapterMock({
      getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
    })

    subject = new ReceiveHealthyEvent(persistanceInterfaceAdapterMock)
  })

  describe('given a Monitored Service in an Unhealthy state', () => {
    it('sets the Monitored Service in a Healthy state', () => {
      subject.perform({ monitoredServiceId: 1 })
      expect(persistanceInterfaceAdapterMock.markMonitoredServiceAsHealthy).toHaveBeenCalledWith(1)
    })
  })
})
