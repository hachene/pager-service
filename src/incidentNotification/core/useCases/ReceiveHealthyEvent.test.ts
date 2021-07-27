import { buildPersistenceInterfaceAdapterMock } from '../../../testUtils/mocks'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { HealthyEvent } from '../models/HealthyEvent'
import { MonitoredService, MonitoredServiceStatus } from '../models/MonitoredService'
import { ReceiveHealthyEvent } from './ReceiveHealthyEvent'

describe('ReceiveHealthyEvent', () => {
  let subject: ReceiveHealthyEvent

  const healthyEvent = new HealthyEvent({ monitoredServiceId: 1 })

  let persistenceInterfaceAdapterMock: PersistenceInterface

  beforeEach(() => {
    const returnedMonitoredService = new MonitoredService({
      id: 1,
      status: MonitoredServiceStatus.unhealthy,
    })
    persistenceInterfaceAdapterMock = buildPersistenceInterfaceAdapterMock({
      getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
    })

    subject = new ReceiveHealthyEvent(persistenceInterfaceAdapterMock)
  })

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in an Unhealthy state', () => {
    it('sets the Monitored Service in a Healthy state', () => {
      subject.perform(healthyEvent)
      expect(persistenceInterfaceAdapterMock.markMonitoredServiceAsHealthy).toHaveBeenCalledWith(1)
    })
  })
})
